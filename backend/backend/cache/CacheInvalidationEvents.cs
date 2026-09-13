using backend.Services.Analysis;
using backend.Services.Jobs;
using MediatR;

namespace backend.cache;

public interface ISummaryInvalidateEvent : INotification
{
    string UserId { get; }
}
public class ClearSummaryCacheHandler :
    INotificationHandler<JobAddedEvent>,
    INotificationHandler<JobRemovedEvent>,
    INotificationHandler<JobUpdatedEvent>,
    INotificationHandler<JobAnalyzedEvent>,
    INotificationHandler<ResumeAnalyzedEvent>
{
    private readonly ICacheService _cacheService;

    public ClearSummaryCacheHandler(ICacheService cacheService)
    {
        _cacheService = cacheService;
    }

    public Task Handle(JobAddedEvent n, CancellationToken ct) => Invalidate(n.UserId, ct);
    public Task Handle(JobRemovedEvent n, CancellationToken ct) => Invalidate(n.UserId, ct);
    public Task Handle(JobUpdatedEvent n, CancellationToken ct) => Invalidate(n.UserId, ct);
    public Task Handle(JobAnalyzedEvent n, CancellationToken ct) => Invalidate(n.UserId, ct);
    public Task Handle(ResumeAnalyzedEvent n, CancellationToken ct) => Invalidate(n.UserId, ct);

    private Task Invalidate(string userId, CancellationToken ct) =>
        _cacheService.RemoveAsync($"{CacheKeys.SummaryPrefix}{userId}", ct);
}
