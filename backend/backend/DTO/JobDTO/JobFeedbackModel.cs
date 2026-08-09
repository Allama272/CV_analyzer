using System.Text.Json.Serialization;

namespace backend.DTO;

/// <summary>
/// Contains the nested classes used for the JSON columns in ResumeJobFeedback.
/// </summary>
public static class JobFeedbackModels
{
    /// <summary>
    /// Represents the type of feedback tip.
    /// The JsonStringEnumConverter will serialize this to "Good" or "Improve".
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TipType
    {
        Good,
        Improve
    }

    /// <summary>
    /// A generic tip with a type, title, and explanation.
    /// </summary>
    public class Tip
    {
        public TipType Type { get; set; }
        public string Explanation { get; set; } = string.Empty;
    }

    /// <summary>
    /// A simplified tip used for ATS compatibility.
    /// </summary>
    public class AtsTip
    {
        public TipType Type { get; set; }
        public string Explanation { get; set; } = string.Empty;
    }

    /// <summary>
    /// A generic structure for keyword and education matching.
    /// </summary>
    public class MatchFeedback
    {
        public List<string> Matched { get; set; } = [];
        public List<string> Missing { get; set; } = [];
        public int Score { get; set; }
        public List<Tip> Tips { get; set; } = [];
    }

    /// <summary>
    /// Feedback specifically for skills matching.
    /// </summary>
    public class SkillsMatchFeedback
    {
        public List<string> MatchedSkills { get; set; } = [];
        public List<string> MissingSkills { get; set; } = [];
        public int Score { get; set; }
        public List<Tip> Tips { get; set; } = [];
    }

    /// <summary>
    /// Feedback for experience alignment.
    /// </summary>
    public class ExperienceAlignmentFeedback
    {
        public int Score { get; set; }
        public List<string> MatchedExperience { get; set; } = [];
        public List<string> Gaps { get; set; } = [];
        public List<Tip> Tips { get; set; } = [];
    }

    /// <summary>
    /// Feedback for ATS compatibility.
    /// </summary>
    public class AtsCompatibilityFeedback
    {
        public int Score { get; set; }
        public List<AtsTip> Tips { get; set; } = [];
    }
}