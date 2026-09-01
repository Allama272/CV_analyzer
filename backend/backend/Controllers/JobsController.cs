using System.Security.Claims;
using backend.DTO;
using backend.DTO.JobDTO;
using backend.Services;
using backend.Services.Jobs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class JobsController : ControllerBase
{
    // private readonly string _testUserId = "844394c6-97fb-4ae4-a4e9-bc117ec0e760";
    private readonly IJobService _jobService;
    private readonly IJobUrlProcessor _urlProcessor;

    public JobsController(IJobService jobService, IJobUrlProcessor urlProcessor)
    {
        _jobService = jobService;
        _urlProcessor = urlProcessor;
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }


    [HttpGet("{jobId:int}")]
    public async Task<IActionResult> GetJobById(int jobId)
    {
        var result = await _jobService.GetJobByIdAsync(jobId, GetUserId());
        if (!result.IsSuccess)
        {
            return NotFound(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }

    [HttpPost("save-job")]
    public async Task<IActionResult> SaveJob([FromBody] JobSentDto jobSent)
    {
        var jobSaved = await _jobService.SaveJobAsync(jobSent, GetUserId());
        if (!jobSaved.IsSuccess)
        {
            return BadRequest(jobSaved.ErrorMessage);
        }

        return CreatedAtAction(nameof(GetJobById), new { jobId = jobSaved.Data!.Id }, jobSaved.Data);
    }

    [HttpPost("{jobId:int}/analyze")]
    public async Task<IActionResult> AnalyzeSaveJob(int jobId, [FromBody] AnalyzeJobRequest jobRequest)
    {
        var feedback = await _jobService.AnalyzeResumeToJob(jobRequest.ResumeId, jobId, GetUserId());
        if (!feedback.IsSuccess)
        {
            return BadRequest(feedback.ErrorMessage);
        }

        if (feedback.Data == null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                "Feedback record was created or found, but no ID was returned from the database.");
        }

        Console.WriteLine("Feedback" + feedback.Data);
        return CreatedAtRoute(
            routeName: "GetJobFeedbackRoute",
            routeValues: new { feedbackId = feedback.Data },
            value: new { feedbackId = feedback.Data }
        );
    }

    [HttpGet("job-feedback/{feedbackId:int}"
        , Name = "GetJobFeedbackRoute")]
    [ProducesResponseType(typeof(AnalyzedJobDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetJobFeedback(int feedbackId)
    {
        var jobFeedback = await _jobService.GetJobAnalysisByFeedbackId(feedbackId, GetUserId());
        if (!jobFeedback.IsSuccess)
        {
            return NotFound(new { message = jobFeedback.ErrorMessage });
        }

        return Ok(jobFeedback.Data);
    }

    [HttpGet("")]
    [ProducesResponseType(typeof(List<JobWithBestMatchPreview>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAllJobs()
    {
        var jobFeedbacks = await _jobService.GetAllJobsWithBestMatch(userId: GetUserId());
        if (!jobFeedbacks.IsSuccess)
        {
            return BadRequest(new { message = jobFeedbacks.ErrorMessage });
        }

        return Ok(jobFeedbacks.Data);
    }

    [HttpGet("with-feedback")]
    [ProducesResponseType(typeof(List<JobWithFeedbacksPreview>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAllJobFeedbacks()
    {
        var jobFeedbacks = await _jobService.GetJobsWithFeedbacks(userId: GetUserId());
        if (!jobFeedbacks.IsSuccess)
        {
            return BadRequest(new { message = jobFeedbacks.ErrorMessage });
        }

        return Ok(jobFeedbacks.Data);
    }


    [HttpPatch("{jobId:int}/status")]
    public async Task<IActionResult> UpdateJobStatus(int jobId, [FromBody] UpdateJobStatusDto request)
    {
        var result = await _jobService.UpdateJobStatus(userId: GetUserId(), jobId, request);
        if (!result.IsSuccess)
        {
            return NotFound(new { message = result.ErrorMessage });
        }

        return Ok(new { status = request.Status });
    }

    [HttpPatch("{jobId:int}/archive")]
    public async Task<IActionResult> UpdateJobArchive(int jobId, [FromBody] ArchiveJobRequest request)
    {
        var result = await _jobService.HandleArchiveJob(userId: GetUserId(), jobId, request.Archived);
        if (!result.IsSuccess)
        {
            return NotFound(new { message = result.ErrorMessage });
        }

        return Ok(new { Archived = request.Archived });
    }

    [HttpPut("{jobId:int}")]
    public async Task<IActionResult> UpdateJob(int jobId, [FromBody] JobSentDto updatedJob)
    {
        var result = await _jobService.UpdateJob(userId: GetUserId(), jobId, updatedJob);
        if (!result.IsSuccess)
        {
            return NotFound(new { message = result.ErrorMessage });
        }

        return NoContent();
    }

    [HttpDelete("{jobId:int}")]
    public async Task<IActionResult> DeleteJob(int jobId)
    {
        var result = await _jobService.DeleteJob(userId: GetUserId(), jobId);
        if (!result.IsSuccess)
        {
            return NotFound(new { message = result.ErrorMessage });
        }

        return NoContent();
    }

    [HttpGet("autofill")]
    public async Task<IActionResult> AutofillJobLink([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return BadRequest(new { message = "URL cannot be empty." });
        }

        var result = await _urlProcessor.ProcessJobLinkAsync(url);
        if (!result.IsSuccess)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }
}