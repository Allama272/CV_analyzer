namespace backend.DTO;

// general class for not returning anything
public class ServiceResult
{
    public bool IsSuccess { get; }
    public string? ErrorMessage { get; }

    protected ServiceResult(bool isSuccess, string? errorMessage)
    {
        IsSuccess = isSuccess;
        ErrorMessage = errorMessage;
    }

    public static ServiceResult Success() => new(true, null);
    public static ServiceResult Failure(string errorMessage) => new(false, errorMessage);
}

// The generic class inherits from the base for operations that DO return data
public class ServiceResult<T> : ServiceResult
{
    public T? Data { get; }

    private ServiceResult(T? data, bool isSuccess, string? errorMessage)
        : base(isSuccess, errorMessage)
    {
        Data = data;
    }

    public static ServiceResult<T> Success(T data) => new(data, true, null);
    public new static ServiceResult<T> Failure(string errorMessage) => new(default, false, errorMessage);

    public static implicit operator ServiceResult<T>(T value) => Success(value);

    public void Deconstruct(out bool isSuccess, out T? data, out string? errorMessage)
    {
        isSuccess = IsSuccess;
        data = Data;
        errorMessage = ErrorMessage;
    }
}