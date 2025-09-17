using System.Text.Json;
using backend.models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ResumeDbContext : DbContext
{
    public ResumeDbContext(DbContextOptions<ResumeDbContext> options) : base(options)
    {
    }

    public DbSet<Resume> Resumes { get; set; }
    public DbSet<ResumeFeedback> ResumeFeedbacks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ResumeFeedback>(entity =>
        {
            entity.Property(e => e.Ats)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<FeedbackModels.AtsFeedback>(v, (JsonSerializerOptions)null));

            entity.Property(e => e.Formatting)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<FeedbackModels.ContentFeedback>(v, (JsonSerializerOptions)null));

            entity.Property(e => e.ContentQuality)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<FeedbackModels.ContentFeedback>(v, (JsonSerializerOptions)null));

            entity.Property(e => e.Structure)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<FeedbackModels.ContentFeedback>(v, (JsonSerializerOptions)null));

            entity.Property(e => e.SkillsCoverage)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                    v => JsonSerializer.Deserialize<FeedbackModels.SkillsCoverageFeedback>(v,
                        (JsonSerializerOptions)null));
        });

        base.OnModelCreating(modelBuilder);
    }
}