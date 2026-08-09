namespace backend.DTO;

public class FileUploadResult
{
    public bool IsSuccess { get; set; }
    public string? Message { get; set; }
    public int? UploadedId { get; set; }
    
}