using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueIndexToResumeJobFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ResumeJobFeedbacks_ResumeId",
                table: "ResumeJobFeedbacks");

            migrationBuilder.CreateIndex(
                name: "IX_ResumeJobFeedbacks_ResumeId_JobId",
                table: "ResumeJobFeedbacks",
                columns: new[] { "ResumeId", "JobId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ResumeJobFeedbacks_ResumeId_JobId",
                table: "ResumeJobFeedbacks");

            migrationBuilder.CreateIndex(
                name: "IX_ResumeJobFeedbacks_ResumeId",
                table: "ResumeJobFeedbacks",
                column: "ResumeId");
        }
    }
}
