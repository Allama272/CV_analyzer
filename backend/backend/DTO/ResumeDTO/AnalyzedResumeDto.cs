using System.Text.Json.Serialization;
using backend.models;

namespace backend.DTO;

public class AnalyzedResumeDto
{
    [JsonPropertyName("overallScore")] public int OverallScore { get; set; }

    [JsonPropertyName("ats")] public FeedbackModels.AtsFeedback Ats { get; set; } = new();

    [JsonPropertyName("formatting")] public FeedbackModels.ContentFeedback Formatting { get; set; } = new();

    [JsonPropertyName("contentQuality")] public FeedbackModels.ContentFeedback ContentQuality { get; set; } = new();

    [JsonPropertyName("structure")] public FeedbackModels.ContentFeedback Structure { get; set; } = new();

    [JsonPropertyName("skillsCoverage")]
    public FeedbackModels.SkillsCoverageFeedback SkillsCoverage { get; set; } = new();

    public string resumeImageUrl { get; set; }

    public ProcessingStatus Status { get; set; }
}