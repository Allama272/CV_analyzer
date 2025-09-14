using backend.Data;
using backend.DTO;
using backend.models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AtsService : IAtsService
{
    private IStorage _storage;
    private ResumeDbContext _dbContext;
    private IResumeParserService _parser;
    private IAiAnalysisService _aiAnalysis;

    public AtsService(IStorage storage, ResumeDbContext dbContext, IResumeParserService parser,
        IAiAnalysisService aiAnalysis)
    {
        _storage = storage;
        _dbContext = dbContext;
        _parser = parser;
        _aiAnalysis = aiAnalysis;
    }

    public async Task AnalyzeResume(int resumeId)
    {
        var feedbackEntity = await _dbContext.ResumeFeedbacks
            .Include(f => f.Resume)
            .SingleOrDefaultAsync(f => f.ResumeId == resumeId);

        if (feedbackEntity == null)
        {
            return;
        }


        feedbackEntity.Status = ProcessingStatus.Processing;
        feedbackEntity.StartedProcessingAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        try
        {
            var fileStream = await _storage.GetResumeStreamAsync(feedbackEntity.Resume.FileUrl);
            var resumeText = await _parser.ExtractTextAsync(fileStream, feedbackEntity.Resume.FileUrl);
            AiAnalysisResultDto analysisResult = await _aiAnalysis.GetAnalysisAsync(resumeText);

            feedbackEntity.OverallScore = analysisResult.OverallScore;
            feedbackEntity.Ats = analysisResult.Ats;
            feedbackEntity.Formatting = analysisResult.Formatting;
            feedbackEntity.ContentQuality = analysisResult.ContentQuality;
            feedbackEntity.Structure = analysisResult.Structure;
            feedbackEntity.SkillsCoverage = analysisResult.SkillsCoverage;

            // Update status to Completed
            feedbackEntity.Status = ProcessingStatus.Completed;
            feedbackEntity.CompletedAt = DateTime.UtcNow;
        }
        catch (Exception e)
        {
            feedbackEntity.Status = ProcessingStatus.Failed;
            feedbackEntity.ErrorMessage = e.Message;
            Console.WriteLine(e);
        }

        finally
        {
            await _dbContext.SaveChangesAsync();
        }
    }
}