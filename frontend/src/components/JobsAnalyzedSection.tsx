import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { Loader2, ChevronRight, Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ScoreGauge from "@/components/ScoreGauge";
import { supabase } from "@/supabaseClient";
import type { ResumeJobMatch, JobWithBestMatchPreview } from "@/types";

const apiUrl: string = import.meta.env.VITE_DEV_SERVER;

interface JobsAnalyzedSectionProps {
  resumeId: string;
  resumeTitle?: string;
}

function JobsAnalyzedSection({ resumeId, resumeTitle }: JobsAnalyzedSectionProps) {
  const navigate = useNavigate();

  const [analyzedJobs, setAnalyzedJobs] = useState<ResumeJobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [allJobs, setAllJobs] = useState<JobWithBestMatchPreview[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [analyzingJobId, setAnalyzingJobId] = useState<number | null>(null);

  const fetchAnalyzedJobs = async () => {
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // feedbacks list, scoped to a single resume.
      const response = await fetch(`${apiUrl}/api/resume/${resumeId}/jobs`, {
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Failed to load analyzed jobs.");
      const data = (await response.json()) as ResumeJobMatch[];
      setAnalyzedJobs(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load analyzed jobs."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyzedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  const openPicker = async () => {
    setPickerOpen(true);
    if (allJobs.length > 0) return;

    setJobsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication error.");

      const response = await fetch(`${apiUrl}/api/jobs`, {
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Failed to load jobs.");
      const data = (await response.json()) as JobWithBestMatchPreview[];
      setAllJobs(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load jobs.");
    } finally {
      setJobsLoading(false);
    }
  };

  // expects { feedbackId } back so we can route straight to the analysis page.
  const handleAnalyze = async (job: JobWithBestMatchPreview) => {
    setAnalyzingJobId(job.jobId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication error.");

      const response = await fetch(`${apiUrl}/api/jobs/${job.jobId}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ resumeId }),
      });
      if (!response.ok) throw new Error("Failed to analyze resume.");

      const result = (await response.json()) as { feedbackId: number };
      setPickerOpen(false);
      navigate(`/job-analyzed/${result.feedbackId}`, {
        state: { jobTitle: job.jobTitle, company: job.company, resumeTitle },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to analyze resume."
      );
    } finally {
      setAnalyzingJobId(null);
    }
  };

  const analyzedJobIds = new Set(analyzedJobs.map((j) => j.jobId));
  const availableJobs = allJobs.filter((j) => !analyzedJobIds.has(j.jobId));

  return (
    <div>
      <h1 className="mx-auto px-5 pb-4 pt-10 text-center text-5xl sm:text-6xl">
        Jobs Analyzed
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="mx-auto flex flex-col flex-wrap content-center justify-start gap-4 px-5 py-10 md:flex-row">
          {analyzedJobs.length === 0 && (
            <p className="w-full text-center text-sm text-muted-foreground">
              This resume hasn't been analyzed against any jobs yet.
            </p>
          )}

          {analyzedJobs.map((match) => (
            <Link key={match.feedbackId} to={`/job-analyzed/${match.feedbackId}`}>
              <Card className="h-64 w-52 transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="w-full overflow-hidden text-ellipsis text-center text-xl">
                    {match.jobTitle}
                  </CardTitle>
                  <CardDescription className="w-full overflow-hidden text-ellipsis text-center">
                    {match.company}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScoreGauge score={match.overallMatchScore} />
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Add a new job analysis */}
          <Card className="h-64 w-52 overflow-hidden transition-shadow hover:shadow-xl hover:shadow-border p-0 ">
            <button
              className="flex h-full w-full m-0  items-center justify-center text-7xl text-muted-foreground transition-colors hover:text-foreground hover:cursor-pointer"
              onClick={openPicker}
              aria-label="Analyze against a job"
            >
              +
            </button>
          </Card>
        </div>
      )}

      {/* Job picker dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Analyze against a job</DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-2">
            {jobsLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : availableJobs.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {allJobs.length === 0
                  ? "You don't have any jobs tracked yet."
                  : "This resume has already been analyzed against every tracked job."}
              </p>
            ) : (
              availableJobs.map((job) => (
                <button
                  key={job.jobId}
                  onClick={() => handleAnalyze(job)}
                  disabled={analyzingJobId !== null}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {job.jobTitle}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {job.company}
                    </span>
                  </span>
                  {analyzingJobId === job.jobId ? (
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

export default JobsAnalyzedSection;