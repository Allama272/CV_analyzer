using backend.Data;
using backend.DTO.Analytics;
using backend.Helpers;
using backend.models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Analytics;

public class KpiProvider : IKpiProvider
{
    private readonly IDbContextFactory<ResumeDbContext> _contextFactory;
    private readonly ICurrentUserService _currentUserService;

    public KpiProvider(IDbContextFactory<ResumeDbContext> contextFactory,
        ICurrentUserService currentUserService)
    {
        _contextFactory = contextFactory;
        _currentUserService = currentUserService;
    }


    public async Task<KpiProviderResult> GetUserJobKpisAsync(CancellationToken ct)
    {
        await using var context = await _contextFactory.CreateDbContextAsync(ct);
        var userId = _currentUserService.GetUserId();
        var startOfCurrentWeek = DateTime.UtcNow.GetStartOfWeek();

        // Fetch raw counts and sums grouped by archived status
        var rawStats = await context.UserJobs
            .Where(j => j.UserId == userId)
            .Select(j => new
            {
                j.Archived,
                j.UploadDate,
                j.Status,
                MaxScore = j.Feedbacks.Max(f => (double?)f.OverallMatchScore) ?? 0
            })
            .GroupBy(j => j.Archived)
            .Select(g => new
            {
                IsArchived = g.Key,
                Total = g.Count(),
                AddedThisWeek = g.Count(j => j.UploadDate >= startOfCurrentWeek),
                Interviews = g.Count(j => j.Status == JobStatus.Interviewing),
                Offers = g.Count(j => j.Status == JobStatus.Offered),
                TotalScoreSum = g.Sum(j => j.MaxScore)
            })
            .ToListAsync(ct);

        // Separate into Active and Archived variables 
        var active = rawStats.FirstOrDefault(s => s.IsArchived == false);
        var archived = rawStats.FirstOrDefault(s => s.IsArchived == true);

        // Aggregate All totals
        var allTotal = (active?.Total ?? 0) + (archived?.Total ?? 0);
        var allAdded = (active?.AddedThisWeek ?? 0) + (archived?.AddedThisWeek ?? 0);
        var allInterviews = (active?.Interviews ?? 0) + (archived?.Interviews ?? 0);
        var allOffers = (active?.Offers ?? 0) + (archived?.Offers ?? 0);
        var allScoreSum = (active?.TotalScoreSum ?? 0) + (archived?.TotalScoreSum ?? 0);

        return new KpiProviderResult
        {
            ActiveOnly = new KpisDto
            {
                TotalJobs = active?.Total ?? 0,
                AddedThisWeek = active?.AddedThisWeek ?? 0,
                InterviewRatePercent = CalculateRate(active?.Interviews, active?.Total),
                OfferRatePercent = CalculateRate(active?.Offers, active?.Total),
                AverageMatchScore = CalculateAverage(active?.TotalScoreSum, active?.Total)
            },
            IncludingArchived = new KpisDto
            {
                TotalJobs = allTotal,
                AddedThisWeek = allAdded,
                InterviewRatePercent = CalculateRate(allInterviews, allTotal),
                OfferRatePercent = CalculateRate(allOffers, allTotal),
                AverageMatchScore = CalculateAverage(allScoreSum, allTotal)
            }
        };
    }

    private static double? CalculateRate(double? numerator, int? denominator)
    {
        if (denominator is null or 0 || numerator is null) return 0;

        return (numerator.Value / denominator.Value) * 100;
    }

    private static double? CalculateAverage(double? sum, int? count)
    {
        if (count is null or 0 || sum is null) return 0;
        return sum.Value / count.Value;
    }
}