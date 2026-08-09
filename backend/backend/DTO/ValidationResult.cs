namespace backend.DTO;

public class ValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }

    public ValidationResult(bool isValid, string? errorMessage = null)
    {
        this.IsValid = isValid;
        this.ErrorMessage = errorMessage;
    }
}