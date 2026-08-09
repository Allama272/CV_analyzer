import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getScoreTier, SCORE_TIER_STYLES } from "@/lib/score";
import { STATUS_CONFIG, STATUS_ORDER } from "@/lib/job-status";
import { relativeTime } from "@/lib/date";
import { supabase } from "@/supabaseClient";
import type { JobFeedbacksMinimal, JobStatusType, IResume, JobDetail } from "@/types";
import { AlertDialogAction, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger, AlertDialog } from "@/components/ui/alert-dialog";

const apiUrl: string = import.meta.env.VITE_DEV_SERVER;
const thumbnailUrl = `${import.meta.env.VITE_LOCAL_STORAGE}/thumbnail`;
const MAX_DESC_CHARS = 400; // Threshold for showing the "Read more" toggle

function ScoreBadge({ score }: { score: number }) {
  const styles = SCORE_TIER_STYLES[getScoreTier(score)];
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-1 text-sm font-semibold",
        styles.bg,
        styles.text,
        styles.border
      )}
    >
      {score}% match
    </span>
  );
}

function FeedbackRow({
  feedback,
  isBest,
  jobTitle,
  company,
}: {
  feedback: JobFeedbacksMinimal;
  isBest: boolean;
  jobTitle: string;
  company: string;
}) {
  return (
    <Link
      to={`/job-analyzed/${feedback.feedbackId}`}
      state={{ jobTitle, company, resumeTitle: feedback.resumeTitle }}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors",
        isBest ? "bg-accent" : "hover:bg-muted"
      )}
    >
      <img
        src={`${thumbnailUrl}/${feedback.resumeThumbnailUrl}`}
        alt={feedback.resumeTitle}
        className="h-14 w-11 shrink-0 rounded border border-border object-cover"
      />
      <span className="flex-1 truncate text-sm font-medium text-foreground">
        {feedback.resumeTitle}
      </span>
      <ScoreBadge score={feedback.overAllMatchScore} />
      {isBest && (
        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
          Best
        </span>
      )}
    </Link>
  );
}

