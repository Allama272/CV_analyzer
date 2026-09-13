using System.ClientModel;
using System.Text.Json;
using backend.DTO;
using backend.DTO.JobDTO;
using OpenAI;
using OpenAI.Chat;

namespace backend.Services.Analysis;

public class OpenRouterAnalysisService : IAiAnalysisService
{
    private readonly ChatClient _chatClient;

    private readonly string _systemPrompt = @"
Analyze this resume and return ONLY valid JSON. No markdown, no explanations.

RESPONSE FORMAT: You MUST respond with ONLY a valid JSON object that strictly follows the structure below.
Do not include any introductory text, explanations, or markdown formatting like ```json.
Your entire response must be a single, raw JSON object.
{
  ""overallScore"": 0-100,
  ""ats"": {
    ""score"": 0-100,
    ""tips"": [{""type"": ""good/improve"", ""tip"": ""text""}]
  },
  ""formatting"": {
    ""score"": 0-100,
    ""tips"": [{""type"": ""good/improve"", ""tip"": ""text""}]
  },
  ""contentQuality"": {
    ""score"": 0-100,
    ""tips"": [{""type"": ""good/improve"", ""tip"": ""text""}]
  },
  ""structure"": {
    ""score"": 0-100,
    ""tips"": [{""type"": ""good/improve"", ""tip"": ""text""}]
  },
  ""skillsCoverage"": {
    ""score"": 0-100,
    ""detectedSkills"": [""skill1"", ""skill2""],
    ""missingCommonSkills"": [""skill3""],
    ""tips"": [{""type"": ""good/improve"", ""tip"": ""text""}]
  }
}

Score based on: ATS compatibility, formatting consistency, content quality, logical structure, and skill relevance.
";

    private readonly string _jobSystemPrompt = @"
Analyze how well this resume matches the given job description and return ONLY valid JSON. No markdown, no explanations.

RESPONSE FORMAT: You MUST respond with ONLY a valid JSON object that strictly follows the structure below.
Do not include any introductory text, explanations, or markdown formatting like ```json.
Your entire response must be a single, raw JSON object.
{
  ""overallScore"": 0-100,
  ""keywordMatch"": {
    ""matched"": [""keyword1"", ""keyword2""],
    ""missing"": [""keyword3""],
    ""score"": 0-100,
    ""tips"": [{""type"": ""Good/Improve"", ""explanation"": ""text""}]
  },
  ""skillsMatch"": {
    ""matchedSkills"": [""skill1""],
    ""missingSkills"": [""skill2""],
    ""score"": 0-100,
    ""tips"": [{""type"": ""Good/Improve"", ""explanation"": ""text""}]
  },
  ""experienceAlignment"": {
    ""score"": 0-100,
    ""matchedExperience"": [""experience1""],
    ""gaps"": [""gap1""],
    ""tips"": [{""type"": ""Good/Improve"", ""explanation"": ""text""}]
  },
  ""educationAlignment"": {
    ""matched"": [""requirement1""],
    ""missing"": [""requirement2""],
    ""score"": 0-100,
    ""tips"": [{""type"": ""Good/Improve"", ""explanation"": ""text""}]
  },
  ""atsCompatibility"": {
    ""score"": 0-100,
    ""tips"": [{""type"": ""Good/Improve"", ""explanation"": ""text""}]
  }
}   

Score based on: how well resume keywords match the job description, overlap between resume skills and required skills,
alignment of the candidate's experience with the role's requirements, education/certification alignment, and ATS compatibility
of the resume for this specific job posting. Be specific and reference actual content from both the resume and the job description
in your tips, matched/missing lists, and gaps.
";

    private readonly ChatCompletionOptions _chatOptions = new()
    {
        MaxOutputTokenCount = 4000,
        Temperature = 0.5f
    };

    public OpenRouterAnalysisService(IConfiguration config)
    {
        var apiKey = config["OpenRouter:ApiKey"];
        var modelName = config["OpenRouter:ModelName"] ?? "nousresearch/nous-hermes-2-pro-llama-3-8b";

        _chatClient = new ChatClient(
            model: modelName,
            credential: new ApiKeyCredential(apiKey),
            new OpenAIClientOptions
            {
                Endpoint = new Uri("https://openrouter.ai/api/v1")
            });
    }

    public async Task<AiAnalysisResultDto> GetResumeAnalysisAsync(string resumeText)
    {
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(_systemPrompt),
            new UserChatMessage(resumeText)
        };

        ChatCompletion response = await _chatClient.CompleteChatAsync(messages, _chatOptions);
        if (response == null)
        {
            throw new InvalidOperationException(
                "AI analysis failed. The API returned no choices. This usually indicates an OpenRouter error (e.g., invalid model, out of credits, or context limits).");
        }
        if (response?.Content == null || response.Content.Count == 0)
        {
            string finishReason = response?.FinishReason.ToString() ?? "Unknown";
            throw new InvalidOperationException(
                $"AI analysis failed. The API returned no content. Finish Reason: {finishReason}");
        }

        string jsonResponse = response.Content[0].Text ?? string.Empty;
        if (string.IsNullOrWhiteSpace(jsonResponse))
        {
            throw new InvalidOperationException(
                $"AI returned empty content. Finish Reason: {response.FinishReason}");
        }

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var analysisResult = JsonSerializer.Deserialize<AiAnalysisResultDto>(jsonResponse, options);

        if (analysisResult == null)
        {
            throw new InvalidOperationException(
                "Failed to deserialize the AI's JSON response into the expected format.");
        }

        return analysisResult;
    }

    public async Task<AnalyzedJobDto> GetJobResumeAnalysisAsync(string resumeText, JobSentDto jobDto)
    {
        string userPrompt = $@"
            JOB TITLE: {jobDto.JobTitle}
            COMPANY: {jobDto.Company}
            JOB DESCRIPTION:
            {jobDto.JobDescription}

            RESUME:
            {resumeText}
            ";

        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(_jobSystemPrompt),
            new UserChatMessage(userPrompt)
        };

        ChatCompletion response = await _chatClient.CompleteChatAsync(messages, _chatOptions);
        string finishReasonText = response != null
            ? response.FinishReason.ToString()
            : "null (response was null)";

        Console.WriteLine($"API FinishReason: {finishReasonText}");

        if (response?.Content == null || response.Content.Count == 0)
        {
            string finishReason = response?.FinishReason.ToString() ?? "Unknown";
            throw new InvalidOperationException(
                $"AI job analysis failed. The API returned no content. Finish Reason: {finishReason}");
        }

        string jsonResponse = response.Content[0].Text ?? string.Empty;
        Console.WriteLine("=== RAW AI RESPONSE ===");
        Console.WriteLine(jsonResponse);
        Console.WriteLine("=== END RAW ===");
        if (string.IsNullOrWhiteSpace(jsonResponse))
        {
            throw new InvalidOperationException(
                $"AI returned empty content. Finish Reason: {response.FinishReason}");
        }

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var analysisResult = JsonSerializer.Deserialize<AnalyzedJobDto>(jsonResponse, options);

        if (analysisResult == null)
        {
            throw new InvalidOperationException(
                "Failed to deserialize the AI's JSON response into the expected format.");
        }

        return analysisResult;
    }
}