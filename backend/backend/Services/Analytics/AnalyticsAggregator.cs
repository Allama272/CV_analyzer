using backend.cache;
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
    private readonly ICurrentUserService _currentUserService;
    private readonly ICacheService _cacheService;

    public AnalyticsAggregator(
        IKpiProvider kpiProvider,
        IStatusProvider statusProvider,
        IJobsOverTimeProvider jobsOverTimeProvider,
        IHistogramProvider histogramProvider,
        IOutcomeProvider outcomeProvider,
        ICurrentUserService currentUserService,
        ICacheService cacheService
    )
    {
        _kpiProvider = kpiProvider;
        _statusProvider = statusProvider;
        _jobsOverTimeProvider = jobsOverTimeProvider;
        _histogramProvider = histogramProvider;
        _outcomeProvider = outcomeProvider;
        _currentUserService = currentUserService;
        _cacheService = cacheService;
    }

    public async Task<ServiceResult<AnalyticsSummaryDto>> GetSummaryAsync(CancellationToken ct = default)
    {
        var cacheKey = $"{CacheKeys.SummaryPrefix}{_currentUserService.GetUserId()}";

        try
        {
            var summary = await _cacheService.GetOrSetAsync(
                cacheKey,
                () => ComputeSummaryAsync(ct),
                absoluteExpireTime: TimeSpan.FromMinutes(CacheKeys.SummaryMinutesExpire), 
                cancellationToken: ct
            );

            return ServiceResult<AnalyticsSummaryDto>.Success(summary!);
        }
        catch (OperationCanceledException)
        {
            return ServiceResult<AnalyticsSummaryDto>.Failure("The operation was cancelled.");
        }
        catch (Exception ex)
        {
            return ServiceResult<AnalyticsSummaryDto>.Failure(
                $"An error occurred while retrieving the analytics summary: {ex.Message}"
            );
        }
    }

    private async Task<AnalyticsSummaryDto> ComputeSummaryAsync(CancellationToken ct)
    {
        Console.WriteLine("Recomputing Analytics Summary...");

        // Start all provider calls concurrently
        var kpisTask = _kpiProvider.GetUserJobKpisAsync(ct);
        var statusTask = _statusProvider.GetBreakdownAsync(ct);
        var jobsOverTimeTask = _jobsOverTimeProvider.GetWeeklyJobsAsync(ct);
        var histogramTask = _histogramProvider.GetHistogramScoresAsync(ct);
        var outcomeTask = _outcomeProvider.GetOutcomesAsync(ct);

        // Wait for all to complete
        await Task.WhenAll(kpisTask, statusTask, jobsOverTimeTask, histogramTask, outcomeTask)
            .ConfigureAwait(false);

        // Retrieve results using await (safe, unwraps exceptions)
        var kpiResult = await kpisTask.ConfigureAwait(false);
        var statusResult = await statusTask.ConfigureAwait(false);
        var jobsOverTimeResult = await jobsOverTimeTask.ConfigureAwait(false);
        var histogramResult = await histogramTask.ConfigureAwait(false);
        var outcomeResult = await outcomeTask.ConfigureAwait(false);

        // Build and return the summary DTO
        return new AnalyticsSummaryDto
        {
            ActiveOnly = new AnalyticsScopeDto
            {
                Kpis = kpiResult.ActiveOnly,
                StatusBreakdown = statusResult.ActiveOnly,
                JobsOverTime = jobsOverTimeResult.ActiveOnly,
                ScoreHistogram = histogramResult.ActiveOnly,
                Outcomes = outcomeResult.ActiveOnly,
            },
            IncludingArchived = new AnalyticsScopeDto
            {
                Kpis = kpiResult.IncludingArchived,
                StatusBreakdown = statusResult.IncludingArchived,
                JobsOverTime = jobsOverTimeResult.IncludingArchived,
                ScoreHistogram = histogramResult.IncludingArchived,
                Outcomes = outcomeResult.IncludingArchived,
            },
        };
    }
}