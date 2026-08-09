using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixingResumeFeedbackAgain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Structure",
                table: "ResumeFeedbacks",
                type: "json",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "SkillsCoverage",
                table: "ResumeFeedbacks",
                type: "json",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "Formatting",
                table: "ResumeFeedbacks",
                type: "json",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "ContentQuality",
                table: "ResumeFeedbacks",
                type: "json",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "Ats",
                table: "ResumeFeedbacks",
                type: "json",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Structure",
                table: "ResumeFeedbacks",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "json");

            migrationBuilder.AlterColumn<string>(
                name: "SkillsCoverage",
                table: "ResumeFeedbacks",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "json");

            migrationBuilder.AlterColumn<string>(
                name: "Formatting",
                table: "ResumeFeedbacks",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "json");

            migrationBuilder.AlterColumn<string>(
                name: "ContentQuality",
                table: "ResumeFeedbacks",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "json");

            migrationBuilder.AlterColumn<string>(
                name: "Ats",
                table: "ResumeFeedbacks",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "json");
        }
    }
}
