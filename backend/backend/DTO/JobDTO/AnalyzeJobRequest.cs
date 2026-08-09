using System.ComponentModel.DataAnnotations;

namespace backend.DTO.JobDTO;

public class AnalyzeJobRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "A valid ResumeId is required.")]
    public int ResumeId { get; set; }
}