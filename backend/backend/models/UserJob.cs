namespace backend.models;

public class UserJob
{
    public int Id { get; set; }
    public string JobTitle { get; set; }
    public string Company { get; set; }
    public string JobDescription { get; set; }

    public string? LogoUrl { get; set; }

    public DateTime UploadDate { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; }
    public JobStatus Status { get; set; }

    public virtual ICollection<ResumeJobFeedback> Feedbacks { get; set; } = new List<ResumeJobFeedback>();
}

public enum JobStatus
{
    Saved,
    Applied,
    Interviewing,
    Offered,
    Rejected,
    Archived
}