using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedJobFeedbackToDbset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ResumeJobFeedback_Resumes_ResumeId",
                table: "ResumeJobFeedback");

            migrationBuilder.DropForeignKey(
                name: "FK_ResumeJobFeedback_UserJobs_UserJobId",
                table: "ResumeJobFeedback");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ResumeJobFeedback",
                table: "ResumeJobFeedback");

            migrationBuilder.RenameTable(
                name: "ResumeJobFeedback",
                newName: "ResumeJobFeedbacks");

            migrationBuilder.RenameIndex(
                name: "IX_ResumeJobFeedback_UserJobId",
                table: "ResumeJobFeedbacks",
                newName: "IX_ResumeJobFeedbacks_UserJobId");

            migrationBuilder.RenameIndex(
                name: "IX_ResumeJobFeedback_ResumeId",
                table: "ResumeJobFeedbacks",
                newName: "IX_ResumeJobFeedbacks_ResumeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ResumeJobFeedbacks",
                table: "ResumeJobFeedbacks",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ResumeJobFeedbacks_Resumes_ResumeId",
                table: "ResumeJobFeedbacks",
                column: "ResumeId",
                principalTable: "Resumes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ResumeJobFeedbacks_UserJobs_UserJobId",
                table: "ResumeJobFeedbacks",
                column: "UserJobId",
                principalTable: "UserJobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ResumeJobFeedbacks_Resumes_ResumeId",
                table: "ResumeJobFeedbacks");

            migrationBuilder.DropForeignKey(
                name: "FK_ResumeJobFeedbacks_UserJobs_UserJobId",
                table: "ResumeJobFeedbacks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ResumeJobFeedbacks",
                table: "ResumeJobFeedbacks");

            migrationBuilder.RenameTable(
                name: "ResumeJobFeedbacks",
                newName: "ResumeJobFeedback");

            migrationBuilder.RenameIndex(
                name: "IX_ResumeJobFeedbacks_UserJobId",
                table: "ResumeJobFeedback",
                newName: "IX_ResumeJobFeedback_UserJobId");

            migrationBuilder.RenameIndex(
                name: "IX_ResumeJobFeedbacks_ResumeId",
                table: "ResumeJobFeedback",
                newName: "IX_ResumeJobFeedback_ResumeId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ResumeJobFeedback",
                table: "ResumeJobFeedback",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ResumeJobFeedback_Resumes_ResumeId",
                table: "ResumeJobFeedback",
                column: "ResumeId",
                principalTable: "Resumes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ResumeJobFeedback_UserJobs_UserJobId",
                table: "ResumeJobFeedback",
                column: "UserJobId",
                principalTable: "UserJobs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
