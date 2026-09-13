using backend.cache;

namespace backend.Services.Jobs;

public record JobAddedEvent(int JobId, string UserId) : ISummaryInvalidateEvent;
public record JobRemovedEvent(int JobId, string UserId) : ISummaryInvalidateEvent;

public record JobUpdatedEvent(int JobId, string UserId) : ISummaryInvalidateEvent;
