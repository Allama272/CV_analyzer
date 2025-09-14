using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.VisualStudio.Web.CodeGeneration.EntityFrameworkCore;

namespace backend.models;

public class ResumeFeedback
{
    public int Id { get; set; }
    public int ResumeId { get; set; }
    public virtual Resume Resume { get; set; } = null!;

    public int OverallScore { get; set; }

    // Store complex objects as JSON columns
    [Column(TypeName = "json")] public FeedbackModels.AtsFeedback Ats { get; set; } = new();

    [Column(TypeName = "json")] public FeedbackModels.ContentFeedback Formatting { get; set; } = new();

    [Column(TypeName = "json")] public FeedbackModels.ContentFeedback ContentQuality { get; set; } = new();

    [Column(TypeName = "json")] public FeedbackModels.ContentFeedback Structure { get; set; } = new();

    [Column(TypeName = "json")] public FeedbackModels.SkillsCoverageFeedback SkillsCoverage { get; set; } = new();

    // Meta fields remain the same
    public ProcessingStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? StartedProcessingAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public enum ProcessingStatus
{
    Pending, // Job is queued, waiting to be processed
    Processing, // The AI is actively analyzing the resume
    Completed, // Analysis is done and results are available
    Failed // An error occurred during processing
}