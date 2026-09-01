using backend.Data;
using backend.models;
using backend.Services;
using backend.Services.Analytics;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Tests.Services.Analytics;

public class OutcomeProviderTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly DbContextOptions<ResumeDbContext> _dbOptions;

    public OutcomeProviderTests()
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
    public async Task GetOutcomesAsync_CalculatesOfferedAndRejectedCorrectly()
    {
        // Arrange
        var userId = "test-user";
        _mockCurrentUserService.Setup(s => s.GetUserId()).Returns(userId);

        using var context = new ResumeDbContext(_dbOptions);

        var jobs = new List<UserJob>
        {
            // --- Target User Jobs ---
            // 2 Active Offered
            new()
            {
                Id = 1, UserId = userId, Status = JobStatus.Offered, Archived = false, JobTitle = "A", Company = "A",
                JobDescription = "A"
            },
            new()
            {
                Id = 2, UserId = userId, Status = JobStatus.Offered, Archived = false, JobTitle = "B", Company = "B",
                JobDescription = "B"
            },

            // 1 Archived Offered
            new()
            {
                Id = 3, UserId = userId, Status = JobStatus.Offered, Archived = true, JobTitle = "C", Company = "C",
                JobDescription = "C"
            },

            // 1 Active Rejected
            new()
            {
                Id = 4, UserId = userId, Status = JobStatus.Rejected, Archived = false, JobTitle = "D", Company = "D",
                JobDescription = "D"
            },

            // 2 Archived Rejected
            new()
            {
                Id = 5, UserId = userId, Status = JobStatus.Rejected, Archived = true, JobTitle = "E", Company = "E",
                JobDescription = "E"
            },
            new()
            {
                Id = 6, UserId = userId, Status = JobStatus.Rejected, Archived = true, JobTitle = "F", Company = "F",
                JobDescription = "F"
            },

            // 1 Active Applied (Should be entirely ignored by the query)
            new()
            {
                Id = 7, UserId = userId, Status = JobStatus.Applied, Archived = false, JobTitle = "G", Company = "G",
                JobDescription = "G"
            },

            // --- Different User Jobs (Should be entirely ignored) ---
            new()
            {
                Id = 8, UserId = "other-user", Status = JobStatus.Offered, Archived = false, JobTitle = "H",
                Company = "H", JobDescription = "H"
            },
            new()
            {
                Id = 9, UserId = "other-user", Status = JobStatus.Rejected, Archived = false, JobTitle = "I",
                Company = "I", JobDescription = "I"
            }
        };

        context.UserJobs.AddRange(jobs);
        await context.SaveChangesAsync();

        var mockFactory = CreateMockContextFactory(context);
        var provider = new OutcomeProvider(mockFactory, _mockCurrentUserService.Object);

        // Act
        var result = await provider.GetOutcomesAsync(CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.ActiveOnly);
        Assert.NotNull(result.IncludingArchived);

        // Active Only asserts
        Assert.Equal(2, result.ActiveOnly.Offered); // Jobs 1, 2
        Assert.Equal(1, result.ActiveOnly.Rejected); // Job 4

        // Including Archived asserts
        Assert.Equal(3, result.IncludingArchived.Offered); // Jobs 1, 2, 3
        Assert.Equal(3, result.IncludingArchived.Rejected); // Jobs 4, 5, 6
    }

    [Fact]
    public async Task GetOutcomesAsync_ReturnsZeroedResult_WhenUserHasNoRelevantJobs()
    {
        // Arrange
        var userId = "test-user";
        _mockCurrentUserService.Setup(s => s.GetUserId()).Returns(userId);

        using var context = new ResumeDbContext(_dbOptions);

        var jobs = new List<UserJob>
        {
            // Add jobs that are NOT Offered or Rejected
            new()
            {
                Id = 1, UserId = userId, Status = JobStatus.Applied, Archived = false, JobTitle = "A", Company = "A",
                JobDescription = "A"
            },
            new()
            {
                Id = 2, UserId = userId, Status = JobStatus.Interviewing, Archived = true, JobTitle = "B",
                Company = "B", JobDescription = "B"
            }
        };

        context.UserJobs.AddRange(jobs);
        await context.SaveChangesAsync();

        var mockFactory = CreateMockContextFactory(context);
        var provider = new OutcomeProvider(mockFactory, _mockCurrentUserService.Object);

        // Act
        var result = await provider.GetOutcomesAsync(CancellationToken.None);

        // Assert
        // Because no jobs match the Where clause, FirstOrDefaultAsync() will return null.
        // This validates your `return result ?? new OutcomesProviderResult ...` fallback logic.
        Assert.NotNull(result);
        Assert.NotNull(result.ActiveOnly);
        Assert.NotNull(result.IncludingArchived);

        Assert.Equal(0, result.ActiveOnly.Offered);
        Assert.Equal(0, result.ActiveOnly.Rejected);

        Assert.Equal(0, result.IncludingArchived.Offered);
        Assert.Equal(0, result.IncludingArchived.Rejected);
    }

    [Fact]
    public async Task GetOutcomesAsync_ReturnsZeroedResult_WhenUserHasNoJobsAtAll()
    {
        // Arrange
        _mockCurrentUserService.Setup(s => s.GetUserId()).Returns("empty-user");

        using var context = new ResumeDbContext(_dbOptions);
        // Do not seed any data

        var mockFactory = CreateMockContextFactory(context);
        var provider = new OutcomeProvider(mockFactory, _mockCurrentUserService.Object);

        // Act
        var result = await provider.GetOutcomesAsync(CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.ActiveOnly.Offered);
        Assert.Equal(0, result.ActiveOnly.Rejected);
        Assert.Equal(0, result.IncludingArchived.Offered);
        Assert.Equal(0, result.IncludingArchived.Rejected);
    }
}