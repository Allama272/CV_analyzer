using System.Security.Claims;

namespace backend.Services;

public interface ICurrentUserService
{
    string GetUserId();
}

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string GetUserId()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? throw new UnauthorizedAccessException("User is not authenticated");
    }
}