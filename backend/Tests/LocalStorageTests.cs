using System.Text;
using backend.Services;

namespace Tests;

public class LocalStorageTests : IDisposable
{
    private readonly string _testRoot;
    private readonly LocalStorage _storage;

    public LocalStorageTests()
    {
        _testRoot = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(_testRoot);
        _storage = new LocalStorage(_testRoot);
    }

    public void Dispose()
    {
        if (Directory.Exists(_testRoot))
            Directory.Delete(_testRoot, true);
    }
    
    [Fact]
    public async Task SaveResumeAsync_ValidFile_ReturnsFileNameAndCreatesFile()
    {
        // Arrange
        byte[] content = Encoding.UTF8.GetBytes("Fake resume content");
        var file = new FakeFormFile("myresume.pdf", content);

        // Act
        string fileName = await _storage.SaveResumeAsync(file);

        // Assert
        Assert.False(string.IsNullOrEmpty(fileName));
        Assert.EndsWith(".pdf", fileName);  // extension preserved
        string fullPath = Path.Combine(_testRoot, "resumes", fileName);
        Assert.True(File.Exists(fullPath));
        byte[] savedBytes = await File.ReadAllBytesAsync(fullPath);
        Assert.Equal(content, savedBytes);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("   ")]
    [InlineData("../psw")]
    public async Task GetResumeStreamAsync(string badPath)
    {
        Stream result = await _storage.GetResumeFileStreamAsync(badPath);
        Assert.Null(result);
    }

    [Fact]
    public async Task SaveTextStreamAsync()
    {
        // Arrange
        string originalText = "Fake resume content";
        byte[] content = Encoding.UTF8.GetBytes(originalText);
        using var stream = new MemoryStream(content);
        
        // Act
        string fileName = await _storage.SaveResumeTextAsync(stream);
        
        // Assert
        Assert.EndsWith(".txt", fileName);
        string fullPath = Path.Combine(_testRoot, "text", fileName);
        Assert.True(File.Exists(fullPath));
        
        string savedText = await File.ReadAllTextAsync(fullPath);
        Assert.Equal(originalText, savedText);
    }
}
