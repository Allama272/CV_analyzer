using backend.DTO.Analytics;

namespace backend.Services.Analytics;

public interface IKpiProvider
{
    Task<KpiProviderResult> GetUserJobKpisAsync(CancellationToken ct);
}

public interface IStatusProvider
{
    Task<StatusBreakdownProviderResult> GetBreakdownAsync(CancellationToken ct);
}

public interface IJobsOverTimeProvider
{
    Task<JobOverTimeProviderResult> GetWeeklyJobsAsync(CancellationToken ct);
}

public interface IHistogramProvider
{
    Task<HistogramProviderResult> GetHistogramScoresAsync(CancellationToken ct);
}

public interface IOutcomeProvider
{
    Task<OutcomesProviderResult> GetOutcomesAsync(CancellationToken ct);
}