function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Analysis state
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [analyzingResumeId, setAnalyzingResumeId] = useState<
    IResume["resumeId"] | null
  >(null);

  // Editing state
  const [editOpen, setEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    jobTitle: "",
    company: "",
    jobDescription: "",
  });

  // Description view state
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const fetchJob = async () => {
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const response = await fetch(`${apiUrl}/api/jobs/${jobId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch job.");
      }

      const data = (await response.json()) as JobDetail;
      setJob(data);
      setEditForm({
        jobTitle: data.jobTitle || "",
        company: data.company || "",
        jobDescription: data.jobDescription || "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load job.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleStatusChange = async (nextStatus: JobStatusType) => {
    if (!job) return;
    const previous = job.status;
    setJob({ ...job, status: nextStatus });
    setStatusUpdating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication error.");

      const response = await fetch(`${apiUrl}/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status.");
    } catch (error) {
      setJob((current) => (current ? { ...current, status: previous } : current));
      toast.error(error instanceof Error ? error.message : "Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleUpdateJobDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setIsUpdating(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication error.");

      const response = await fetch(`${apiUrl}/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error("Failed to update job details.");

      setJob({ ...job, ...editForm });
      toast.success("Job updated successfully.");
      setEditOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update job.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!job) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication error.");

      const response = await fetch(`${apiUrl}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Failed to delete job.");

      toast.success("Job deleted.");
      navigate("/jobs");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete job.");
    }
  };

  const openAnalyzeDialog = async () => {
    setAnalyzeOpen(true);
    if (resumes.length > 0) return;

    setResumesLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication error.");

      const response = await fetch(`${apiUrl}/api/resume/get-resumes`, {
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Failed to load resumes.");
      const data = (await response.json()) as IResume[];
      setResumes(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load resumes.");
    } finally {
      setResumesLoading(false);
    }
  };

  const handleAnalyze = async (resume: IResume) => {
    if (!job) return;
    setAnalyzingResumeId(resume.resumeId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication error.");

      const response = await fetch(`${apiUrl}/api/jobs/${jobId}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ resumeId: resume.resumeId }),
      });
      if (!response.ok) throw new Error("Failed to analyze resume.");

      const result = (await response.json()) as { feedbackId: number };

      setAnalyzeOpen(false);
      navigate(`/job-analyzed/${result.feedbackId}`, {
        state: {
          jobTitle: job.jobTitle,
          company: job.company,
          resumeTitle: resume.resumeTitle,
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to analyze resume."
      );
    } finally {
      setAnalyzingResumeId(null);
    }
  };

  if (isLoading || !job) {
    return (
      <div className="flex h-64 items-center justify-center px-6 py-8">
        {isLoading ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading job...
          </div>
        ) : (
          <p className="text-muted-foreground">Job not found.</p>
        )}
      </div>
    );
  }

  const sortedFeedbacks = [...(job.feedbacks || [])].sort(
    (a, b) => b.overAllMatchScore - a.overAllMatchScore
  );
  const bestFeedback = sortedFeedbacks[0];
  const analyzedResumeIds = new Set(
    (job.feedbacks || []).map((f) => String(f.resumeId))
  );
  const availableResumes = resumes.filter(
    (r) => !analyzedResumeIds.has(String(r.resumeId))
  );
  const status = STATUS_CONFIG[job.status];
  const isLongDescription = (job.jobDescription?.length || 0) > MAX_DESC_CHARS;

  return (
    <div className="mx-auto  px-6 py-8">
      <Link
        to="/jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Job Tracker
      </Link>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          {/* Main Job Header */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 overflow-hidden items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                  {job.logoUrl ? (
                    <img
                      src={job.logoUrl}
                      alt={`${job.company} logo`}
                      className="h-full w-full object-cover bg-white"
                    />
                  ) : (
                    <Building2 className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {job.jobTitle}
                  </h1>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {bestFeedback && (

                  <ScoreBadge score={bestFeedback.overAllMatchScore} />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditOpen(true)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit Job Details</span>
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", status.dot)} />
                <Select
                  value={String(job.status)}
                  onValueChange={(v) => handleStatusChange(Number(v) as JobStatusType)}
                  disabled={statusUpdating}
                >
                  <SelectTrigger className="h-8 w-[150px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {STATUS_CONFIG[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                Added {relativeTime(new Date(job.uploadDate))}
              </span>

              {/* Allert dialgo */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    title="Delete"
                    className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[var(--error-text)]"
                  > Delete job
                    <Trash2 className="h-4 w-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {job.jobTitle}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your Job and remove it from our servers, along with any analysis done.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Job Description Section */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              Job Description
            </h2>
            {job.jobDescription ? (
              <div>
                <div className="relative">
                  <div
                    className={cn(
                      "prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground",
                      !isDescExpanded && isLongDescription && "line-clamp-6"
                    )}
                  >
                    {job.jobDescription}
                  </div>
                  {/* Fade out gradient when clamped */}
                  {!isDescExpanded && isLongDescription && (
                    <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-card to-transparent" />
                  )}
                </div>
                {isLongDescription && (
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="mt-3 flex items-center gap-1 text-sm font-medium text-foreground hover:underline focus:outline-none"
                  >
                    {isDescExpanded ? (
                      <>
                        Show less <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Read more <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No description provided. Click the edit icon above to add one.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar: Analyzed Resumes */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
            <div>
              <h2 className="text-base font-semibold text-foreground">Analyses</h2>
              <p className="text-xs text-muted-foreground">
                {job.feedbacks?.length || 0} resumes checked
              </p>
            </div>
            <Button onClick={openAnalyzeDialog} size="sm" className="gap-1.5">
              <Sparkles className="h-4 w-4" />
              New
            </Button>
          </div>

          {sortedFeedbacks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium text-foreground">No analyses yet</p>
              <p className="text-xs text-muted-foreground">
                Pick a resume to see how well it matches this job.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedFeedbacks.map((feedback) => (
                <FeedbackRow
                  key={feedback.feedbackId}
                  feedback={feedback}
                  isBest={feedback === bestFeedback}
                  jobTitle={job.jobTitle}
                  company={job.company}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ----------------- MODALS ----------------- */}

      {/* Edit Job Details Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Job Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateJobDetails} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="jobTitle" className="text-sm font-medium">
                Job Title
              </label>
              <input
                id="jobTitle"
                type="text"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editForm.jobTitle}
                onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="company" className="text-sm font-medium">
                Company
              </label>
              <input
                id="company"
                type="text"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editForm.company}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Job Description
              </label>
              <textarea
                id="description"
                className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editForm.jobDescription}
                onChange={(e) =>
                  setEditForm({ ...editForm, jobDescription: e.target.value })
                }
              />
            </div>

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isUpdating}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Analyze with Resume Dialog */}
      <Dialog open={analyzeOpen} onOpenChange={setAnalyzeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Analyze with a resume</DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-2">
            {resumesLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : availableResumes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {resumes.length === 0
                  ? "You don't have any resumes yet."
                  : "Every resume has already been analyzed for this job."}
              </p>
            ) : (
              availableResumes.map((resume) => (
                <button
                  key={resume.resumeId}
                  onClick={() => handleAnalyze(resume)}
                  disabled={analyzingResumeId !== null}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <img
                    src={`${thumbnailUrl}/${resume.resumeThumbnailUrl}`}
                    alt={resume.resumeTitle}
                    className="h-14 w-11 shrink-0 rounded border border-border object-cover"
                  />
                  <span className="flex-1 truncate text-sm font-medium text-foreground">
                    {resume.resumeTitle}
                  </span>
                  {analyzingResumeId === resume.resumeId ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
              ))
            )}
          </div>
          <DialogClose asChild>
            <Button variant="outline" className="mt-2 w-full">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JobDetailPage;