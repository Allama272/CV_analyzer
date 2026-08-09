using System.Reflection.PortableExecutable;
using System.Runtime.InteropServices.Swift;
using Microsoft.Build.Evaluation;

namespace backend.Services;

public class LocalStorage : IStorage
{
    private readonly string _baseUploadPath;

    public LocalStorage()
        : this(Path.Combine(Directory.GetCurrentDirectory(), "uploads"))
    {
    }

    public LocalStorage(string baseUploadPath)
    {
        _baseUploadPath = baseUploadPath;
    }

    private const string ResumeFolder = "resumes";
    private const string PreviewFolder = "preview";
    private const string ThumbnailFolder = "thumbnail";
    private const string ResumeTextFolder = "text";
    private const string TextExtension = ".txt";
    private const string PhotoExtension = ".png";

    private async Task<string> SaveStreamAsync(Stream stream, string folder, string extension)
    {
        string fileName = Guid.NewGuid() + extension;

        string directory = Path.Combine(_baseUploadPath, folder);
        Directory.CreateDirectory(directory);
        string path = Path.Combine(directory, fileName);

        await using FileStream fileStream = new(path, FileMode.Create, FileAccess.Write);
        await stream.CopyToAsync(fileStream);

        return fileName;
    }

    public async Task<string> SaveResumeAsync(IFormFile file)
    {
        string extension = Path.GetExtension(file.FileName);
        await using var stream = file.OpenReadStream();
        return await SaveStreamAsync(stream, ResumeFolder, extension);
    }

    public Task<string> SavePreviewAsync(Stream stream)
        => SaveStreamAsync(stream, PreviewFolder, PhotoExtension);

    public Task<string> SaveThumbnailAsync(Stream thumbnailStream)
        => SaveStreamAsync(thumbnailStream, ThumbnailFolder, PhotoExtension);

    public Task<string> SaveResumeTextAsync(Stream textStream)
        => SaveStreamAsync(textStream, ResumeTextFolder, TextExtension);

    private Task<Stream> GetStreamAsync(string filePath, string folder)
    {
        // basic file path protection
        if (string.IsNullOrWhiteSpace(filePath) || filePath.Contains(".."))
            return Task.FromResult<Stream>(null!);

        string completePath = Path.Combine(_baseUploadPath, folder, filePath);
        if (!File.Exists(completePath))
        {
            return Task.FromResult<Stream>(null!);
        }

        return Task.FromResult<Stream>(new FileStream(completePath, FileMode.Open, FileAccess.Read));
    }

    public async Task<string> GetResumeTextAsync(string filePath)
    {
        var textStream = await GetStreamAsync(filePath, ResumeTextFolder);
        using (var reader = new StreamReader(textStream))
        {
            return await reader.ReadToEndAsync();
        }
    }

    public Task<Stream> GetResumeFileStreamAsync(string filePath)
        => GetStreamAsync(filePath, ResumeFolder);
}