using backend.Data;
using backend.DTO;
using backend.Helpers;
using backend.models;
using Hangfire;

namespace backend.Services;

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
        string fileName = await _storage.SaveFileAsync(file);
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
            Status = ProcessingStatus.Pending
        };
        _dbContext.Resumes.Add(resume);
        _dbContext.ResumeFeedbacks.Add(resumeFeedback);
        await _dbContext.SaveChangesAsync();

        // begin analysis
        _backgroundJobClient.Enqueue<IAtsService>(service => service.AnalyzeResume(resume.Id));
        return new FileUploadResult
        {
            IsSuccess = true,
            Message = "Resume Uploaded Successfully"
        };
    }
}