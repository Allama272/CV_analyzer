using System.Text.RegularExpressions;
using AngleSharp.Html.Parser;
using backend.DTO;
using backend.DTO.JobDTO;
using backend.Helpers;

namespace backend.Services.Jobs;

public partial class LinkedinParserStrategy : IJobParserStrategy
{
    public string SiteName => "linkedin";
    private static readonly string GuestApi = "https://www.linkedin.com/jobs-guest/jobs/api/jobPosting";

    private readonly HttpClient _httpClient;

    public LinkedinParserStrategy(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ServiceResult<JobFillDto>> ScrapeJob(string jobLink)
    {
        //  Extract the Job ID
        var match = MyRegex().Match(jobLink);
        if (!match.Success)
            return ServiceResult<JobFillDto>.Failure("Cant Find Job Id");

        string jobId = match.Value;
        string guestUrl = $"{GuestApi}/{jobId}";

        // Fetch HTML using HttpClient to avoid bot detection
        var response = await _httpClient.GetAsync(guestUrl);
        if (!response.IsSuccessStatusCode)
            return ServiceResult<JobFillDto>.Failure("Failed to fetch job from LinkedIn");

        string htmlContent = await response.Content.ReadAsStringAsync();

        //  Parse with AngleSharp
        var parser = new HtmlParser();
        var doc = await parser.ParseDocumentAsync(htmlContent);

        // Query the DOM
        var titleElement = doc.QuerySelector(".top-card-layout__title");
        var companyElement = doc.QuerySelector(".topcard__org-name-link");
        var descriptionElement = doc.QuerySelector(".show-more-less-html__markup");

        // Get the Image URL
        var imageElement = doc.QuerySelector(".artdeco-entity-image");
        string? logoUrl = imageElement?.GetAttribute("data-delayed-url") ?? imageElement?.GetAttribute("src");

        // Clean the desc
        if (descriptionElement is null)
            return ServiceResult<JobFillDto>.Failure("Could not find job description");
        var converter = new ReverseMarkdown.Converter(new ReverseMarkdown.Config
        {
            Tags =
            {
                Unknown = ReverseMarkdown.Config.UnknownTagsOption.Drop
            },
            Formatting =
            {
                RemoveComments = true
            },
            Links =
            {
                SmartHref = true
            },
            GithubFlavored = true
        });
        string cleanDescription = converter.Convert(descriptionElement.InnerHtml);
        // var cleanDescription = HtmlToPlainText.Convert(descriptionElement);


        return ServiceResult<JobFillDto>.Success(new JobFillDto
        {
            JobTitle = titleElement?.TextContent.Trim(),
            Company = companyElement?.TextContent.Trim(),
            JobDescription = cleanDescription,
            LogoUrl = logoUrl
        });
    }

    [GeneratedRegex(@"(\d{9,10})")]
    private static partial Regex MyRegex();
}