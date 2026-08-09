namespace backend.DTO;

public class ResumeJobMatchDto
{
    public int FeedbackId { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; }
    public string Company { get; set; }
    public int OverallMatchScore { get; set; }
}