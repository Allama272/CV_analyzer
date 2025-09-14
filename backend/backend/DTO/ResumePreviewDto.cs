namespace backend.DTO;

public class ResumePreviewDto
{
    public int ResumeId { get; set; }
    public string ResumeTitle { get; set; }
    public string ResumePreviewUrl { get; set; }
    public int ResumeOverallScore { get; set; }
    public DateTime ResumeUploadDate { get; set; }
}