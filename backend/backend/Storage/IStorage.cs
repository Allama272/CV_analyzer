namespace backend.Services;

public interface IStorage
{
    public Task<string> SaveResumeAsync(IFormFile file);
    public Task<string> SavePreviewAsync(Stream stream);
    public Task<string> SaveThumbnailAsync(Stream thumbnailStream);
    public Task<string> SaveResumeTextAsync(Stream textStream);
    public Task<string> GetResumeTextAsync(string filePath);
    public Task<Stream> GetResumeFileStreamAsync(string filePath);
}