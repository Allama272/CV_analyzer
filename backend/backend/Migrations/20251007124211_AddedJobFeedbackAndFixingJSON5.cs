using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedJobFeedbackAndFixingJSON5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ResumeJobFeedback",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ResumeId = table.Column<int>(type: "INTEGER", nullable: false),
                    JobId = table.Column<int>(type: "INTEGER", nullable: false),
                    UserJobId = table.Column<int>(type: "INTEGER", nullable: false),
                    OverallMatchScore = table.Column<int>(type: "INTEGER", nullable: false),
                    CvImageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    KeywordMatch = table.Column<string>(type: "json", nullable: false),
                    SkillsMatch = table.Column<string>(type: "json", nullable: false),
                    ExperienceAlignment = table.Column<string>(type: "json", nullable: false),
                    EducationAlignment = table.Column<string>(type: "json", nullable: false),
                    AtsCompatibility = table.Column<string>(type: "json", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    ErrorMessage = table.Column<string>(type: "TEXT", nullable: true),
                    StartedProcessingAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResumeJobFeedback", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResumeJobFeedback_Resumes_ResumeId",
                        column: x => x.ResumeId,
                        principalTable: "Resumes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ResumeJobFeedback_UserJobs_UserJobId",
                        column: x => x.UserJobId,
                        principalTable: "UserJobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ResumeJobFeedback_ResumeId",
                table: "ResumeJobFeedback",
                column: "ResumeId");

            migrationBuilder.CreateIndex(
                name: "IX_ResumeJobFeedback_UserJobId",
                table: "ResumeJobFeedback",
                column: "UserJobId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResumeJobFeedback");
        }
    }
}
