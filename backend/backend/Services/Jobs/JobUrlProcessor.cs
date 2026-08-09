using backend.DTO;
using backend.DTO.JobDTO;

namespace backend.Services.Jobs;

public class JobUrlProcessor : IJobUrlProcessor
{
    private readonly IEnumerable<IJobParserStrategy> _strategies;

    public JobUrlProcessor(IEnumerable<IJobParserStrategy> strategies)
    {
        _strategies = strategies;
    }

    public async Task<ServiceResult<JobFillDto>> ProcessJobLinkAsync(string jobUrl)
    {
        var strategy = _strategies.FirstOrDefault(s => jobUrl.Contains(s.SiteName));

        if (strategy == null)
        {
            return ServiceResult<JobFillDto>.Failure("We do not support this website yet");
        }

        // Return the result directly (no need for the ternary operator 
        // since the strategy already returns a ServiceResult<JobFillDto>)
        return await strategy.ScrapeJob(jobUrl);
    }
}