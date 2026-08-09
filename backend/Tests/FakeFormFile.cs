using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace Tests;

public class FakeFormFile : IFormFile
{
    private readonly byte[] _content;
    private readonly string _fileName;

    public FakeFormFile(string fileName, byte[] content)
    {
        _fileName = fileName;
        _content = content;
    }

    public string ContentType => "application/octet-stream";
    public string ContentDisposition => null;
    public IHeaderDictionary Headers => new HeaderDictionary();
    public long Length => _content.Length;
    public string Name => "file";
    public string FileName => _fileName;

    public void CopyTo(Stream target)
    {
        target.Write(_content, 0, _content.Length);
    }

    public async Task CopyToAsync(Stream target, CancellationToken cancellationToken = default)
    {
        await target.WriteAsync(_content, 0, _content.Length, cancellationToken);
    }

    public Stream OpenReadStream()
    {
        return new MemoryStream(_content);
    }
}
