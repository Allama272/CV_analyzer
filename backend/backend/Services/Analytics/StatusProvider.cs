using backend.Data;
using backend.DTO.Analytics;
using backend.models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Analytics;

public class StatusProvider : IStatusProvider
{
    private readonly IDbContextFactory<ResumeDbContext> _contextFactory;
    private readonly ICurrentUserService _currentUserService;

    public StatusProvider(IDbContextFactory<ResumeDbContext> contextFactory,
        ICurrentUserService currentUserService)
    {
        _contextFactory = contextFactory;
        _currentUserService = currentUserService;
    }


    public async Task<StatusBreakdownProviderResult> GetBreakdownAsync(CancellationToken ct)
    {
        await using var context = await _contextFactory.CreateDbContextAsync(ct);
        var userId = _currentUserService.GetUserId();

        var dbBreakdown = await context.UserJobs
            .Where(j => j.UserId == userId)
            .GroupBy(j => j.Status)
            .Select(g => new
            {
                Status = g.Key,
                TotalCount = g.Count(),
                ActiveCount = g.Count(j => j.Archived == false)
            })
            .ToListAsync(ct);

        var allPossibleStatuses = Enum.GetValues<JobStatus>();

        return new StatusBreakdownProviderResult
        {
            IncludingArchived = allPossibleStatuses.ToDictionary(
                keySelector: status => status,
                elementSelector: status => dbBreakdown.FirstOrDefault(x => x.Status == status)?.TotalCount ?? 0
            ),

            ActiveOnly = allPossibleStatuses.ToDictionary(
                keySelector: status => status,
                elementSelector: status => dbBreakdown.FirstOrDefault(x => x.Status == status)?.ActiveCount ?? 0
            )
        };
    }
}