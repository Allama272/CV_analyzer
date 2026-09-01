using backend.Data;
using backend.DTO.Analytics;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Analytics;

public class HistogramProvider : IHistogramProvider
{
    private readonly IDbContextFactory<ResumeDbContext> _contextFactory;
    private readonly ICurrentUserService _currentUserService;

    public HistogramProvider(IDbContextFactory<ResumeDbContext> contextFactory, ICurrentUserService currentUserService)
    {
        _contextFactory = contextFactory;
        _currentUserService = currentUserService;
    }

    public async Task<HistogramProviderResult> GetHistogramScoresAsync(CancellationToken ct)
    {
        await using var context = await _contextFactory.CreateDbContextAsync(ct);
        var userId = _currentUserService.GetUserId();
        // Fetch only the data we need
        var rawScores = await context.UserJobs
            .Where(j => j.UserId == userId)
            .Select(j => new
            {
                j.Archived,
                MaxScore = j.Feedbacks.Max(f => (double?)f.OverallMatchScore) ?? 0
            }).ToListAsync(ct);

        // Prefill both dictionaries with 0 for all possible buckets
        var buckets = Enum.GetValues<ScoreBucket>();
        var allJobsDict = buckets.ToDictionary(b => b, _ => 0);
        var activeJobsDict = buckets.ToDictionary(b => b, _ => 0);

        // Single-pass iteration to allocate counts
        foreach (var job in rawScores)
        {
            var bucket = DetermineBucket(job.MaxScore);

            allJobsDict[bucket]++;

            if (!job.Archived)
            {
                activeJobsDict[bucket]++;
            }
        }

        return new HistogramProviderResult
        {
            IncludingArchived = allJobsDict,
            ActiveOnly = activeJobsDict
        };
    }

    private static ScoreBucket DetermineBucket(double score) => score switch
    {
        0 => ScoreBucket.NotAnalyzed,
        < 40 => ScoreBucket.Below40,
        < 60 => ScoreBucket.Between40And60,
        < 80 => ScoreBucket.Between60And80,
        _ => ScoreBucket.Above80
    };
}