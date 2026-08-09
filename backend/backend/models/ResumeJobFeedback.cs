using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using backend.DTO;

namespace backend.models;

public class ResumeJobFeedback
{
    public int Id { get; set; }

    // Foreign Keys
    public required int ResumeId { get; set; }
    public virtual Resume Resume { get; set; } = null!;

    public required int UserJobId { get; set; }
    public virtual UserJob UserJob { get; set; } = null!;


    public required string UserId { get; set; }

    // Top-level feedback fields
    public int OverallMatchScore { get; set; }

    // Store complex objects as JSON columns
    [Column(TypeName = "json")] public JobFeedbackModels.MatchFeedback KeywordMatch { get; set; } = new();

    [Column(TypeName = "json")] public JobFeedbackModels.SkillsMatchFeedback SkillsMatch { get; set; } = new();

    [Column(TypeName = "json")]
    public JobFeedbackModels.ExperienceAlignmentFeedback ExperienceAlignment { get; set; } = new();

    [Column(TypeName = "json")] public JobFeedbackModels.MatchFeedback EducationAlignment { get; set; } = new();

    [Column(TypeName = "json")]
    public JobFeedbackModels.AtsCompatibilityFeedback AtsCompatibility { get; set; } = new();

    // Meta fields for tracking processing status
    public ProcessingStatus Status { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? StartedProcessingAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}