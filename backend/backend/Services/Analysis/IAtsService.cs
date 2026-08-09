namespace backend.Services.Analysis;

public interface IAtsService
{
    public Task AnalyzeResume(int resumeId);
    public Task AnalyzeJobResume(int feedbackId);
}