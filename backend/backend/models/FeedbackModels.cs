using Microsoft.EntityFrameworkCore;

namespace backend.models;

public class FeedbackModels
{
// A generic tip used by multiple sections
    public class FeedbackTip
    {
        public string Type { get; set; } // "good" or "improve"
        public string Tip { get; set; }
        public string? Explanation { get; set; } // Nullable for ATS tips
    }

    public class AtsFeedback
    {
        public int Score { get; set; }
        public List<FeedbackTip> Tips { get; set; } = new();
    }

    public class ContentFeedback // Re-usable for Formatting, ContentQuality, Structure
    {
        public int Score { get; set; }
        public List<FeedbackTip> Tips { get; set; } = new();
    }

    public class SkillsCoverageFeedback
    {
        public int Score { get; set; }
        public List<string> DetectedSkills { get; set; } = new();
        public List<string> MissingCommonSkills { get; set; } = new();
        public List<FeedbackTip> Tips { get; set; } = new();
    }
}