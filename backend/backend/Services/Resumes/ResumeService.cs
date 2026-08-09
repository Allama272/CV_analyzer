using backend.Data;
using backend.DTO;
using backend.Helpers;
using backend.models;
using backend.Services.Analysis;
using Hangfire;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Resumes;

public class ResumeService : IResumeService
{
    private readonly IStorage _storage;
    private readonly ResumeDbContext _dbContext;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public ResumeService(IStorage storage, ResumeDbContext dbContext, IBackgroundJobClient backgroundJobClient)
    {
        _storage = storage;
        _dbContext = dbContext;
        _backgroundJobClient = backgroundJobClient;
    }

    public async Task<FileUploadResult> UploadResume(IFormFile file, string userId, string title)
    {
        //validation
        var validationResult = FileValid.IsValid(file);
        if (!validationResult.IsValid)
        {
            return new FileUploadResult
            {
                IsSuccess = false,
                Message = validationResult.ErrorMessage
            };
        }

        //saving to storage
        string fileName = await _storage.SaveResumeAsync(file);
        var (fullPreviewStream, thumbnailStream) = await new PdfPreviewGenerator().GeneratePreviewAsync(file);
        string previewFileName = await _storage.SavePreviewAsync(fullPreviewStream);
        string thumbnailFileName = await _storage.SaveThumbnailAsync(thumbnailStream);

        // saving to db
        var resume = new Resume
        {
            Title = title,
            FileUrl = fileName,
            ImagePreviewUrl = previewFileName,
            ImageThumbnailUrl = thumbnailFileName,
            UserId = userId
        };
        var resumeFeedback = new ResumeFeedback
        {
            Resume = resume,
            Status = ProcessingStatus.Pending,
            UserId = userId
        };

        _dbContext.Resumes.Add(resume);
        _dbContext.ResumeFeedbacks.Add(resumeFeedback);
        await _dbContext.SaveChangesAsync();

        // begin analysis
        _backgroundJobClient.Enqueue<IAtsService>(service => service.AnalyzeResume(resume.Id));
        return new FileUploadResult
        {
            IsSuccess = true,
            UploadedId = resume.Id,
            Message = "Resume Uploaded Successfully"
        };
    }

    public async Task<List<ResumePreviewDto>>? GetAllResumesPreview(string userId)
    {
        var result = await _dbContext.Resumes.Where(r => r.UserId == userId)
            .Where(r => r.Feedbacks != null && r.Feedbacks.Status != ProcessingStatus.Failed)
            .Select(r => new ResumePreviewDto
            {
                ResumeId = r.Id,
                ResumeOverallScore = r.Feedbacks!.OverallScore,
                ResumeThumbnailUrl = GenerateThumbnailUrl(r.ImageThumbnailUrl),
                ResumePdfUrl = r.FileUrl,
                ResumeTitle = r.Title,
                ResumeUploadDate = r.UploadDate
            })
            .OrderByDescending(r => r.ResumeUploadDate)
            .ToListAsync();
        return result;
    }

    public async Task<AnalyzedResumeDto>? GetResumeAnalysis(string resumeId, string userId)
    {
        if (!Int32.TryParse(resumeId, out int resumeIdInt))
        {
            return null;
        }

        var resumeFeedback = await _dbContext.ResumeFeedbacks
            .Where(r => r.ResumeId == resumeIdInt && r.Resume.UserId == userId)
            .Select(r => new AnalyzedResumeDto
            {
                Ats = r.Ats,
                ContentQuality = r.ContentQuality,
                Formatting = r.Formatting,
                OverallScore = r.OverallScore,
                SkillsCoverage = r.SkillsCoverage,
                Structure = r.Structure,
                resumeImageUrl = r.Resume.ImagePreviewUrl,
                Status = r.Status
            }).FirstOrDefaultAsync();
        return resumeFeedback;
    }

    public async Task<ServiceResult> DeleteResume(string userId, int resumeId)
    {
        var rowsAffected = await _dbContext.Resumes.Where(r => r.Id == resumeId && r.UserId == userId)
            .ExecuteDeleteAsync();
        return rowsAffected == 0
            ? ServiceResult.Failure("Job Not Found")
            : ServiceResult.Success();
    }

    public async Task<ServiceResult<List<ResumeJobMatchDto>>> GetResumeJobsAnalyzed(string userId, int resumeId)
    {
        var jobsFeedbacks = await _dbContext.ResumeJobFeedbacks
            .Where(f => f.UserId == userId && f.ResumeId == resumeId && f.Status == ProcessingStatus.Completed)
            .Select(f => new ResumeJobMatchDto
            {
                JobId = f.UserJobId,
                JobTitle = f.UserJob.JobTitle,
                Company = f.UserJob.Company,
                FeedbackId = f.Id,
                OverallMatchScore = f.OverallMatchScore
            }).ToListAsync();
        return ServiceResult<List<ResumeJobMatchDto>>.Success(jobsFeedbacks);
    }

    static private string GenerateThumbnailUrl(string preview)
    {
        //TODO: make this method after choosing the storage, get the storage from the env maybe
        return preview;
    }
}