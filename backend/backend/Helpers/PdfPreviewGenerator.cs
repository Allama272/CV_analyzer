using ImageMagick;

namespace backend.Helpers;

public class PdfPreviewGenerator
{
    public async Task<(MemoryStream fullPreviewStream, MemoryStream thumbnailStream)> GeneratePreviewAsync(IFormFile pdfFile)
    {
        var fullPreviewStream = new MemoryStream();
        var thumbnailStream = new MemoryStream();
        
        using (var images = new MagickImageCollection())
        {
            // Define settings for the initial high-quality read
            var settings = new MagickReadSettings
            {
                Density = new Density(300, 300), // Read at high DPI for quality
                BackgroundColor = MagickColors.White // Set background color for transparent areas
            };
            
            // Read only the first page of the PDF at high quality
            await images.ReadAsync(pdfFile.OpenReadStream(), settings);
            var sourceImage = images[0];
            
            // Ensure the image has a white background (flatten transparency)
            sourceImage.BackgroundColor = MagickColors.White;
            sourceImage.Alpha(AlphaOption.Remove); // Remove alpha channel
            
            // Create the full-size preview ( 1200px wide)
            // By setting height to 0, ImageMagick maintains the aspect ratio
            sourceImage.Resize(new MagickGeometry(1200, 0));
            await sourceImage.WriteAsync(fullPreviewStream, MagickFormat.Png);
            
            // Create the thumbnail preview  
            // This resizes the already-resized 1200px image, which is fast
            sourceImage.Resize(new MagickGeometry(300, 0));
            await sourceImage.WriteAsync(thumbnailStream, MagickFormat.Png);
        }
        
        // Reset stream positions before they are used
        fullPreviewStream.Position = 0;
        thumbnailStream.Position = 0;
        
        return (fullPreviewStream, thumbnailStream);
    }
}
