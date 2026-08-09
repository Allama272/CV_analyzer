namespace backend.DTO;

public class ResumePreviewDto
{
    public int ResumeId { get; set; }
    public string ResumeTitle { get; set; }
    public string ResumeThumbnailUrl { get; set; }
    public string ResumePdfUrl { get; set; }
    public int ResumeOverallScore { get; set; }
    public DateTime ResumeUploadDate { get; set; }

}