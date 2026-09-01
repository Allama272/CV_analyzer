namespace backend.DTO.Analytics;

public record OutcomesDto
{
    public int Offered { get; init; }
    public int Rejected { get; init; }
}

public record OutcomesProviderResult
{
    public OutcomesDto ActiveOnly { get; init; }
    public OutcomesDto IncludingArchived { get; init; }
}