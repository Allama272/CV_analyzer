using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedMetaFieldsToResumeFeedBack : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "ResumeFeedbacks",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ErrorMessage",
                table: "ResumeFeedbacks",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartedProcessingAt",
                table: "ResumeFeedbacks",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "ResumeFeedbacks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "ResumeFeedbacks");

            migrationBuilder.DropColumn(
                name: "ErrorMessage",
                table: "ResumeFeedbacks");

            migrationBuilder.DropColumn(
                name: "StartedProcessingAt",
                table: "ResumeFeedbacks");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ResumeFeedbacks");
        }
    }
}
