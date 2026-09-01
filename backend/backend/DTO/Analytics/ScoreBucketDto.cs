namespace backend.DTO.Analytics;

public enum ScoreBucket
{
    NotAnalyzed,
    Below40,
    Between40And60,
    Between60And80,
    Above80
}

public record HistogramProviderResult
{
    public Dictionary<ScoreBucket, int> ActiveOnly { get; init; }
    public Dictionary<ScoreBucket, int> IncludingArchived { get; init; }
}