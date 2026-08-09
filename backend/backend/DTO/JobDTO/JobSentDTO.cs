using System.ComponentModel.DataAnnotations;
using backend.models;

namespace backend.DTO.JobDTO;

public class JobSentDto
{
    [Required(ErrorMessage = "Job title is required.")]
    [StringLength(150, ErrorMessage = "Job title cannot exceed 150 characters.")]
    public required string JobTitle { get; set; }

    [Required(ErrorMessage = "Company name is required.")]
    [StringLength(100, ErrorMessage = "Company name cannot exceed 100 characters.")]
    public required string Company { get; set; }

    [Required(ErrorMessage = "Job description is required.")]
    [StringLength(2000, ErrorMessage = "Job description cannot exceed 2000 characters.")]
    public required string JobDescription { get; set; }

    public string? LogoUrl { get; set; }

    public JobStatus Status { get; set; } = JobStatus.Saved;
}