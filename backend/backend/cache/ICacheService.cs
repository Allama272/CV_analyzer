namespace backend.cache;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
        where T : class;

    Task SetAsync<T>(string key, T data, CancellationToken cancellationToken = default,
        TimeSpan? absoluteExpireTime = null)
        where T : class;

    Task RemoveAsync(string key, CancellationToken cancellationToken = default);

    Task<T> GetOrSetAsync<T>(
        string key,
        Func<Task<T>> factory,
        TimeSpan? absoluteExpireTime = null,
        CancellationToken cancellationToken = default) where T : class;
}