using System.Diagnostics;
using backend.models;

namespace backend.DTO.JobDTO;

public class JobWithFeedbacksPreview
{
    public int JobId { get; set; }
    public string Company { get; set; }
    public string JobTitle { get; set; }
    public string JobDescription { get; set; }
    public string? LogoUrl { get; set; }
    public JobStatus Status { get; set; }

    public bool Archived { get; set; }
    public DateTime uploadDate { get; set; }

    public IEnumerable<JobFeedbackMinimalDto> Feedbacks { get; set; }
}

public class JobFeedbackMinimalDto
{
    public required int FeedbackId { get; set; }
    public required int OverAllMatchScore { get; set; }
    public required int ResumeId { get; set; }
    public required string ResumeTitle { get; set; }
    public required string ResumeThumbnailUrl { get; set; }
}

public class JobWithBestMatchPreview
{
    public int JobId { get; set; }
    public string Company { get; set; }
    public string JobTitle { get; set; }
    public string? LogoUrl { get; set; }
    public JobStatus Status { get; set; }
    public bool Archived { get; set; }
    public int? BestMatchScore { get; set; }
    public int ResumeCount { get; set; }
    public DateTime CreatedAt { get; set; }
}