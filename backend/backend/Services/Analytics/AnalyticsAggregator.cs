using backend.DTO;
using backend.DTO.Analytics;

namespace backend.Services.Analytics;

public interface IAnalyticsAggregator
{
    Task<ServiceResult<AnalyticsSummaryDto>> GetSummaryAsync(CancellationToken ct = default);
}

public class AnalyticsAggregator : IAnalyticsAggregator
{
    private readonly IKpiProvider _kpiProvider;
    private readonly IStatusProvider _statusProvider;
    private readonly IJobsOverTimeProvider _jobsOverTimeProvider;
    private readonly IHistogramProvider _histogramProvider;
    private readonly IOutcomeProvider _outcomeProvider;

    public AnalyticsAggregator(
        IKpiProvider kpiProvider,
        IStatusProvider statusProvider,
        IJobsOverTimeProvider jobsOverTimeProvider,
        IHistogramProvider histogramProvider,
        IOutcomeProvider outcomeProvider)
    {
        _kpiProvider = kpiProvider;
        _statusProvider = statusProvider;
        _jobsOverTimeProvider = jobsOverTimeProvider;
        _histogramProvider = histogramProvider;
        _outcomeProvider = outcomeProvider;
    }

    public async Task<ServiceResult<AnalyticsSummaryDto>> GetSummaryAsync(CancellationToken ct = default)
    {
        try
        {
            // Start all provider calls concurrently
            var kpisTask = _kpiProvider.GetUserJobKpisAsync(ct);
            var statusTask = _statusProvider.GetBreakdownAsync(ct);
            var jobsOverTimeTask = _jobsOverTimeProvider.GetWeeklyJobsAsync(ct);
            var histogramTask = _histogramProvider.GetHistogramScoresAsync(ct);
            var outcomeTask = _outcomeProvider.GetOutcomesAsync(ct);

            // Wait for all to complete (throws if any faulted or cancelled)
            await Task.WhenAll(
                kpisTask,
                statusTask,
                jobsOverTimeTask,
                histogramTask,
                outcomeTask
            ).ConfigureAwait(false);

            // Retrieve results using await (safe, unwraps exceptions)
            var kpiResult = await kpisTask.ConfigureAwait(false);
            var statusResult = await statusTask.ConfigureAwait(false);
            var jobsOverTimeResult = await jobsOverTimeTask.ConfigureAwait(false);
            var histogramResult = await histogramTask.ConfigureAwait(false);
            var outcomeResult = await outcomeTask.ConfigureAwait(false);

            // Build the summary DTO
            var summary = new AnalyticsSummaryDto
            {
                ActiveOnly = new AnalyticsScopeDto
                {
                    Kpis = kpiResult.ActiveOnly,
                    StatusBreakdown = statusResult.ActiveOnly,
                    JobsOverTime = jobsOverTimeResult.ActiveOnly,
                    ScoreHistogram = histogramResult.ActiveOnly,
                    Outcomes = outcomeResult.ActiveOnly
                },
                IncludingArchived = new AnalyticsScopeDto
                {
                    Kpis = kpiResult.IncludingArchived,
                    StatusBreakdown = statusResult.IncludingArchived,
                    JobsOverTime = jobsOverTimeResult.IncludingArchived,
                    ScoreHistogram = histogramResult.IncludingArchived,
                    Outcomes = outcomeResult.IncludingArchived
                }
            };

            return ServiceResult<AnalyticsSummaryDto>.Success(summary);
        }
        catch (OperationCanceledException)
        {
            return ServiceResult<AnalyticsSummaryDto>.Failure("The operation was cancelled.");
        }
        catch (Exception ex)
        {
            return ServiceResult<AnalyticsSummaryDto>.Failure(
                "An error occurred while retrieving the analytics summary.");
        }
    }
}