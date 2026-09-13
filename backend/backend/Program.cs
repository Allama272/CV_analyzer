using System.Security.Claims;
using System.Security.Principal;
using System.Threading.RateLimiting;
using backend.cache;
using backend.Data;
using backend.Services;
using backend.Services.Resumes;
using backend.Services.Analysis;
using backend.Services.Analytics;
using backend.Services.Jobs;
using Hangfire;
using Hangfire.Storage.SQLite;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;

var userAccount = Environment.UserName;
Console.WriteLine($"Application is running under the user: {userAccount}");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// OpenAPI with JWT Bearer security scheme and conditional application
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes.Add("Bearer", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            In = ParameterLocation.Header,
            BearerFormat = "JWT",
            Description = "Enter your JWT token here"
        });
        return Task.CompletedTask;
    });

    options.AddOperationTransformer((operation, context, cancellationToken) =>
    {
        var endpointMetadata = context.Description.ActionDescriptor.EndpointMetadata;

        var hasAuthorize = endpointMetadata.OfType<Microsoft.AspNetCore.Authorization.IAuthorizeData>().Any();
        var hasAllowAnonymous = endpointMetadata.OfType<Microsoft.AspNetCore.Authorization.IAllowAnonymous>().Any();

        if (hasAuthorize && !hasAllowAnonymous)
        {
            operation.Security ??= new List<OpenApiSecurityRequirement>();
            operation.Security.Add(new OpenApiSecurityRequirement
            {
                [
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    }
                ] = Array.Empty<string>()
            });
        }

        return Task.CompletedTask;
    });
});

// Rate limiter policy
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("DashboardRateLimit", httpContext =>
    {
        var partitionKey = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? httpContext.Connection.RemoteIpAddress?.ToString()
                           ?? "unknown";

        return RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: partitionKey,
            factory: partition => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6,
                AutoReplenishment = true,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            });
    });

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.ContentType = "application/json";
        context.HttpContext.Response.Headers.RetryAfter = "60";

        var error = new { message = "You are refreshing the dashboard too quickly. Please wait a minute." };
        await context.HttpContext.Response.WriteAsJsonAsync(error, token);
    };
});

// Forwarded headers configuration – trust all proxies for development; adjust for production
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// CORS – TODO: Remove AllowAll in deployment
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Database contexts
builder.Services.AddDbContext<ResumeDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("SqliteConnection")));
builder.Services.AddDbContextFactory<ResumeDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("SqliteConnection")), ServiceLifetime.Scoped);

// Redis
builder.Services.AddStackExchangeRedisCache(redisOptions =>
{
    var connection = builder.Configuration.GetConnectionString("Redis");
    redisOptions.Configuration = connection;
});

// Hangfire
builder.Services.AddHangfire(config => config
    .UseSQLiteStorage(builder.Configuration.GetConnectionString("HangfireConnection")));
builder.Services.AddHangfireServer();

// Authentication (Supabase JWT)
var supabaseIssuer = builder.Configuration["Authentication:ValidIssuer"];
var supabaseAudience = builder.Configuration["Authentication:ValidAudience"]; // e.g., "authenticated"
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = supabaseIssuer;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = supabaseIssuer,

            ValidateAudience = true,
            ValidAudience = supabaseAudience,

            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
    });

// Application services
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IResumeService, ResumeService>();
builder.Services.AddScoped<IResumeParserService, ResumeParserService>();
builder.Services.AddScoped<IAtsService, AtsService>();
builder.Services.AddSingleton<IAiAnalysisService, OpenRouterAnalysisService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IJobUrlProcessor, JobUrlProcessor>();
builder.Services.AddAnalyticsDashboard();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<ICacheService, RedisCache>();

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// HTTP clients and job parsers
builder.Services.AddHttpClient<LinkedinParserStrategy>(client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
});
builder.Services.AddScoped<IJobParserStrategy>(x => x.GetRequiredService<LinkedinParserStrategy>());

// Storage (change to cloud later)
builder.Services.AddScoped<IStorage, LocalStorage>();

var app = builder.Build();

// ForwardedHeaders must be first to ensure correct client IP/scheme for downstream middleware
app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.AddPreferredSecuritySchemes("Bearer");
        options.EnablePersistentAuthentication();
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();

app.UseHangfireDashboard(); // TODO Add Auth to it in prod

app.Run();