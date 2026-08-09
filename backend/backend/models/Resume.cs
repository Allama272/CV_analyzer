using System.ComponentModel.DataAnnotations;

namespace backend.models;

public class Resume
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string ImagePreviewUrl { get; set; } = string.Empty;
    public string ImageThumbnailUrl { get; set; } = string.Empty;
    public string ParsedTextUrl { get; set; } = string.Empty;
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;

    // Navigation
    public ResumeFeedback Feedbacks { get; set; } 
    
    public string UserId { get; set; }
}