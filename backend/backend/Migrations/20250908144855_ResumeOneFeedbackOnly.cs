using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ResumeOneFeedbackOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ResumeFeedbacks_ResumeId",
                table: "ResumeFeedbacks");

            migrationBuilder.CreateIndex(
                name: "IX_ResumeFeedbacks_ResumeId",
                table: "ResumeFeedbacks",
                column: "ResumeId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ResumeFeedbacks_ResumeId",
                table: "ResumeFeedbacks");

            migrationBuilder.CreateIndex(
                name: "IX_ResumeFeedbacks_ResumeId",
                table: "ResumeFeedbacks",
                column: "ResumeId");
        }
    }
}
