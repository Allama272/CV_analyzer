using backend.models;

namespace backend.DTO;

using System.Text.Json.Serialization;

public class AiAnalysisResultDto
{
    [JsonPropertyName("overallScore")] public int OverallScore { get; set; }

    [JsonPropertyName("ats")] public FeedbackModels.AtsFeedback Ats { get; set; } = new();

    [JsonPropertyName("formatting")] public FeedbackModels.ContentFeedback Formatting { get; set; } = new();

    [JsonPropertyName("contentQuality")] public FeedbackModels.ContentFeedback ContentQuality { get; set; } = new();

    [JsonPropertyName("structure")] public FeedbackModels.ContentFeedback Structure { get; set; } = new();

    [JsonPropertyName("skillsCoverage")]
    public FeedbackModels.SkillsCoverageFeedback SkillsCoverage { get; set; } = new();
}