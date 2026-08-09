using backend.DTO;
using backend.DTO.JobDTO;
using backend.models;

namespace backend.Services.Jobs;

public interface IJobService
{
    public Task<ServiceResult<UserJob?>> SaveJobAsync(JobSentDto jobSent, string userId);
    public Task<ServiceResult<JobWithFeedbacksPreview?>> GetJobByIdAsync(int jobId, string userId);
    public Task<ServiceResult<int?>> AnalyzeResumeToJob(int resumeId, int jobId, string userId);
    public Task<ServiceResult<AnalyzedJobDto?>> GetJobAnalysisByFeedbackId(int feedbackId, string userId);

    public Task<ServiceResult<List<JobFeedbackMinimalDto>>> GetAllJobFeedbacks(string userId, int? resumeId = null,
        int? jobId = null);

    public Task<ServiceResult<List<JobWithFeedbacksPreview>>> GetJobsWithFeedbacks(string userId);

    public Task<ServiceResult<List<JobWithBestMatchPreview>>> GetAllJobsWithBestMatch(string userId);

    public Task<ServiceResult<UpdateJobStatusDto?>> UpdateJobStatus(string userId, int jobId,
        UpdateJobStatusDto jobStatusDto);


    public Task<ServiceResult> UpdateJob(string userId, int jobId, JobSentDto jobUpdate);

    public Task<ServiceResult> DeleteJob(string userId, int jobId);
}