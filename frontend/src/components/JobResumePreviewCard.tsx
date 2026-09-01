import { Link } from "react-router";
import { Building2, FileText, CalendarClock, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreTier, SCORE_TIER_STYLES } from "@/lib/score";
import { STATUS_CONFIG, STATUS_ORDER } from "@/lib/job-status";
import { relativeTime } from "@/lib/date";
import type { JobWithBestMatchPreview, JobStatusType } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface JobResumePreviewCardProps {
  job: JobWithBestMatchPreview;
  onStatusChange?: (jobId: number, status: JobStatusType) => void;
  onArchive?: (jobId: number) => void;
  onUnarchive?: (jobId: number) => void;
}

export function JobResumePreviewCard({
  job,
  onStatusChange,
  onArchive,
  onUnarchive,
}: JobResumePreviewCardProps) {
  const status = STATUS_CONFIG[job.status];

  return (
    <Link
      to={`/job/${job.jobId}`}
      className="group block rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 overflow-hidden items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
          {job.logoUrl ? (
            <img
              src={job.logoUrl}
              alt={`${job.company} logo`}
              className="h-full w-full object-cover bg-white"
            />
          ) : (
            <Building2 className="h-5 w-5" />
          )}
        </div>
        <ScoreBadge score={job.bestMatchScore} />
      </div>

      <h3 className="mb-0.5 truncate text-base font-semibold text-foreground transition-colors group-hover:text-primary">
        {job.jobTitle}
      </h3>

      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="truncate">{job.company}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => {
                // Stop this from bubbling up to the card's <Link>
                e.preventDefault();
                e.stopPropagation();
              }}
              className="-mx-1.5 -my-0.5 flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-1 transition-colors hover:bg-accent"
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
              {status.label}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <DropdownMenuLabel>Move to</DropdownMenuLabel>
            {STATUS_ORDER.map((s) => (
              <DropdownMenuItem
                key={s}
                onSelect={() => onStatusChange?.(job.jobId, s)}
              >
                <span
                  className={cn(
                    "mr-2 inline-block h-1.5 w-1.5 rounded-full",
                    STATUS_CONFIG[s].dot
                  )}
                />
                {STATUS_CONFIG[s].label}
                {job.status === s && <Check className="ml-auto h-3.5 w-3.5" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {job.archived ? (
              <DropdownMenuItem onSelect={() => onUnarchive?.(job.jobId)}>
                Unarchive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onSelect={() => onArchive?.(job.jobId)}
                className="text-destructive focus:text-destructive"
              >
                Archive
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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