import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  FileUp,
  Briefcase,
  ArrowRight,
  FileText,
  Building2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabaseClient";
import { UserAuth } from "@/context/AuthContext";
import { getScoreTier, SCORE_TIER_STYLES } from "@/lib/score";
import { STATUS_CONFIG } from "@/lib/job-status";
import { cn } from "@/lib/utils";
import { JobStatus } from "@/types";
import type { IResume, JobWithBestMatchPreview } from "@/types";

const apiUrl: string = import.meta.env.VITE_DEV_SERVER;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function ScoreBadge({ score }: { score: number }) {
  const styles = SCORE_TIER_STYLES[getScoreTier(score)];
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold",
        styles.bg,
        styles.text,
        styles.border
      )}
    >
      {score}%
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
function EmptySection({
  message,
  actionLabel,
  to,
}: {
  message: string;
  actionLabel: string;
  to: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link to={to} className="text-sm font-medium text-primary hover:underline">
        {actionLabel}
      </Link>
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
        <Sparkles className="h-7 w-7" />
      </span>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Let's get you started</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Upload a resume and track a job to see how well you match — this is
          where your activity will show up.
        </p>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button asChild className="gap-2">
          <Link to="/upload-resume">
            <FileUp className="h-4 w-4" />
            Upload a resume
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/add-job">
            <Briefcase className="h-4 w-4" />
            Track a new job
          </Link>
        </Button>
      </div>
    </div>
  );
}

function App() {
  const { session } = UserAuth() || { session: undefined };
  const firstName =
    session?.user?.user_metadata?.full_name?.split(" ")[0] ||
    session?.user?.email?.split("@")[0];

  const [resumes, setResumes] = useState<IResume[]>([]);
  const [jobs, setJobs] = useState<JobWithBestMatchPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const [resumesRes, jobsRes] = await Promise.all([
          fetch(`${apiUrl}/api/resume/get-resumes`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
          fetch(`${apiUrl}/api/jobs`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
        ]);

        if (resumesRes.ok) setResumes((await resumesRes.json()) as IResume[]);
        if (jobsRes.ok) setJobs((await jobsRes.json()) as JobWithBestMatchPreview[]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const recentResumes = [...resumes]
    .sort(
      (a, b) =>
        new Date(b.resumeUploadDate).getTime() - new Date(a.resumeUploadDate).getTime()
    )
    .slice(0, 4);

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const activeJobs = jobs.filter(
    (j) => j.status === JobStatus.Applied || j.status === JobStatus.Interviewing
  ).length;

  const hasNoData = !isLoading && resumes.length === 0 && jobs.length === 0;

  if (isLoading && resumes.length === 0 && jobs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center px-6 py-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here's where things stand with your job search.
        </p>
      </div>

      {hasNoData ? (
        <EmptyDashboard />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Resumes" value={resumes.length} icon={FileText} />
            <StatCard label="Jobs tracked" value={jobs.length} icon={Briefcase} />
            <StatCard label="Active applications" value={activeJobs} icon={Building2} />
          </div>

          <div className="mb-10 flex flex-wrap gap-3">
            <Button asChild className="gap-2">
              <Link to="/upload-resume">
                <FileUp className="h-4 w-4" />
                Upload a resume
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/add-job">
                <Briefcase className="h-4 w-4" />
                Track a new job
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent resumes */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent resumes</h2>
                <Link
                  to="/resumes"
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {recentResumes.length === 0 ? (
                <EmptySection
                  message="No resumes uploaded yet."
                  actionLabel="Upload one"
                  to="/upload-resume"
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {recentResumes.map((resume) => (
                    <Link
                      key={resume.resumeId}
                      to={`/resume/${resume.resumeId}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                        <FileText className="h-5 w-5" />
                      </span>
                      <span className="flex-1 truncate text-sm font-medium text-foreground">
                        {resume.resumeTitle}
                      </span>
                      <ScoreBadge score={resume.resumeOverallScore} />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Recent jobs */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent jobs</h2>
                <Link
                  to="/jobs"
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {recentJobs.length === 0 ? (
                <EmptySection
                  message="No jobs tracked yet."
                  actionLabel="Add one"
                  to="/add-job"
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {recentJobs.map((job) => {
                    const status = STATUS_CONFIG[job.status];
                    return (
                      <Link
                        key={job.jobId}
                        to={`/job/${job.jobId}`}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                          <Building2 className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {job.jobTitle}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                            {status.label}
                          </span>
                        </span>
                        {job.bestMatchScore !== null && (
                          <ScoreBadge score={job.bestMatchScore} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default App;