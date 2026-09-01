using backend.Data;
using backend.DTO.Analytics;
using backend.models;
using backend.Services;
using backend.Services.Analytics;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Tests.Services.Analytics;

public class HistogramProviderTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly DbContextOptions<ResumeDbContext> _dbOptions;

    public HistogramProviderTests()
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
    public async Task GetHistogramScoresAsync_BucketsScoresCorrectly_IncludingBoundaries()
    {
        // Arrange
        var userId = "test-user";
        _mockCurrentUserService.Setup(s => s.GetUserId()).Returns(userId);

        using var context = new ResumeDbContext(_dbOptions);
        
        // Seed Data testing all boundary conditions
        var jobs = new List<UserJob>
        {
            // 1. NotAnalyzed (0) -> No feedback list provided (defaults to 0 via Max)
            new() { Id = 1, UserId = userId, Archived = false, JobTitle = "A", Company = "A", JobDescription = "A" },
            
            // 2. Below40 (39)
            new() { Id = 2, UserId = userId, Archived = false, JobTitle = "B", Company = "B", JobDescription = "B", 
                Feedbacks = new List<ResumeJobFeedback> { new() { ResumeId = 1, UserJobId = 2, UserId = userId, OverallMatchScore = 39 } } },
            
            // 3. Between40And60 (Boundary test: Exactly 40) - Archived
            new() { Id = 3, UserId = userId, Archived = true, JobTitle = "C", Company = "C", JobDescription = "C", 
                Feedbacks = new List<ResumeJobFeedback> { new() { ResumeId = 1, UserJobId = 3, UserId = userId, OverallMatchScore = 40 } } },
                
            // 4. Between40And60 (59)
            new() { Id = 4, UserId = userId, Archived = false, JobTitle = "D", Company = "D", JobDescription = "D", 
                Feedbacks = new List<ResumeJobFeedback> { new() { ResumeId = 1, UserJobId = 4, UserId = userId, OverallMatchScore = 59 } } },
                
            // 5. Between60And80 (Boundary test: Exactly 60)
            new() { Id = 5, UserId = userId, Archived = false, JobTitle = "E", Company = "E", JobDescription = "E", 
                Feedbacks = new List<ResumeJobFeedback> { new() { ResumeId = 1, UserJobId = 5, UserId = userId, OverallMatchScore = 60 } } },
                
            // 6. Between60And80 (79) - Archived
            new() { Id = 6, UserId = userId, Archived = true, JobTitle = "F", Company = "F", JobDescription = "F", 
                Feedbacks = new List<ResumeJobFeedback> { new() { ResumeId = 1, UserJobId = 6, UserId = userId, OverallMatchScore = 79 } } },
                
            // 7. Above80 (Boundary test: Exactly 80)
            new() { Id = 7, UserId = userId, Archived = false, JobTitle = "G", Company = "G", JobDescription = "G", 
                Feedbacks = new List<ResumeJobFeedback> { new() { ResumeId = 1, UserJobId = 7, UserId = userId, OverallMatchScore = 80 } } },
                
            // 8. Above80 (100) -> Test multiple feedbacks choosing the max
            new() { Id = 8, UserId = userId, Archived = false, JobTitle = "H", Company = "H", JobDescription = "H", 
                Feedbacks = new List<ResumeJobFeedback> { 
                    new() { ResumeId = 1, UserJobId = 8, UserId = userId, OverallMatchScore = 50 },
                    new() { ResumeId = 1, UserJobId = 8, UserId = userId, OverallMatchScore = 100 }
                } },

            // 9. Different User (Should be entirely ignored)
            new() { Id = 9, UserId = "other-user", Archived = false, JobTitle = "I", Company = "I", JobDescription = "I", 
                Feedbacks = new List<ResumeJobFeedback> { new() { ResumeId = 1, UserJobId = 9, UserId = "other", OverallMatchScore = 90 } } }
        };

        context.UserJobs.AddRange(jobs);
        await context.SaveChangesAsync();

        var mockFactory = CreateMockContextFactory(context);
        var provider = new HistogramProvider(mockFactory, _mockCurrentUserService.Object);

        // Act
        var result = await provider.GetHistogramScoresAsync(CancellationToken.None);

        // Assert
        Assert.NotNull(result.IncludingArchived);
        Assert.NotNull(result.ActiveOnly);

        // Ensure all possible enum values are present in the dictionary
        var allBuckets = Enum.GetValues<ScoreBucket>();
        Assert.Equal(allBuckets.Length, result.IncludingArchived.Count);
        Assert.Equal(allBuckets.Length, result.ActiveOnly.Count);

        // Assert - Including Archived (All user jobs)
        Assert.Equal(1, result.IncludingArchived[ScoreBucket.NotAnalyzed]);      // Job 1
        Assert.Equal(1, result.IncludingArchived[ScoreBucket.Below40]);          // Job 2
        Assert.Equal(2, result.IncludingArchived[ScoreBucket.Between40And60]);   // Jobs 3, 4
        Assert.Equal(2, result.IncludingArchived[ScoreBucket.Between60And80]);   // Jobs 5, 6
        Assert.Equal(2, result.IncludingArchived[ScoreBucket.Above80]);          // Jobs 7, 8

        // Assert - Active Only (Ignores Job 3 and Job 6)
        Assert.Equal(1, result.ActiveOnly[ScoreBucket.NotAnalyzed]);      // Job 1
        Assert.Equal(1, result.ActiveOnly[ScoreBucket.Below40]);          // Job 2
        Assert.Equal(1, result.ActiveOnly[ScoreBucket.Between40And60]);   // Job 4
        Assert.Equal(1, result.ActiveOnly[ScoreBucket.Between60And80]);   // Job 5
        Assert.Equal(2, result.ActiveOnly[ScoreBucket.Above80]);          // Jobs 7, 8
    }

    [Fact]
    public async Task GetHistogramScoresAsync_ReturnsZeros_WhenNoJobsFound()
    {
        // Arrange
        _mockCurrentUserService.Setup(s => s.GetUserId()).Returns("empty-user");
        
        using var context = new ResumeDbContext(_dbOptions);
        // Do not seed any data
        
        var mockFactory = CreateMockContextFactory(context);
        var provider = new HistogramProvider(mockFactory, _mockCurrentUserService.Object);

        // Act
        var result = await provider.GetHistogramScoresAsync(CancellationToken.None);

        // Assert
        var allBuckets = Enum.GetValues<ScoreBucket>();
        
        Assert.Equal(allBuckets.Length, result.IncludingArchived.Count);
        Assert.Equal(allBuckets.Length, result.ActiveOnly.Count);

        // Ensure every single bucket is explicitly mapped to 0
        Assert.All(allBuckets, bucket => 
        {
            Assert.Equal(0, result.IncludingArchived[bucket]);
            Assert.Equal(0, result.ActiveOnly[bucket]);
        });
    }
}
