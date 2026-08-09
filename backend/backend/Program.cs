using System.Security.Principal;
using backend.Data;
using backend.Services;
using backend.Services.Resumes;
using backend.Services.Analysis;
using backend.Services.Jobs;
using Hangfire;
using Hangfire.Storage.SQLite;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var userAccount = WindowsIdentity.GetCurrent().Name;
Console.WriteLine($"Application is running under the user: {userAccount}");
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();


// TODO: Remove this in deployment
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// db
builder.Services.AddDbContext<ResumeDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("SqliteConnection")));


// hangfire
builder.Services.AddHangfire(config => config
    .UseSQLiteStorage(builder.Configuration.GetConnectionString("HangfireConnection")));
builder.Services.AddHangfireServer();
// auth
var supabaseIssuer = builder.Configuration["Authentication:ValidIssuer"];
var supabaseSecret = builder.Configuration["Authentication:Secret"];
var supabaseAudience = builder.Configuration["Authentication:ValidAudience"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = supabaseIssuer;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = supabaseIssuer,

            ValidateAudience = true,
            ValidAudience = "authenticated",

            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
            // IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(supabaseSecret)),
        };
    });

// services
builder.Services.AddScoped<IResumeService, ResumeService>();
builder.Services.AddScoped<IResumeParserService, ResumeParserService>();
builder.Services.AddScoped<IAtsService, AtsService>();
builder.Services.AddSingleton<IAiAnalysisService, OpenRouterAnalysisService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IJobUrlProcessor, JobUrlProcessor>();
// http and jobParsers
builder.Services.AddHttpClient<LinkedinParserStrategy>(client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
});
builder.Services.AddScoped<IJobParserStrategy>(x => x.GetRequiredService<LinkedinParserStrategy>());

//change to aws or smth later
builder.Services.AddScoped<IStorage, LocalStorage>();


// Configure the HTTP request pipeline.
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

//TODO: Remove in deployment
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.UseHangfireDashboard();
app.Run();