using backend.Data;
using backend.models;
using backend.Services;
using backend.Services.Analytics;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Tests.Services.Analytics;

public class KpiProviderTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly DbContextOptions<ResumeDbContext> _dbOptions;

    public KpiProviderTests()
    {
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        
        // Setup In-Memory Database Options for isolated test runs
        _dbOptions = new DbContextOptionsBuilder<ResumeDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    private IDbContextFactory<ResumeDbContext> CreateMockContextFactory(ResumeDbContext context)
    {
        var mockFactory = new Mock<IDbContextFactory<ResumeDbContext>>();
        mockFactory.Setup(f => f.CreateDbContextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(context);
        return mockFactory.Object;
    }

    [Fact]
    public async Task GetUserJobKpisAsync_CalculatesKpisCorrectly()
    {
        // Arrange
        var userId = "test-user-id";
        _mockCurrentUserService.Setup(s => s.GetUserId()).Returns(userId);

        // We use UtcNow to ensure it falls within the GetStartOfWeek() boundary
        var today = DateTime.UtcNow;
        var twoWeeksAgo = DateTime.UtcNow.AddDays(-14);

        using var context = new ResumeDbContext(_dbOptions);
        
        // Seed Data using the exact models
        var jobs = new List<UserJob>
        {
            // 1. Active, Added this week, Interviewing, Max Score = 80
            new() 
            { 
                Id = 1, UserId = userId, Archived = false, UploadDate = today, Status = JobStatus.Interviewing,
                JobTitle = "Software Engineer", Company = "Tech Corp", JobDescription = "Test desc",
                Feedbacks = new List<ResumeJobFeedback> 
                { 
                    new() { ResumeId = 1, UserJobId = 1, UserId = userId, OverallMatchScore = 50 }, 
                    new() { ResumeId = 1, UserJobId = 1, UserId = userId, OverallMatchScore = 80 } 
                }
            },
            // 2. Active, Added past week, Offered, Max Score = 90
            new() 
            { 
                Id = 2, UserId = userId, Archived = false, UploadDate = twoWeeksAgo, Status = JobStatus.Offered,
                JobTitle = "Senior Dev", Company = "Other Corp", JobDescription = "Test desc",
                Feedbacks = new List<ResumeJobFeedback> 
                { 
                    new() { ResumeId = 1, UserJobId = 2, UserId = userId, OverallMatchScore = 90 } 
                }
            },
            // 3. Archived, Added this week, Applied status, Max Score = 40
            new() 
            { 
                Id = 3, UserId = userId, Archived = true, UploadDate = today, Status = JobStatus.Applied,
                JobTitle = "Manager", Company = "Old Corp", JobDescription = "Test desc",
                Feedbacks = new List<ResumeJobFeedback> 
                { 
                    new() { ResumeId = 2, UserJobId = 3, UserId = userId, OverallMatchScore = 40 } 
                }
            },
            // 4. Different User's Job (Should be totally ignored by KPI calculation)
            new() 
            { 
                Id = 4, UserId = "different-user", Archived = false, UploadDate = today, Status = JobStatus.Interviewing,
                JobTitle = "CEO", Company = "Different Corp", JobDescription = "Test desc",
                Feedbacks = new List<ResumeJobFeedback> 
                { 
                    new() { ResumeId = 3, UserJobId = 4, UserId = "different-user", OverallMatchScore = 100 } 
                }
            }
        };

        context.UserJobs.AddRange(jobs);
        await context.SaveChangesAsync();

        var mockFactory = CreateMockContextFactory(context);
        var kpiProvider = new KpiProvider(mockFactory, _mockCurrentUserService.Object);

        // Act
        var result = await kpiProvider.GetUserJobKpisAsync(CancellationToken.None);

        // Assert - Active Only
        Assert.NotNull(result.ActiveOnly);
        Assert.Equal(2, result.ActiveOnly.TotalJobs); // Jobs 1 and 2
        Assert.Equal(1, result.ActiveOnly.AddedThisWeek); // Job 1
        
        // Calculations for Active Rates
        // Interviews = 1, Total = 2 => (1/2)*100 = 50
        Assert.Equal(50, result.ActiveOnly.InterviewRatePercent); 
        
        // Offers = 1, Total = 2 => (1/2)*100 = 50
        Assert.Equal(50, result.ActiveOnly.OfferRatePercent);
        
        // Scores: Max of Job 1 (80) + Max of Job 2 (90) = 170. Total = 2. 
        Assert.Equal(85, result.ActiveOnly.AverageMatchScore); 

        // Assert - Including Archived
        Assert.NotNull(result.IncludingArchived);
        Assert.Equal(3, result.IncludingArchived.TotalJobs); // Jobs 1, 2, 3
        Assert.Equal(2, result.IncludingArchived.AddedThisWeek); // Jobs 1, 3
        
        // Calculations for All Rates
        // Interviews = 1, Total = 3 => (1/3)*100 = 33.333...
        Assert.Equal(33.33, Math.Round(result.IncludingArchived.InterviewRatePercent.Value, 2));
        
        // Offers = 1, Total = 3 => (1/3)*100 = 33.333...
        Assert.Equal(33.33, Math.Round(result.IncludingArchived.OfferRatePercent.Value, 2));
        
        // Scores: 80 + 90 + 40 = 210. Total = 3. 
        Assert.Equal(70, result.IncludingArchived.AverageMatchScore);
    }

    [Fact]
    public async Task GetUserJobKpisAsync_ReturnsZeros_WhenNoJobsFound()
    {
        // Arrange
        _mockCurrentUserService.Setup(s => s.GetUserId()).Returns("user-with-no-jobs");
        
        using var context = new ResumeDbContext(_dbOptions);
        // Do not seed any data
        
        var mockFactory = CreateMockContextFactory(context);
        var kpiProvider = new KpiProvider(mockFactory, _mockCurrentUserService.Object);

        // Act
        var result = await kpiProvider.GetUserJobKpisAsync(CancellationToken.None);

        // Assert
        Assert.Equal(0, result.ActiveOnly.TotalJobs);
        Assert.Equal(0, result.ActiveOnly.InterviewRatePercent);
        Assert.Equal(0, result.ActiveOnly.AverageMatchScore);

        Assert.Equal(0, result.IncludingArchived.TotalJobs);
        Assert.Equal(0, result.IncludingArchived.InterviewRatePercent);
        Assert.Equal(0, result.IncludingArchived.AverageMatchScore);
    }
}
