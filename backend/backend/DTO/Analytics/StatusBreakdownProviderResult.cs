using backend.models;

namespace backend.DTO.Analytics;

public record StatusBreakdownProviderResult
{
    public Dictionary<JobStatus, int> ActiveOnly { get; init; }
    public Dictionary<JobStatus, int> IncludingArchived { get; init; }
}