using backend.models;

namespace backend.DTO.Analytics;

public record AnalyticsScopeDto
{
    public KpisDto Kpis { get; init; }
    public Dictionary<JobStatus, int> StatusBreakdown { get; init; }
    public List<WeekBucketDto> JobsOverTime { get; init; }
    public Dictionary<ScoreBucket, int> ScoreHistogram { get; init; }
    public OutcomesDto Outcomes { get; init; }
}