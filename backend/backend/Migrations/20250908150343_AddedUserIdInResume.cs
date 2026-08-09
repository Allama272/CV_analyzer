using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedUserIdInResume : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Resumes");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Resumes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Resumes");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Resumes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
