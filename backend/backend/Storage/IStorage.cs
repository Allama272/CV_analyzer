namespace backend.Services;

public interface IStorage
{
    public Task<string> SaveFileAsync(IFormFile file);
    public Task<string> SavePreviewAsync(Stream stream);
    public Task<string> SaveThumbnailAsync(Stream thumbnailStream);
    public Task<Stream> GetResumeStreamAsync(string filePath);
}