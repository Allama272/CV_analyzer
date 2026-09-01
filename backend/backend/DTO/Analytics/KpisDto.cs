namespace backend.DTO.Analytics;

public record KpisDto
{
    public int TotalJobs { get; init; }
    public int AddedThisWeek { get; init; }
    public double? InterviewRatePercent { get; init; }
    public double? OfferRatePercent { get; init; }
    public double? AverageMatchScore { get; init; }
}

public record KpiProviderResult
{
    public KpisDto ActiveOnly { get; init; }
    public KpisDto IncludingArchived { get; init; }
}