namespace backend.DTO.Analytics;

public record WeekBucketDto
{
    public DateOnly WeekStart { get; init; }
    public int Count { get; init; }
};

public record JobOverTimeProviderResult
{
    public List<WeekBucketDto> ActiveOnly { get; init; }
    public List<WeekBucketDto> IncludingArchived { get; init; }
}