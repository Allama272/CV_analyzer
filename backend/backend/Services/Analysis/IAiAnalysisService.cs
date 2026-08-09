using backend.DTO;
using backend.DTO.JobDTO;

namespace backend.Services.Analysis;

public interface IAiAnalysisService
{
    public Task<AiAnalysisResultDto> GetResumeAnalysisAsync(string resumeText);
    public Task<AnalyzedJobDto> GetJobResumeAnalysisAsync(string resumeText, JobSentDto jobDto);
}