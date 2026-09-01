using System.Security.Claims;
using backend.DTO.Analytics;
using backend.Services;
using backend.Services.Analytics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace backend.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsAggregator _analyticsAggregator;

    public AnalyticsController(IAnalyticsAggregator analyticsAggregator)
    {
        _analyticsAggregator = analyticsAggregator;
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(AnalyticsSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EnableRateLimiting("DashboardRateLimit")]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var result = await _analyticsAggregator.GetSummaryAsync(ct);
        if (!result.IsSuccess)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }
}