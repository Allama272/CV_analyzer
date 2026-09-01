namespace backend.Services.Analytics;

public static class AnalyticsServiceCollectionExtensions
{
    public static IServiceCollection AddAnalyticsDashboard(this IServiceCollection services)
    {
        services.AddScoped<IAnalyticsAggregator, AnalyticsAggregator>();
        services.AddScoped<IKpiProvider, KpiProvider>();
        services.AddScoped<IStatusProvider, StatusProvider>();
        services.AddScoped<IJobsOverTimeProvider, JobsOverTimeProvider>();
        services.AddScoped<IHistogramProvider, HistogramProvider>();
        services.AddScoped<IOutcomeProvider, OutcomeProvider>();
        return services;
    }
}