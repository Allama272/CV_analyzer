using backend.DTO;

namespace backend.Services;

public interface IResumeService
{
    public Task<FileUploadResult> UploadResume(IFormFile file, string userId, string title);
    public Task<List<ResumePreviewDto>>? GetAllResumesPreview(string userId);
}