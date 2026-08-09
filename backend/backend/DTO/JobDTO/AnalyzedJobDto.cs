using backend.models;

namespace backend.DTO.JobDTO;

public class AnalyzedJobDto
{
    public int OverallScore { get; set; }
    public JobFeedbackModels.MatchFeedback KeywordMatch { get; set; } = new();
    public JobFeedbackModels.SkillsMatchFeedback SkillsMatch { get; set; } = new();
    public JobFeedbackModels.ExperienceAlignmentFeedback ExperienceAlignment { get; set; } = new();
    public JobFeedbackModels.MatchFeedback EducationAlignment { get; set; } = new();
    public JobFeedbackModels.AtsCompatibilityFeedback AtsCompatibility { get; set; } = new();
    public ProcessingStatus Status { get; set; }
    public string resumeImageUrl { get; set; }
}