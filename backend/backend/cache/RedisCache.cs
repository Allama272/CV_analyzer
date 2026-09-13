using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace backend.cache;

public class RedisCache : ICacheService
{
    private IDistributedCache _cache;


    public RedisCache(IDistributedCache cache)
    {
        _cache = cache;
    }

    private static string KeyMaker(string key)
    {
        return $"{CacheKeys.AppPrefix}{key}";
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class
    {
        string? cachedValue = await _cache.GetStringAsync(KeyMaker(key), cancellationToken);
        if (string.IsNullOrEmpty(cachedValue))
        {
            return null;
        }

        return JsonSerializer.Deserialize<T>(cachedValue);
    }


    public async Task SetAsync<T>(string key, T data, CancellationToken cancellationToken = default,
        TimeSpan? absoluteExpireTime = null) where T : class
    {
        var options = new DistributedCacheEntryOptions();
        options.AbsoluteExpirationRelativeToNow = absoluteExpireTime ?? TimeSpan.FromSeconds(20);

        var cachedValue = JsonSerializer.Serialize(data);
        await _cache.SetStringAsync(KeyMaker(key), cachedValue, options, cancellationToken);
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        await _cache.RemoveAsync(KeyMaker(key), cancellationToken);
    }

    public async Task<T> GetOrSetAsync<T>(
        string key,
        Func<Task<T>> factory,
        TimeSpan? absoluteExpireTime = null,
        CancellationToken cancellationToken = default) where T : class
    {
        Console.WriteLine("\n \n Looking in cache... \n \n ");
        var cached = await GetAsync<T>(key, cancellationToken);
        if (cached is not null) return cached;

        var freshData = await factory();
        Console.WriteLine("Recomputing.....");
        await SetAsync(key, freshData, cancellationToken, absoluteExpireTime);

        return freshData;
    }
}