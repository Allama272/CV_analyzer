using backend.Data;
using backend.DTO;
using backend.DTO.JobDTO;
using backend.models;
using backend.Services.Analysis;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.JSInterop.Implementation;

namespace backend.Services.Jobs;

public class JobService : IJobService
{
    private ResumeDbContext _dbContext;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly IMediator _mediator;

    public JobService(ResumeDbContext dbContext, IBackgroundJobClient backgroundJobClient, IMediator mediator)
    {
        _dbContext = dbContext;
        _backgroundJobClient = backgroundJobClient;
        _mediator = mediator;
    }

    public async Task<ServiceResult<UserJob?>> SaveJobAsync(JobSentDto jobSent, string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return ServiceResult<UserJob?>.Failure("User ID is missing.");
        }

        var userJob = new UserJob
        {
            Company = jobSent.Company,
            JobTitle = jobSent.JobTitle,
            JobDescription = jobSent.JobDescription,
            UserId = userId,
            Status = jobSent.Status,
            LogoUrl = jobSent.LogoUrl,
        };

        try
        {
            _dbContext.UserJobs.Add(userJob);
            await _dbContext.SaveChangesAsync();
            await _mediator.Publish(new JobAddedEvent(userJob.Id, userId));
            return ServiceResult<UserJob?>.Success(userJob);
        }
        catch (DbUpdateException ex)
        {
            return ServiceResult<UserJob>.Failure("Failed to save job due to a database error.");
        }
    }

    public async Task<ServiceResult<JobWithFeedbacksPreview?>> GetJobByIdAsync(
        int jobId,
        string userId
    )
    {
        var job = await _dbContext
            .UserJobs.Where(uj => uj.Id == jobId && uj.UserId == userId)
            .Select(j => new JobWithFeedbacksPreview
            {
                JobId = j.Id,
                Company = j.Company,
                JobTitle = j.JobTitle,
                JobDescription = j.JobDescription,
                LogoUrl = j.LogoUrl,
                uploadDate = j.UploadDate,
                Status = j.Status,
                Archived = j.Archived,
                Feedbacks = j
                    .Feedbacks.Where(f => f.Status == ProcessingStatus.Completed)
                    .Select(f => new JobFeedbackMinimalDto
                    {
                        ResumeId = f.ResumeId,
                        FeedbackId = f.Id,
                        OverAllMatchScore = f.OverallMatchScore,
                        ResumeThumbnailUrl = f.Resume.ImageThumbnailUrl,
                        ResumeTitle = f.Resume.Title,
                    }),
            })
            .FirstOrDefaultAsync();
        return job == null
            ? ServiceResult<JobWithFeedbacksPreview?>.Failure("Resume or Job Not Found")
            : ServiceResult<JobWithFeedbacksPreview?>.Success(job);
    }

    /// <summary>
    ///  Starts a jobResume analysis background job
    /// </summary>
    /// <param name="resumeId">ID of chosen resume</param>
    /// <param name="jobId">ID of chosen job</param>
    /// <param name="userId"></param>
    /// <returns>ID of ResumeJobFeedback object that was created</returns>
    public async Task<ServiceResult<int?>> AnalyzeResumeToJob(
        int resumeId,
        int jobId,
        string userId
    )
    {
        // ownership verification
        var resumeExist = await _dbContext.Resumes.AnyAsync(r =>
            r.Id == resumeId && r.UserId == userId
        );
        var jobExist = await _dbContext.UserJobs.AnyAsync(j => j.Id == jobId && j.UserId == userId);
        if (!resumeExist || !jobExist)
        {
            return ServiceResult<int?>.Failure("Resume or Job Not Found");
        }

        // If feedback Exist, return the feedback id, else make the object and start the job
        var existingFeedback = await _dbContext.ResumeJobFeedbacks.FirstOrDefaultAsync(r =>
            r.ResumeId == resumeId && r.UserJobId == jobId
        );
        if (existingFeedback != null)
        {
            //if failed, retry it, else return the object id
            if (existingFeedback.Status != ProcessingStatus.Failed)
                return ServiceResult<int?>.Success(existingFeedback.Id);

            existingFeedback.Status = ProcessingStatus.Pending;
            await _dbContext.SaveChangesAsync();
            _backgroundJobClient.Enqueue<IAtsService>(service =>
                service.AnalyzeJobResume(existingFeedback.Id)
            );

            return ServiceResult<int?>.Success(existingFeedback.Id);
        }

        var feedbackJob = new ResumeJobFeedback
        {
            ResumeId = resumeId,
            UserJobId = jobId,
            Status = ProcessingStatus.Pending,
            UserId = userId,
        };
        _dbContext.ResumeJobFeedbacks.Add(feedbackJob);

        // In case of another job with same ids running at the same time, check race condition to handle duplicate
        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateException e)
        {
            Console.WriteLine(e.Message);
            var raceConditionId = await _dbContext
                .ResumeJobFeedbacks.Where(r => r.ResumeId == resumeId && r.UserJobId == jobId)
                .Select(r => (int?)r.Id)
                .FirstOrDefaultAsync();
            if (raceConditionId == null)
            {
                return ServiceResult<int?>.Failure(
                    "A concurrent request is processing this resume, but the database ID could not be retrieved. Please try again."
                );
            }

            return ServiceResult<int?>.Success(raceConditionId);
        }

        _backgroundJobClient.Enqueue<IAtsService>(service =>
            service.AnalyzeJobResume(feedbackJob.Id)
        );
        return ServiceResult<int?>.Success(feedbackJob.Id);
    }

    public async Task<ServiceResult<AnalyzedJobDto?>> GetJobAnalysisByFeedbackId(
        int feedbackId,
        string userId
    )
    {
        var jobFeedback = await _dbContext
            .ResumeJobFeedbacks.Where(r => r.Id == feedbackId && r.UserId == userId)
            .Select(r => new AnalyzedJobDto
            {
                OverallScore = r.OverallMatchScore,
                AtsCompatibility = r.AtsCompatibility,
                EducationAlignment = r.EducationAlignment,
                ExperienceAlignment = r.ExperienceAlignment,
                KeywordMatch = r.KeywordMatch,
                resumeImageUrl = r.Resume.ImagePreviewUrl,
                SkillsMatch = r.SkillsMatch,
                Status = r.Status,
            })
            .FirstOrDefaultAsync();

        return jobFeedback is null
            ? ServiceResult<AnalyzedJobDto?>.Failure("Feedback Not Found")
            : ServiceResult<AnalyzedJobDto?>.Success(jobFeedback);
    }

    public async Task<ServiceResult<List<JobFeedbackMinimalDto>>> GetAllJobFeedbacks(
        string userId,
        int? resumeId = null,
        int? jobId = null
    )
    {
        IQueryable<ResumeJobFeedback> query = _dbContext.ResumeJobFeedbacks.AsQueryable();
        query = query.Where(f => f.UserId == userId);
        if (resumeId.HasValue)
        {
            query = query.Where(f => f.ResumeId == resumeId);
        }

        if (jobId.HasValue)
        {
            query = query.Where(f => f.UserJobId == jobId);
        }

        var result = await query
            .Select(f => new JobFeedbackMinimalDto
            {
                FeedbackId = f.Id,
                OverAllMatchScore = f.OverallMatchScore,
                ResumeId = f.ResumeId,
                ResumeTitle = f.Resume.Title,
                ResumeThumbnailUrl = f.Resume.ImageThumbnailUrl,
            })
            .ToListAsync();

        return ServiceResult<List<JobFeedbackMinimalDto>>.Success(result);
    }

    public async Task<ServiceResult<List<JobWithBestMatchPreview>>> GetAllJobsWithBestMatch(
        string userId
    )
    {
        var result = await _dbContext
            .UserJobs.Where(j => j.UserId == userId)
            .Select(j => new JobWithBestMatchPreview
            {
                JobId = j.Id,
                Company = j.Company,
                JobTitle = j.JobTitle,
                LogoUrl = j.LogoUrl,
                Status = j.Status,
                Archived = j.Archived,
                ResumeCount = j.Feedbacks.Count(),
                BestMatchScore = j.Feedbacks.Max(f => (int?)f.OverallMatchScore),
                CreatedAt = j.UploadDate,
            })
            .ToListAsync();

        return ServiceResult<List<JobWithBestMatchPreview>>.Success(result);
    }

    public async Task<ServiceResult<List<JobWithFeedbacksPreview>>> GetJobsWithFeedbacks(
        string userId
    )
    {
        var result = await _dbContext
            .UserJobs.Where(j => j.UserId == userId)
            .Select(j => new JobWithFeedbacksPreview
            {
                JobId = j.Id,
                Company = j.Company,
                JobTitle = j.JobTitle,
                Status = j.Status,
                Archived = j.Archived,

                Feedbacks = j
                    .Feedbacks.Select(f => new JobFeedbackMinimalDto
                    {
                        FeedbackId = f.Id,
                        ResumeId = f.ResumeId,
                        ResumeTitle = f.Resume.Title,
                        ResumeThumbnailUrl = f.Resume.ImageThumbnailUrl,
                        OverAllMatchScore = f.OverallMatchScore,
                    })
                    .ToList(),
            })
            .ToListAsync();
        return ServiceResult<List<JobWithFeedbacksPreview>>.Success(result);
    }

    public async Task<ServiceResult<UpdateJobStatusDto?>> UpdateJobStatus(
        string userId,
        int jobId,
        UpdateJobStatusDto jobStatusDto
    )
    {
        var rowsAffected = await _dbContext
            .UserJobs.Where(j => j.Id == jobId && j.UserId == userId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(j => j.Status, jobStatusDto.Status));
        if (rowsAffected == 0)
        {
            return ServiceResult<UpdateJobStatusDto?>.Failure("Job Not Found");
        }

        await _mediator.Publish(new JobUpdatedEvent(jobId, userId));
        return ServiceResult<UpdateJobStatusDto?>.Success(jobStatusDto);
    }


    public async Task<ServiceResult> UpdateJob(string userId, int jobId, JobSentDto jobUpdate)
    {
        var existingJob = await _dbContext.UserJobs.FirstOrDefaultAsync(j =>
            j.UserId == userId && j.Id == jobId
        );
        if (existingJob == null)
        {
            return ServiceResult.Failure("Job Not Found");
        }

        existingJob.JobTitle = jobUpdate.JobTitle;
        existingJob.JobDescription = jobUpdate.JobDescription;
        existingJob.Company = jobUpdate.Company;
        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // Handle race conditions where the record was deleted/modified mid-flight
            if (!JobExists(jobId))
            {
                return ServiceResult.Failure("Job Not Found");
            }
            else
            {
                throw;
            }
        }

        return ServiceResult.Success();
    }

    private bool JobExists(int id)
    {
        return _dbContext.UserJobs.Any(e => e.Id == id);
    }

    public async Task<ServiceResult> DeleteJob(string userId, int jobId)
    {
        var rowsAffected = await _dbContext
            .UserJobs.Where(j => j.Id == jobId && j.UserId == userId)
            .ExecuteDeleteAsync();
        if (rowsAffected == 0)
        {
            return ServiceResult.Failure("Job Not Found");
        }        
        await _mediator.Publish(new JobRemovedEvent(jobId, userId));
        return ServiceResult.Success();
    }

    public async Task<ServiceResult> HandleArchiveJob(string userId, int jobId, bool archive)
    {
        var rowsAffected = await _dbContext
            .UserJobs.Where(j => j.Id == jobId && j.UserId == userId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(j => j.Archived, archive));
        
        if (rowsAffected == 0)
        {
            return ServiceResult.Failure("Job Not Found");
        }        
        await _mediator.Publish(new JobUpdatedEvent(jobId, userId));
        return ServiceResult.Success();
    }
}