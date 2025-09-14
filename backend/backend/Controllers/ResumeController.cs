using System.Security.Claims;
using backend.Services;
using Hangfire;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
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
                return BadRequest(result.Message);
            }

            return Ok(result.Message);
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
    }
}