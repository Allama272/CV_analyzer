namespace backend.DTO.Analytics;

public record AnalyticsSummaryDto
{
    public AnalyticsScopeDto ActiveOnly { get; init; }
    public AnalyticsScopeDto IncludingArchived { get; init; }
}