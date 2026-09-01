using backend.Data;
using backend.models;
using backend.Services;
using backend.Services.Analytics;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Tests.Services.Analytics;

public class JobsOverTimeProviderTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly DbContextOptions<ResumeDbContext> _dbOptions;

    public JobsOverTimeProviderTests()
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
    public async Task GetWeeklyJobsAsync_BucketsJobsCorrectly_Over8Weeks()
    {
        // Arrange
        var userId = "test-user";
        _mockCurrentUserService.Setup(s => s.GetUserId()).Returns(userId);

        // Use UtcNow to align with the service's DateTime.UtcNow
        var today = DateTime.UtcNow;
        var oneWeekAgo = today.AddDays(-7);
        var sevenWeeksAgo = today.AddDays(-49); // The oldest valid week
        var tenWeeksAgo = today.AddDays(-70);   // Outside the 8-week window

        using var context = new ResumeDbContext(_dbOptions);
        
        var jobs = new List<UserJob>
        {
            // --- Current Week ---
            new() { Id = 1, UserId = userId, UploadDate = today, Archived = false, JobTitle = "A", Company = "A", JobDescription = "A" },
            new() { Id = 2, UserId = userId, UploadDate = today, Archived = true, JobTitle = "B", Company = "B", JobDescription = "B" },
            
            // --- 1 Week Ago ---
            new() { Id = 3, UserId = userId, UploadDate = oneWeekAgo, Archived = false, JobTitle = "C", Company = "C", JobDescription = "C" },
            
            // --- 7 Weeks Ago (Oldest valid bucket) ---
            new() { Id = 4, UserId = userId, UploadDate = sevenWeeksAgo, Archived = true, JobTitle = "D", Company = "D", JobDescription = "D" },
            
            // --- 10 Weeks Ago (Should be entirely ignored) ---
            new() { Id = 5, UserId = userId, UploadDate = tenWeeksAgo, Archived = false, JobTitle = "E", Company = "E", JobDescription = "E" },
            
            // --- Different User (Should be entirely ignored) ---
            new() { Id = 6, UserId = "other-user", UploadDate = today, Archived = false, JobTitle = "F", Company = "F", JobDescription = "F" },
        };

        context.UserJobs.AddRange(jobs);
        await context.SaveChangesAsync();

        var mockFactory = CreateMockContextFactory(context);
        var provider = new JobsOverTimeProvider(mockFactory, _mockCurrentUserService.Object);

        // Act
        var result = await provider.GetWeeklyJobsAsync(CancellationToken.None);

        // Assert - Structural integrity
        Assert.NotNull(result.IncludingArchived);
        Assert.NotNull(result.ActiveOnly);
        
        var allBuckets = result.IncludingArchived.ToList();
        var activeBuckets = result.ActiveOnly.ToList();

        Assert.Equal(8, allBuckets.Count);
        Assert.Equal(8, activeBuckets.Count);

        // The buckets are built from oldest (index 0) to newest (index 7)
        // Assert - Bucket 7 (Current Week)
        Assert.Equal(2, allBuckets[7].Count);
        Assert.Equal(1, activeBuckets[7].Count);

        // Assert - Bucket 6 (1 Week Ago)
        Assert.Equal(1, allBuckets[6].Count);
        Assert.Equal(1, activeBuckets[6].Count);

        // Assert - Bucket 0 (7 Weeks Ago - Oldest bucket)
        Assert.Equal(1, allBuckets[0].Count);
        Assert.Equal(0, activeBuckets[0].Count); // It was archived

        // Assert - All other buckets should be 0
        for (int i = 1; i <= 5; i++)
        {
            Assert.Equal(0, allBuckets[i].Count);
            Assert.Equal(0, activeBuckets[i].Count);
        }

        // Assert - Dates advance by 7 days per bucket
        for (int i = 0; i < 7; i++)
        {
            var currentBucketDate = allBuckets[i].WeekStart;
            var nextBucketDate = allBuckets[i + 1].WeekStart;
            
            Assert.Equal(currentBucketDate.AddDays(7), nextBucketDate);
        }
    }

    [Fact]
    public async Task GetWeeklyJobsAsync_ReturnsEmptyBuckets_WhenNoJobsFound()
    {
        // Arrange
        _mockCurrentUserService.Setup(s => s.GetUserId()).Returns("empty-user");
        
        using var context = new ResumeDbContext(_dbOptions);
        // Do not seed any data
        
        var mockFactory = CreateMockContextFactory(context);
        var provider = new JobsOverTimeProvider(mockFactory, _mockCurrentUserService.Object);

        // Act
        var result = await provider.GetWeeklyJobsAsync(CancellationToken.None);

        // Assert
        var allBuckets = result.IncludingArchived.ToList();
        var activeBuckets = result.ActiveOnly.ToList();
        
        Assert.Equal(8, allBuckets.Count);
        Assert.Equal(8, activeBuckets.Count);

        Assert.All(allBuckets, bucket => Assert.Equal(0, bucket.Count));
        Assert.All(activeBuckets, bucket => Assert.Equal(0, bucket.Count));
    }
}
