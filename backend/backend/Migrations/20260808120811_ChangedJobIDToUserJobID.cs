using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ChangedJobIDToUserJobID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ResumeJobFeedbacks_ResumeId_JobId",
                table: "ResumeJobFeedbacks");

            migrationBuilder.DropColumn(
                name: "JobId",
                table: "ResumeJobFeedbacks");

            migrationBuilder.CreateIndex(
                name: "IX_ResumeJobFeedbacks_ResumeId_UserJobId",
                table: "ResumeJobFeedbacks",
                columns: new[] { "ResumeId", "UserJobId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ResumeJobFeedbacks_ResumeId_UserJobId",
                table: "ResumeJobFeedbacks");

            migrationBuilder.AddColumn<int>(
                name: "JobId",
                table: "ResumeJobFeedbacks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ResumeJobFeedbacks_ResumeId_JobId",
                table: "ResumeJobFeedbacks",
                columns: new[] { "ResumeId", "JobId" },
                unique: true);
        }
    }
}
