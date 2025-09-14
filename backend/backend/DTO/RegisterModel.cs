using System.ComponentModel.DataAnnotations;

namespace backend.DTO;

public class RegisterModel
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }
    
    [Required]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6 )]
    public required string Password { get; set; }
}