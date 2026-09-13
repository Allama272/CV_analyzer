using backend.cache;

namespace backend.Services.Analysis;

public record JobAnalyzedEvent(int JobId, int ResumeId, int AnalysisId, string UserId) : ISummaryInvalidateEvent;

public record ResumeAnalyzedEvent(int ResumeId, int AnalysisId, string UserId) : ISummaryInvalidateEvent;