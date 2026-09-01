import { JobStatus, ScoreBucket, type JobStatusType } from "@/types";
import { STATUS_CONFIG, STATUS_CHART_COLOR } from "@/lib/job-status";

const STATUS_DISPLAY_ORDER: JobStatusType[] = [
  JobStatus.Saved,
  JobStatus.Applied,
  JobStatus.Interviewing,
  JobStatus.Offered,
  JobStatus.Rejected,
];

// Maps numeric JobStatus values -> the string keys the API actually sends
const STATUS_KEY: Record<JobStatusType, string> = {
  [JobStatus.Saved]: "Saved",
  [JobStatus.Applied]: "Applied",
  [JobStatus.Interviewing]: "Interviewing",
  [JobStatus.Offered]: "Offered",
  [JobStatus.Rejected]: "Rejected",
};

export interface StatusBreakdownItem {
  status: JobStatusType;
  label: string;
  count: number;
  color: string;
}

export function mapStatusBreakdown(dict: Record<string, number>): StatusBreakdownItem[] {
  return STATUS_DISPLAY_ORDER.map((status) => ({
    status,
    label: STATUS_CONFIG[status].label,
    count: dict[STATUS_KEY[status]] ?? 0,
    color: STATUS_CHART_COLOR[status],
  })).filter((item) => item.count > 0);
}

const SCORE_BUCKET_ORDER: ScoreBucket[] = [
  ScoreBucket.NotAnalyzed,
  ScoreBucket.Below40,
  ScoreBucket.Between40And60,
  ScoreBucket.Between60And80,
  ScoreBucket.Above80,
];

// Maps ScoreBucket values -> the string keys the API sends
const SCORE_BUCKET_KEY: Record<ScoreBucket, string> = {
  [ScoreBucket.NotAnalyzed]: "NotAnalyzed",
  [ScoreBucket.Below40]: "Below40",
  [ScoreBucket.Between40And60]: "Between40And60",
  [ScoreBucket.Between60And80]: "Between60And80",
  [ScoreBucket.Above80]: "Above80",
};

const SCORE_BUCKET_LABELS: Record<ScoreBucket, string> = {
  [ScoreBucket.NotAnalyzed]: "Not analyzed",
  [ScoreBucket.Below40]: "0–40%",
  [ScoreBucket.Between40And60]: "40–60%",
  [ScoreBucket.Between60And80]: "60–80%",
  [ScoreBucket.Above80]: "80–100%",
};

export interface ScoreBucketItem {
  bucket: ScoreBucket;
  label: string;
  count: number;
}

export function mapScoreHistogram(dict: Record<string, number>): ScoreBucketItem[] {
  return SCORE_BUCKET_ORDER.map((bucket) => ({
    bucket,
    label: SCORE_BUCKET_LABELS[bucket],
    count: dict[SCORE_BUCKET_KEY[bucket]] ?? 0,
  }));
}

export function formatWeekLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}