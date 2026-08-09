using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RefactoredFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AtsScore",
                table: "ResumeFeedbacks");

            migrationBuilder.DropColumn(
                name: "AtsTipsJson",
                table: "ResumeFeedbacks");

            migrationBuilder.DropColumn(
                name: "ContentQualityScore",
                table: "ResumeFeedbacks");

            migrationBuilder.DropColumn(
                name: "ContentQualityTipsJson",
                table: "ResumeFeedbacks");

            migrationBuilder.DropColumn(
                name: "FormattingScore",
                table: "ResumeFeedbacks");

            migrationBuilder.DropColumn(
                name: "SkillsCoverageScore",
                table: "ResumeFeedbacks");

            migrationBuilder.DropColumn(
                name: "StructureScore",
                table: "ResumeFeedbacks");

            migrationBuilder.RenameColumn(
                name: "StructureTipsJson",
                table: "ResumeFeedbacks",
                newName: "Structure");

            migrationBuilder.RenameColumn(
                name: "SkillsTipsJson",
                table: "ResumeFeedbacks",
                newName: "SkillsCoverage");

            migrationBuilder.RenameColumn(
                name: "MissingCommonSkillsJson",
                table: "ResumeFeedbacks",
                newName: "Formatting");

            migrationBuilder.RenameColumn(
                name: "FormattingTipsJson",
                table: "ResumeFeedbacks",
                newName: "ContentQuality");

            migrationBuilder.RenameColumn(
                name: "DetectedSkillsJson",
                table: "ResumeFeedbacks",
                newName: "Ats");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Structure",
                table: "ResumeFeedbacks",
                newName: "StructureTipsJson");

            migrationBuilder.RenameColumn(
                name: "SkillsCoverage",
                table: "ResumeFeedbacks",
                newName: "SkillsTipsJson");

            migrationBuilder.RenameColumn(
                name: "Formatting",
                table: "ResumeFeedbacks",
                newName: "MissingCommonSkillsJson");

            migrationBuilder.RenameColumn(
                name: "ContentQuality",
                table: "ResumeFeedbacks",
                newName: "FormattingTipsJson");

            migrationBuilder.RenameColumn(
                name: "Ats",
                table: "ResumeFeedbacks",
                newName: "DetectedSkillsJson");

            migrationBuilder.AddColumn<int>(
                name: "AtsScore",
                table: "ResumeFeedbacks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "AtsTipsJson",
                table: "ResumeFeedbacks",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ContentQualityScore",
                table: "ResumeFeedbacks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ContentQualityTipsJson",
                table: "ResumeFeedbacks",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "FormattingScore",
                table: "ResumeFeedbacks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SkillsCoverageScore",
                table: "ResumeFeedbacks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StructureScore",
                table: "ResumeFeedbacks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }
    }
}
