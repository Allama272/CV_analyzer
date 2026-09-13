using backend.cache;
using backend.Data;
using backend.DTO.JobDTO;
using backend.models;
using backend.Services.Jobs;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace Tests.Services;

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
        var mockMediator = new Mock<IMediator>(); // 1. Create the mock

        // 2. Inject it into the service
        var service = new JobService(dbContext, mockHangFire.Object, mockMediator.Object); 
        
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
        
        // Since this is a GET request, verify that NO events were accidentally published
        mockMediator.Verify(m => m.Publish(It.IsAny<ISummaryInvalidateEvent>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task AddJob_PublishesJobAddedEvent()
    {
        // Arrange
        var dbContext = GetInMemoryDbContext();
        var mockHangFire = new Mock<IBackgroundJobClient>();
        var mockMediator = new Mock<IMediator>(); 

        var service = new JobService(dbContext, mockHangFire.Object, mockMediator.Object); 
        const string targetUserId = "user-123";

        // Act
        // Assuming you have a method like this:
        var jobSentMoq = new JobSentDto
        {
            Company = "Test Company",
            JobTitle = "Test Job Title",
            JobDescription = "A long Description of words and other stuff"
        };
        await service.SaveJobAsync(jobSentMoq, targetUserId);

        // Assert
        // Verify that MediatR published exactly ONE JobAddedEvent for this user
        mockMediator.Verify(m => m.Publish(
            It.Is<JobAddedEvent>(e => e.UserId == targetUserId), 
            It.IsAny<CancellationToken>()), 
        Times.Once);
    }
}
