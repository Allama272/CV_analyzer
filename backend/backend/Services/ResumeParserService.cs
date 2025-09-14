using System.Text;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;

namespace backend.Services;

public class ResumeParserService : IResumeParserService
{
    public async Task<string> ExtractTextAsync(Stream fileStream, string fileName)
    {
        string extension = Path.GetExtension(fileName.ToLowerInvariant());

        switch (extension)
        {
            case ".pdf":
                return await ExtractFromPdfAsync(fileStream);
            default:
                throw new NotSupportedException($"file type of {extension} is not supported");
        }
    }

    public Task<string> ExtractFromPdfAsync(Stream fileStream)
    {
        var stringBuilder = new StringBuilder();
        using (var pdfReader = new PdfReader(fileStream))
        using (var pdfDocument = new PdfDocument(pdfReader))
            for (int page = 1; page <= pdfDocument.GetNumberOfPages(); page++)
            {
                ITextExtractionStrategy strategy = new SimpleTextExtractionStrategy();
                string currentPageText = PdfTextExtractor.GetTextFromPage(pdfDocument.GetPage(page), strategy);
                stringBuilder.Append(currentPageText);
            }

        return Task.FromResult(stringBuilder.ToString());
    }
}