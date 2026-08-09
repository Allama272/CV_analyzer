using backend.Data;
using backend.models;
using backend.Services;
using backend.Services.Jobs;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Tests;

public class JobServiceTest
{
    private ResumeDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ResumeDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()).Options;
        return new ResumeDbContext(options);
    }

    [Fact]
    public async Task GetAllJobFeedbacks_WhenFeedbackExists_ReturnSuccessWithData()
    {
        // Arrange
        var dbContext = GetInMemoryDbContext();
        var mockHangFire = new Mock<IBackgroundJobClient>();
        var service = new JobService(dbContext, mockHangFire.Object);
        const string targetUserId = "user-123";

        dbContext.ResumeJobFeedbacks.Add(new ResumeJobFeedback
        {
            Id = 1,
            UserId = targetUserId,
            UserJobId = 99,
            ResumeId = 20,
            UserJob = new UserJob { Company = "Tech Corp", JobTitle = "Developer", UserId = targetUserId, JobDescription = "........."},
            Resume = new Resume { UserId = targetUserId, ImageThumbnailUrl = "thumb.jpg" }
        });
        const string otherUser = "OtherUser";
        dbContext.ResumeJobFeedbacks.Add(new ResumeJobFeedback
        {
            Id = 2,
            UserId = otherUser,
            UserJobId = 100,
            ResumeId = 21,
            UserJob = new UserJob { Company = "Tech Corp2", JobTitle = "Developer2", UserId = otherUser, JobDescription = "........."},
            Resume = new Resume { UserId = otherUser, ImageThumbnailUrl = "thumb2.jpg" }
        });
        await dbContext.SaveChangesAsync();

        // Act
        var result = await service.GetAllJobFeedbacks(targetUserId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.Single(result.Data);

        var feedback = result.Data.First();
        Assert.Equal(1, feedback.FeedbackId);
        Assert.Equal("thumb.jpg", feedback.ResumeThumbnailUrl);
    }
}