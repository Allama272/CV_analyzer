import { Link } from "react-router";
import { Building2, FileText, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreTier, SCORE_TIER_STYLES } from "@/lib/score";
import { STATUS_CONFIG } from "@/lib/job-status";
import { relativeTime } from "@/lib/date";
import type { JobWithBestMatchPreview } from "@/types";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
        Not analyzed
      </span>
    );
  }

  const styles = SCORE_TIER_STYLES[getScoreTier(score)];
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-1 text-xs font-semibold",
        styles.bg,
        styles.text,
        styles.border
      )}
    >
      {score}% match
    </span>
  );
}

export function JobResumePreviewCard({ job }: { job: JobWithBestMatchPreview }) {
  const status = STATUS_CONFIG[job.status];

  return (
    <Link
      to={`/job/${job.jobId}`}
      className="group block rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
          <Building2 className="h-5 w-5" />
        </div>
        <ScoreBadge score={job.bestMatchScore} />
      </div>

      <h3 className="mb-0.5 truncate text-base font-semibold text-foreground transition-colors group-hover:text-primary">
        {job.jobTitle}
      </h3>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="truncate">{job.company}</span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" />
          Added {relativeTime(new Date(job.createdAt))}
        </span>
        {job.resumeCount > 1 && (
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {job.resumeCount} resumes
          </span>
        )}
      </div>
    </Link>
  );
}