using backend.Data;
using backend.models;
using backend.Services;
using backend.Services.Analytics;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Tests.Services.Analytics;

public class StatusProviderTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly DbContextOptions<ResumeDbContext> _dbOptions;

    public StatusProviderTests()
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
    public async Task GetBreakdownAsync_CalculatesStatusCountsCorrectly()
    {
        // Arrange
        var userId = "test-user";
        _mockCurrentUserService.Setup(s => s.GetUserId()).Returns(userId);

        using var context = new ResumeDbContext(_dbOptions);
        
        // Seed Data
        var jobs = new List<UserJob>
        {
            // --- Target User Jobs ---
            // 1 Active Saved
            new() { Id = 1, UserId = userId, Status = JobStatus.Saved, Archived = false, JobTitle = "A", Company = "A", JobDescription = "A" },
            
            // 2 Active Applied, 1 Archived Applied (Total 3, Active 2)
            new() { Id = 2, UserId = userId, Status = JobStatus.Applied, Archived = false, JobTitle = "B", Company = "B", JobDescription = "B" },
            new() { Id = 3, UserId = userId, Status = JobStatus.Applied, Archived = false, JobTitle = "C", Company = "C", JobDescription = "C" },
            new() { Id = 4, UserId = userId, Status = JobStatus.Applied, Archived = true, JobTitle = "D", Company = "D", JobDescription = "D" },
            
            // 1 Archived Interviewing (Total 1, Active 0)
            new() { Id = 5, UserId = userId, Status = JobStatus.Interviewing, Archived = true, JobTitle = "E", Company = "E", JobDescription = "E" },
            
            // (Note: Zero jobs for Offered and Rejected)

            // --- Different User Jobs (Should be ignored entirely) ---
            new() { Id = 6, UserId = "other-user", Status = JobStatus.Offered, Archived = false, JobTitle = "F", Company = "F", JobDescription = "F" },
            new() { Id = 7, UserId = "other-user", Status = JobStatus.Saved, Archived = false, JobTitle = "G", Company = "G", JobDescription = "G" },
        };

        context.UserJobs.AddRange(jobs);
        await context.SaveChangesAsync();

        var mockFactory = CreateMockContextFactory(context);
        var statusProvider = new StatusProvider(mockFactory, _mockCurrentUserService.Object);

        // Act
        var result = await statusProvider.GetBreakdownAsync(CancellationToken.None);

        // Assert - Dictionaries exist and contain ALL enum values
        var allStatuses = Enum.GetValues<JobStatus>();
        Assert.NotNull(result.IncludingArchived);
        Assert.NotNull(result.ActiveOnly);
        Assert.Equal(allStatuses.Length, result.IncludingArchived.Count);
        Assert.Equal(allStatuses.Length, result.ActiveOnly.Count);

        // Assert - Including Archived Totals
        Assert.Equal(1, result.IncludingArchived[JobStatus.Saved]);
        Assert.Equal(3, result.IncludingArchived[JobStatus.Applied]);
        Assert.Equal(1, result.IncludingArchived[JobStatus.Interviewing]);
        Assert.Equal(0, result.IncludingArchived[JobStatus.Offered]); // Zero check
        Assert.Equal(0, result.IncludingArchived[JobStatus.Rejected]); // Zero check

        // Assert - Active Only Totals
        Assert.Equal(1, result.ActiveOnly[JobStatus.Saved]);
        Assert.Equal(2, result.ActiveOnly[JobStatus.Applied]);
        Assert.Equal(0, result.ActiveOnly[JobStatus.Interviewing]); // Archived only check
        Assert.Equal(0, result.ActiveOnly[JobStatus.Offered]);
        Assert.Equal(0, result.ActiveOnly[JobStatus.Rejected]);
    }

    [Fact]
    public async Task GetBreakdownAsync_ReturnsZeros_WhenUserHasNoJobs()
    {
        // Arrange
        _mockCurrentUserService.Setup(s => s.GetUserId()).Returns("empty-user");
        
        using var context = new ResumeDbContext(_dbOptions);
        // Do not seed any data
        
        var mockFactory = CreateMockContextFactory(context);
        var statusProvider = new StatusProvider(mockFactory, _mockCurrentUserService.Object);

        // Act
        var result = await statusProvider.GetBreakdownAsync(CancellationToken.None);

        // Assert
        var allStatuses = Enum.GetValues<JobStatus>();
        
        Assert.Equal(allStatuses.Length, result.IncludingArchived.Count);
        Assert.Equal(allStatuses.Length, result.ActiveOnly.Count);
        
        // Every single status must be correctly mapped to 0
        Assert.All(allStatuses, status => 
        {
            Assert.Equal(0, result.IncludingArchived[status]);
            Assert.Equal(0, result.ActiveOnly[status]);
        });
    }
}
