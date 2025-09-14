using backend.DTO;

namespace backend.Services;

public interface IAiAnalysisService
{
    public Task<AiAnalysisResultDto> GetAnalysisAsync(string resumeText);
}