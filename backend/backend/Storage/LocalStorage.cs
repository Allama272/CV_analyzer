using System.Reflection.PortableExecutable;
using Microsoft.Build.Evaluation;

namespace backend.Services;

public class LocalStorage : IStorage
{
    // assumes the file is valid
    // returns file name
    // private const string UploadPath = Path.Combine(Directory.GetCurrentDirectory(), )
    public async Task<string> SaveFileAsync(IFormFile file)
    {
        string extension = Path.GetExtension(file.FileName);
        string fileName = Guid.NewGuid().ToString() + extension;
        string path = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "resumes");
        using (FileStream stream = new FileStream(Path.Combine(path, fileName), FileMode.Create, FileAccess.Write))
        {
            await file.CopyToAsync(stream);
        }

        return fileName;
    }

    public async Task<string> SavePreviewAsync(Stream stream)
    {
        string previewFileName = Guid.NewGuid().ToString() + ".png";
        string filePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "preview", previewFileName);
        using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
        {
            await stream.CopyToAsync(fileStream);
        }

        return previewFileName;
    }

    public async Task<string> SaveThumbnailAsync(Stream thumbnailStream)
    {
        string thumbFileName = Guid.NewGuid().ToString() + ".png";
        string filePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "thumbnail", thumbFileName);
        using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
        {
            await thumbnailStream.CopyToAsync(fileStream);
        }

        return thumbFileName;
    }

    public Task<Stream> GetResumeStreamAsync(string filePath)
    {
        string basePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "resumes");
        string completePath = Path.Combine(basePath, filePath);
        if (!File.Exists(completePath))
        {
            return Task.FromResult<Stream>(null);
        }

        return Task.FromResult<Stream>(new FileStream(completePath, FileMode.Open, FileAccess.Read));
    }
}