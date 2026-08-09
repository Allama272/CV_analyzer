using backend.DTO;
using backend.DTO.JobDTO;

namespace backend.Services.Jobs;

public interface IJobParserStrategy
{
    string SiteName { get; }
    Task<ServiceResult<JobFillDto>> ScrapeJob(string jobLink);
}