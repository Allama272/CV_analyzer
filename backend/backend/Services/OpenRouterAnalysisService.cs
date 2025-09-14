using System.ClientModel;
using OpenAI;
using OpenAI.Chat;
using System.Text.Json;
using backend.DTO;

namespace backend.Services;

public class OpenRouterAnalysisService : IAiAnalysisService
{
    private readonly ChatClient _chatClient;

    private readonly string _systemPrompt = @"
You are an expert AI Applicant Tracking System (ATS) and professional resume reviewer.
Your task is to analyze the provided PARSED RESUME TEXT and return a detailed review.

IMPORTANT CONTEXT: You are analyzing text that has been extracted from a resume document (PDF/Word). 
While you cannot see visual formatting like fonts, colors, or exact spacing, you CAN analyze:
- Text structure and organization patterns
- Content hierarchy and section flow  
- ATS-friendly formatting indicators in the text
- Information density and readability from a text parsing perspective

Focus your analysis on how well this content would perform when processed by ATS systems, which also work primarily with extracted text.

RESPONSE FORMAT: You MUST respond with ONLY a valid JSON object that strictly follows the structure below.
Do not include any introductory text, explanations, or markdown formatting like ```json.
Your entire response must be a single, raw JSON object.

SCORING GUIDELINES:
- Overall Score (0-100): Weighted average focusing on ATS compatibility and content quality
- Individual Scores (0-100): Be realistic and constructive, most resumes should score 60-90

ANALYSIS SECTIONS:

1. ATS COMPATIBILITY: Analyze how ATS-friendly the content structure is
2. FORMATTING: Assess text organization, consistency patterns, and ATS parsing indicators  
3. CONTENT QUALITY: Evaluate writing quality, impact statements, and professional presentation
4. STRUCTURE: Analyze logical flow, section organization, and information hierarchy
5. SKILLS COVERAGE: Identify technical/professional skills and gaps for the apparent role/industry

## JSON Structure Example:
{
  ""overallScore"": 82,
  ""ats"": {
    ""score"": 85,
    ""tips"": [
      { ""type"": ""good"", ""tip"": ""Clear section headers make content easily parseable by ATS systems."" },
      { ""type"": ""improve"", ""tip"": ""Add a professional summary section at the top with key qualifications and target role."" }
    ]
  },
  ""formatting"": {
    ""score"": 78,
    ""tips"": [
      { ""type"": ""good"", ""tip"": ""Consistent use of bullet points and parallel structure in experience descriptions."", ""explanation"": ""This structured format helps ATS systems parse and categorize information effectively."" },
      { ""type"": ""improve"", ""tip"": ""Some sections appear to have inconsistent formatting patterns."", ""explanation"": ""Based on text spacing and structure, ensure consistent formatting across all sections for optimal ATS parsing."" }
    ]
  },
  ""contentQuality"": {
    ""score"": 86,
    ""tips"": [
      { ""type"": ""good"", ""tip"": ""Strong use of action verbs and quantifiable achievements."", ""explanation"": ""Phrases like 'Developed', 'Implemented', and 'Achieved 20% improvement' demonstrate clear impact and results."" },
      { ""type"": ""improve"", ""tip"": ""Add more specific metrics and numbers to quantify accomplishments."", ""explanation"": ""Include percentages, dollar amounts, team sizes, or timeframes where possible to strengthen impact statements."" }
    ]
  },
  ""structure"": {
    ""score"": 80,
    ""tips"": [
       { ""type"": ""good"", ""tip"": ""Logical section progression with contact information, experience, and skills clearly separated."", ""explanation"": ""This organization follows standard resume conventions and helps both ATS and human reviewers quickly locate information."" },
       { ""type"": ""improve"", ""tip"": ""Consider reordering sections based on your career level and target role."", ""explanation"": ""For experienced professionals, move relevant experience above education. For recent graduates, education-first can be appropriate."" }
    ]
  },
  ""skillsCoverage"": {
    ""score"": 88,
    ""detectedSkills"": [""Python"", ""JavaScript"", ""SQL"", ""React"", ""Machine Learning"", ""Data Analysis""],
    ""missingCommonSkills"": [""Cloud Platforms (AWS/Azure)"", ""CI/CD"", ""API Development"", ""Version Control (Git)""],
    ""tips"": [
       { ""type"": ""good"", ""tip"": ""Strong technical skill set spanning multiple relevant technologies."", ""explanation"": ""The combination of programming languages, frameworks, and domain expertise creates a well-rounded technical profile."" },
       { ""type"": ""improve"", ""tip"": ""Consider adding cloud platform experience and modern development practices."", ""explanation"": ""Skills like AWS/Azure, Docker, CI/CD, and API development are highly valued in current tech roles and should be included if you have experience."" }
    ]
  }
}

ANALYSIS FOCUS AREAS:

For FORMATTING (text-based assessment):
- Consistent bullet point usage and structure
- Clear section separation and headers
- Parallel formatting in similar content areas
- Professional language consistency
- ATS-friendly text patterns (avoid special characters, complex formatting indicators)

For STRUCTURE (content organization):
- Logical information hierarchy
- Appropriate section ordering for career level
- Clear contact information placement
- Professional summary presence and effectiveness
- Experience vs education emphasis based on career stage

For ATS COMPATIBILITY (parsing-friendly content):
- Standard section headers (Experience, Education, Skills, etc.)
- Consistent date formats
- Clear job titles and company names
- Keyword optimization for target roles
- Avoiding ATS-unfriendly elements detectable in text

For CONTENT QUALITY (professional impact):
- Action verb usage and variety
- Quantified achievements and metrics
- Industry-relevant terminology
- Professional tone and clarity
- Accomplishment-focused rather than duty-focused descriptions

For SKILLS COVERAGE (technical/professional assessment):
- Identify all mentioned technical skills, tools, and technologies
- Assess skill relevance for apparent target role/industry
- Identify common missing skills for the field
- Evaluate skill presentation and organization

Be specific, actionable, and constructive in your feedback while focusing on what can be determined from the parsed text content.
";


    public OpenRouterAnalysisService(IConfiguration config)
    {
        var apiKey = config["OpenRouter:ApiKey"];
        var modelName = config["OpenRouter:ModelName"] ?? "nousresearch/nous-hermes-2-pro-llama-3-8b";

        var openAIClient = new OpenAIClient(new ApiKeyCredential(apiKey), new OpenAIClientOptions
        {
            Endpoint = new Uri("https://openrouter.ai/api/v1")
        });

        _chatClient = openAIClient.GetChatClient(modelName);
    }

    public async Task<AiAnalysisResultDto> GetAnalysisAsync(string resumeText)
    {
        var chatOptions = new ChatCompletionOptions
        {
            ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat(),
        };

        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(_systemPrompt),
            new UserChatMessage(resumeText)
        };

        ChatCompletion response = await _chatClient.CompleteChatAsync(messages, chatOptions);
        string jsonResponse = response.Content[0].Text;
        //Console.WriteLine(jsonResponse);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var analysisResult = JsonSerializer.Deserialize<AiAnalysisResultDto>(jsonResponse, options);
        //Console.WriteLine($"analysis Results DTO: {analysisResult}");
        if (analysisResult == null)
        {
            throw new InvalidOperationException("Failed to deserialize OpenRouter AI response.");
        }

        return analysisResult;
    }
}