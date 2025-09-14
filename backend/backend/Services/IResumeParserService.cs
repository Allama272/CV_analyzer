namespace backend.Services;

public interface IResumeParserService
{
    /// <summary>
    /// Extracts plain text from the resume
    /// </summary>
    /// <param name="fileStream"> The stream of the Uploaded File. </param>
    /// <param name="fileName"> The original name of the file, used to determine the file Type for the parsing </param>
    Task<string> ExtractTextAsync(Stream fileStream, string fileName);
}