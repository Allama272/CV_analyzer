using backend.DTO;

namespace backend.Helpers;

public static class FileValid
{
    private const long MaxSize = 20 * 1024 * 1024; // 20mb

    public static ValidationResult IsValid(IFormFile file)
    {
        //check extension
        List<string> validExtensions = new List<string>() { ".pdf" };
        string extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!validExtensions.Contains(extension))
        {
            return new ValidationResult(false, "Invalid file extension. Only .pdf files are allowed.");
        }

        // check size
        long size = file.Length;
        if (size > MaxSize)
        {
            return new ValidationResult(false, "File size exceeds the maximum limit of 20MB");
        }

        return new ValidationResult(true);
    }
}