using backend.cache;
using backend.DTO.Analytics;
using backend.models;
using backend.Services;
using backend.Services.Analytics;
using Microsoft.Extensions.Caching.Distributed;
using Moq;

namespace Tests.Services.Analytics;

public class AnalyticsAggregatorTests
{
    private readonly Mock<IKpiProvider> _mockKpiProvider;
    private readonly Mock<IStatusProvider> _mockStatusProvider;
    private readonly Mock<IJobsOverTimeProvider> _mockJobsOverTimeProvider;
    private readonly Mock<IHistogramProvider> _mockHistogramProvider;
    private readonly Mock<IOutcomeProvider> _mockOutcomeProvider;
    private readonly Mock<ICacheService> _mockCacheService;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;

    private readonly AnalyticsAggregator _aggregator;

    public AnalyticsAggregatorTests()
    {
        _mockKpiProvider = new Mock<IKpiProvider>();
        _mockStatusProvider = new Mock<IStatusProvider>();
        _mockJobsOverTimeProvider = new Mock<IJobsOverTimeProvider>();
        _mockHistogramProvider = new Mock<IHistogramProvider>();
        _mockOutcomeProvider = new Mock<IOutcomeProvider>();
        _mockCacheService = new Mock<ICacheService>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        
        _mockCacheService
            .Setup(p => p.GetOrSetAsync(
                It.IsAny<string>(),
                It.IsAny<Func<Task<AnalyticsSummaryDto>>>(),
                It.IsAny<TimeSpan?>(), 
                It.IsAny<CancellationToken>()))
            .Returns((string key, Func<Task<AnalyticsSummaryDto>> factory, TimeSpan? time, CancellationToken ct) =>
            {
                return factory(); // Always invoke the factory by default
            });
            
        _mockCurrentUserService.Setup(p => p.GetUserId()).Returns("User123");
        
        // Instantiate your aggregator
        _aggregator = new AnalyticsAggregator(
            _mockKpiProvider.Object,
            _mockStatusProvider.Object,
            _mockJobsOverTimeProvider.Object,
            _mockHistogramProvider.Object,
            _mockOutcomeProvider.Object,
            _mockCurrentUserService.Object,
            _mockCacheService.Object
        );
        
    }

    [Fact]
    public async Task GetSummaryAsync_AggregatesAllProvidersCorrectly_OnSuccess()
    {
        // Arrange - Create dummy objects for each provider to return
        var kpiResult = new KpiProviderResult { ActiveOnly = new KpisDto(), IncludingArchived = new KpisDto() };
        var statusResult = new StatusBreakdownProviderResult
        {
            ActiveOnly = new Dictionary<JobStatus, int>(),
            IncludingArchived = new Dictionary<JobStatus, int>()
        };
        var jobsOverTimeResult = new JobOverTimeProviderResult
        {
            ActiveOnly = new List<WeekBucketDto>(),
            IncludingArchived = new List<WeekBucketDto>()
        };
        var histogramResult = new HistogramProviderResult
        {
            ActiveOnly = new Dictionary<ScoreBucket, int>(),
            IncludingArchived = new Dictionary<ScoreBucket, int>()
        };
        var outcomeResult = new OutcomesProviderResult
        {
            ActiveOnly = new OutcomesDto(),
            IncludingArchived = new OutcomesDto()
        };

        // Set up the mocks to return the dummy objects
        _mockKpiProvider.Setup(p => p.GetUserJobKpisAsync(It.IsAny<CancellationToken>())).ReturnsAsync(kpiResult);
        _mockStatusProvider.Setup(p => p.GetBreakdownAsync(It.IsAny<CancellationToken>())).ReturnsAsync(statusResult);
        _mockJobsOverTimeProvider.Setup(p => p.GetWeeklyJobsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(jobsOverTimeResult);
        _mockHistogramProvider.Setup(p => p.GetHistogramScoresAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(histogramResult);
        _mockOutcomeProvider.Setup(p => p.GetOutcomesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(outcomeResult);
      

        // Act
        var result = await _aggregator.GetSummaryAsync(CancellationToken.None);

        // Assert - Wrapper Result
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);

        // Assert - ActiveOnly Mapping
        Assert.Same(kpiResult.ActiveOnly, result.Data.ActiveOnly.Kpis);
        Assert.Same(statusResult.ActiveOnly, result.Data.ActiveOnly.StatusBreakdown);
        Assert.Same(jobsOverTimeResult.ActiveOnly, result.Data.ActiveOnly.JobsOverTime);
        Assert.Same(histogramResult.ActiveOnly, result.Data.ActiveOnly.ScoreHistogram);
        Assert.Same(outcomeResult.ActiveOnly, result.Data.ActiveOnly.Outcomes);

        // Assert - IncludingArchived Mapping
        Assert.Same(kpiResult.IncludingArchived, result.Data.IncludingArchived.Kpis);
        Assert.Same(statusResult.IncludingArchived, result.Data.IncludingArchived.StatusBreakdown);
        Assert.Same(jobsOverTimeResult.IncludingArchived, result.Data.IncludingArchived.JobsOverTime);
        Assert.Same(histogramResult.IncludingArchived, result.Data.IncludingArchived.ScoreHistogram);
        Assert.Same(outcomeResult.IncludingArchived, result.Data.IncludingArchived.Outcomes);
    }

    [Fact]
    public async Task GetSummaryAsync_ReturnsFailure_WhenOperationIsCancelled()
    {
        // Arrange
        var cts = new CancellationTokenSource();
        cts.Cancel(); // Simulate an already cancelled token

        // Have one of the providers throw an OperationCanceledException when called
        _mockKpiProvider
            .Setup(p => p.GetUserJobKpisAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new OperationCanceledException());

        // Act
        var result = await _aggregator.GetSummaryAsync(cts.Token);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Equal("The operation was cancelled.", result.ErrorMessage);
        Assert.Null(result.Data);
    }

    [Fact]
    public async Task GetSummaryAsync_ReturnsFailure_WhenAnyProviderThrowsException()
    {
        // Arrange
        // We simulate the database going down or a massive error in the StatusProvider
        _mockStatusProvider
            .Setup(p => p.GetBreakdownAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Setup at least one other provider to succeed just to ensure Task.WhenAll behavior is caught
        _mockKpiProvider
            .Setup(p => p.GetUserJobKpisAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new KpiProviderResult());

        // Act
        var result = await _aggregator.GetSummaryAsync(CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("Database connection failed", result.ErrorMessage);
        Assert.Null(result.Data);
    }
}