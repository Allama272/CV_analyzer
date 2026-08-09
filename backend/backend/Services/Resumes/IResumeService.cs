using backend.DTO;

namespace backend.Services.Resumes;

public interface IResumeService
{
    public Task<FileUploadResult> UploadResume(IFormFile file, string userId, string title);
    public Task<List<ResumePreviewDto>>? GetAllResumesPreview(string userId);
    public Task<AnalyzedResumeDto>? GetResumeAnalysis(string resumeId, string userId);

    public Task<ServiceResult> DeleteResume(string userId, int resumeId);

    public Task<ServiceResult<List<ResumeJobMatchDto>>> GetResumeJobsAnalyzed(string userId, int resumeId);
}