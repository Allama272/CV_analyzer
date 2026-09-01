using backend.Data;
using backend.DTO.Analytics;
using backend.Helpers;
using Microsoft.AspNetCore.Components;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Analytics;

public class JobsOverTimeProvider : IJobsOverTimeProvider
{
    private readonly IDbContextFactory<ResumeDbContext> _contextFactory;
    private readonly ICurrentUserService _currentUserService;

    public JobsOverTimeProvider(IDbContextFactory<ResumeDbContext> contextFactory,
        ICurrentUserService currentUserService)
    {
        _contextFactory = contextFactory;
        _currentUserService = currentUserService;
    }

    // * we fetch all jobs from db then count and bucket them in memory, since some sql providers (and sqlite in our dev env)
    // * work weirdly with datetime grouping + 1user jobs in the past 8 weeks isn't an expensive query
    public async Task<JobOverTimeProviderResult> GetWeeklyJobsAsync(CancellationToken ct)
    {
        await using var context = await _contextFactory.CreateDbContextAsync(ct);

        var userId = _currentUserService.GetUserId();
        DateTime currentWeekMonday = DateTime.UtcNow.GetStartOfWeek();
        DateTime startDate = currentWeekMonday.AddDays(-7 * 7); // Go back 7 more weeks for 8 total

        // Generate the exact 8-week buckets 
        var weekStarts = Enumerable.Range(0, 8)
            .Select(offset => startDate.AddDays(offset * 7))
            .ToList();

        var rawJobs = await context.UserJobs
            .Where(j => j.UserId == userId && j.UploadDate >= startDate)
            .Select(j => new { j.UploadDate, j.Archived }) // Fetch only the 2 columns we need
            .ToListAsync(ct);

        var allBuckets = new List<WeekBucketDto>();
        var activeBuckets = new List<WeekBucketDto>();

        // Slot the data into the buckets
        foreach (var weekStart in weekStarts)
        {
            var weekEnd = weekStart.AddDays(7);

            // Count jobs that fall within this specific week
            var totalInWeek = rawJobs.Count(j => j.UploadDate >= weekStart && j.UploadDate < weekEnd);
            var activeInWeek =
                rawJobs.Count(j => j.UploadDate >= weekStart && j.UploadDate < weekEnd && j.Archived == false);

            var weekStartDateOnly = DateOnly.FromDateTime(weekStart);

            allBuckets.Add(new WeekBucketDto { WeekStart = weekStartDateOnly, Count = totalInWeek });
            activeBuckets.Add(new WeekBucketDto { WeekStart = weekStartDateOnly, Count = activeInWeek });
        }

        return new JobOverTimeProviderResult
        {
            IncludingArchived = allBuckets,
            ActiveOnly = activeBuckets
        };
    }
}