using backend.DTO;
using backend.DTO.JobDTO;

namespace backend.Services.Jobs;

public interface IJobUrlProcessor
{
    Task<ServiceResult<JobFillDto>> ProcessJobLinkAsync(string jobUrl);
}