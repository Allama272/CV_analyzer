using System.Text;
using backend.Data;
using backend.DTO;
using backend.DTO.JobDTO;
using backend.models;
using backend.Services.Resumes;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Analysis;

public class AtsService : IAtsService
{
    private IStorage _storage;
    private ResumeDbContext _dbContext;
    private IResumeParserService _parser;
    private IAiAnalysisService _aiAnalysis;
    private readonly IMediator _mediator;

    public AtsService(IStorage storage, ResumeDbContext dbContext, IResumeParserService parser,
        IAiAnalysisService aiAnalysis, IMediator mediator)
    {
        _storage = storage;
        _dbContext = dbContext;
        _parser = parser;
        _aiAnalysis = aiAnalysis;
        _mediator = mediator;
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
            var fileStream = await _storage.GetResumeFileStreamAsync(feedbackEntity.Resume.FileUrl);

            var resumeText = await _parser.ExtractTextAsync(fileStream, feedbackEntity.Resume.FileUrl);
            await using MemoryStream textStream = new MemoryStream(Encoding.UTF8.GetBytes(resumeText));
            string textUrl = await _storage.SaveResumeTextAsync(textStream);
            feedbackEntity.Resume.ParsedTextUrl = textUrl;

            AiAnalysisResultDto analysisResult = await _aiAnalysis.GetResumeAnalysisAsync(resumeText);

            feedbackEntity.OverallScore = analysisResult.OverallScore;
            feedbackEntity.Ats = analysisResult.Ats;
            feedbackEntity.Formatting = analysisResult.Formatting;
            feedbackEntity.ContentQuality = analysisResult.ContentQuality;
            feedbackEntity.Structure = analysisResult.Structure;
            feedbackEntity.SkillsCoverage = analysisResult.SkillsCoverage;

            // Update status to Completed
            feedbackEntity.Status = ProcessingStatus.Completed;
            feedbackEntity.CompletedAt = DateTime.UtcNow;
            feedbackEntity.ErrorMessage = null;
            await _mediator.Publish(new ResumeAnalyzedEvent(resumeId, feedbackEntity.Id, feedbackEntity.UserId));
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

    public async Task AnalyzeJobResume(int feedbackId)
    {
        var feedbackEntity = await _dbContext.ResumeJobFeedbacks
            .Include(f => f.Resume)
            .Include(f => f.UserJob)
            .FirstOrDefaultAsync(f => f.Id == feedbackId);
        if (feedbackEntity == null)
        {
            throw new InvalidOperationException($"Feedback with ID {feedbackId} not found.");
        }

        if (feedbackEntity.Status == ProcessingStatus.Completed)
            return;
        try
        {
            var resumeTextUrl = feedbackEntity.Resume.ParsedTextUrl;
            var resumeText = await _storage.GetResumeTextAsync(resumeTextUrl);
            Console.WriteLine("Resume Text = " + resumeText);
            var jobDto = new JobSentDto
            {
                Company = feedbackEntity.UserJob.Company,
                JobTitle = feedbackEntity.UserJob.JobTitle,
                JobDescription = feedbackEntity.UserJob.JobDescription
            };

            var aiResult = await _aiAnalysis.GetJobResumeAnalysisAsync(resumeText, jobDto);
            // update the feedback object
            feedbackEntity.OverallMatchScore = aiResult.OverallScore;
            feedbackEntity.KeywordMatch = aiResult.KeywordMatch;
            feedbackEntity.SkillsMatch = aiResult.SkillsMatch;
            feedbackEntity.ExperienceAlignment = aiResult.ExperienceAlignment;
            feedbackEntity.EducationAlignment = aiResult.EducationAlignment;
            feedbackEntity.AtsCompatibility = aiResult.AtsCompatibility;
            // update status to completed
            feedbackEntity.Status = ProcessingStatus.Completed;
            feedbackEntity.CompletedAt = DateTime.UtcNow;
            feedbackEntity.ErrorMessage = null;
            await _mediator.Publish(new JobAnalyzedEvent(feedbackEntity.UserJobId, feedbackEntity.ResumeId, feedbackId,
                feedbackEntity.UserId));
        }
        catch (Exception e)
        {
            // _logger.LogError(e, "Failed to analyze feedback {FeedbackId}", feedbackId);
            feedbackEntity.Status = ProcessingStatus.Failed;
            feedbackEntity.ErrorMessage = e.Message;
            feedbackEntity.CompletedAt = DateTime.UtcNow;
        }
        finally
        {
            await _dbContext.SaveChangesAsync();
        }
    }
}