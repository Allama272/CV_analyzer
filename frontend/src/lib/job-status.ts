import { JobStatus, type JobStatusType } from "@/types";

export const STATUS_ORDER: JobStatusType[] = [
  JobStatus.Saved,
  JobStatus.Applied,
  JobStatus.Interviewing,
  JobStatus.Offered,
  JobStatus.Rejected,
];

// Columns that should always render in the board view, even with 0 jobs.
export const ALWAYS_VISIBLE_STATUSES: JobStatusType[] = [
  JobStatus.Saved,
  JobStatus.Applied,
  JobStatus.Interviewing,
];

export const STATUS_CONFIG: Record<JobStatusType, { label: string; dot: string }> = {
  [JobStatus.Saved]: { label: "Saved", dot: "bg-muted-foreground" },
  [JobStatus.Applied]: { label: "Applied", dot: "bg-primary" },
  [JobStatus.Interviewing]: { label: "Interviewing", dot: "bg-[var(--chart-3)]" },
  [JobStatus.Offered]: { label: "Offered", dot: "bg-[var(--badge-green-text)]" },
  [JobStatus.Rejected]: { label: "Rejected", dot: "bg-[var(--badge-red-text)]" }
};
export const STATUS_CHART_COLOR: Record<JobStatusType, string> = {
  [JobStatus.Saved]: "var(--chart-2)",        // teal
  [JobStatus.Applied]: "var(--chart-1)",      // orange
  [JobStatus.Interviewing]: "var(--chart-3)", // deep indigo
  [JobStatus.Offered]: "var(--badge-green-text)",
  [JobStatus.Rejected]: "var(--badge-red-text)",
};