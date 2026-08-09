using System.Security.Claims;
using backend.Services.Resumes;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class ResumeController : ControllerBase
    {
        private readonly IResumeService _resumeService;
        private readonly IBackgroundJobClient _backgroundJobClient;

        public ResumeController(IResumeService resumeService, IBackgroundJobClient backgroundJobClient)
        {
            _resumeService = resumeService;
            _backgroundJobClient = backgroundJobClient;
        }

        public string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        [HttpPost("upload-resume")]
        public async Task<IActionResult> UploadResume([FromForm] IFormFile file, [FromForm] string title)
        {
            string userId = GetUserId();
            var result = await _resumeService.UploadResume(file, userId, title);
            if (!result.IsSuccess)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message, resumeId = result.UploadedId });
        }


        [HttpGet("get-resumes")]
        public async Task<IActionResult> GetAllUserResumesPreview()
        {
            string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _resumeService.GetAllResumesPreview(userId);
            return Ok(result);
        }

        // returns an AnalyzedResume DTO with status of resume for polling
        [HttpGet("get-resume")]
        public async Task<IActionResult> GetUserResume(string resumeId)
        {
            string userId = GetUserId();
            var result = await _resumeService.GetResumeAnalysis(resumeId, userId);
            if (result == null)
            {
                return BadRequest(new { message = "Not Found" });
            }

            return Ok(result);
        }

        [HttpDelete("{resumeId:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUserResume(int resumeId)
        {
            var result = await _resumeService.DeleteResume(userId: GetUserId(), resumeId);

            if (!result.IsSuccess)
            {
                return NotFound(new { message = result.ErrorMessage });
            }

            return NoContent();
        }

        [HttpGet("{resumeId:int}/jobs")]
        public async Task<IActionResult> GetResumeJobAnalysis(int resumeId)
        {
            var result = await _resumeService.GetResumeJobsAnalyzed(GetUserId(), resumeId);
            return Ok(result.Data);
        }
    }
}