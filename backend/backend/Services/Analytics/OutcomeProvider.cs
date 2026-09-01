using backend.Data;
using backend.DTO.Analytics;
using backend.models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Analytics;

public class OutcomeProvider : IOutcomeProvider
{
    private readonly IDbContextFactory<ResumeDbContext> _contextFactory;
    private readonly ICurrentUserService _currentUserService;

    public OutcomeProvider(IDbContextFactory<ResumeDbContext> contextFactory,
        ICurrentUserService currentUserService)
    {
        _contextFactory = contextFactory;
        _currentUserService = currentUserService;
    }


    public async Task<OutcomesProviderResult> GetOutcomesAsync(CancellationToken ct)
    {
        await using var context = await _contextFactory.CreateDbContextAsync(ct);
        var userId = _currentUserService.GetUserId();

        var result = await context.UserJobs
            .Where(j => j.UserId == userId &&
                        (j.Status == JobStatus.Offered || j.Status == JobStatus.Rejected))
            .GroupBy(j => 1) // Treat as one bucket so we return one result
            .Select(g => new OutcomesProviderResult
            {
                ActiveOnly = new OutcomesDto
                {
                    Offered = g.Count(j => j.Archived == false && j.Status == JobStatus.Offered),
                    Rejected = g.Count(j => j.Archived == false && j.Status == JobStatus.Rejected)
                },
                IncludingArchived = new OutcomesDto
                {
                    Offered = g.Count(j => j.Status == JobStatus.Offered),
                    Rejected = g.Count(j => j.Status == JobStatus.Rejected)
                }
            })
            .FirstOrDefaultAsync(ct);

        return result ?? new OutcomesProviderResult
        {
            ActiveOnly = new OutcomesDto(),
            IncludingArchived = new OutcomesDto()
        };
    }
}