import { JobStatus, type JobStatusType } from "@/types";

export const STATUS_ORDER: JobStatusType[] = [
  JobStatus.Saved,
  JobStatus.Applied,
  JobStatus.Interviewing,
  JobStatus.Offered,
  JobStatus.Rejected,
  JobStatus.Archived,
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
  [JobStatus.Rejected]: { label: "Rejected", dot: "bg-[var(--badge-red-text)]" },
  [JobStatus.Archived]: { label: "Archived", dot: "bg-muted-foreground/50" },
};