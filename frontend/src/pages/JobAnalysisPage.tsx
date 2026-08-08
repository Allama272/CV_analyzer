import { useParams, useLocation, Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ProcessingStatus } from "@/types";
import type { AnalyzedJobFeedback } from "@/types";
import { supabase } from "@/supabaseClient";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ScoreGauge from "@/components/ScoreGauge";
import ATS from "@/components/ATS";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@/components/Accordion";
import { JobMatchHeader, JobMatchContent } from "@/components/JobMatchSection";

const apiUrl = import.meta.env.VITE_DEV_SERVER;
const storageLocation = import.meta.env.VITE_LOCAL_STORAGE;
// TODO: confirm the real endpoint for fetching a single job-resume analysis by feedbackId.
const ANALYSIS_ENDPOINT = `${apiUrl}/api/jobs/job-feedback/`;

// Optional context passed via `<Link state={{...}}>` from wherever this page
// is linked from (see JobDetailPage's FeedbackRow) — the analysis endpoint
// itself doesn't return job/resume titles, only the scoring breakdown, so
// this is a nice-to-have that degrades gracefully to generic copy if it's
// missing (e.g. on a hard refresh, where router state is lost).
interface JobAnalysisNavState {
  jobTitle?: string;
  company?: string;
  resumeTitle?: string;
}

function JobAnalysisPage() {
  const { feedbackId } = useParams<{ feedbackId: string }>();
  const location = useLocation();
  const navState = (location.state as JobAnalysisNavState) ?? {};

  const [data, setData] = useState<AnalyzedJobFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!feedbackId) {
      toast.error("Feedback ID is missing");
      setError("Feedback ID is missing from the URL.");
      return;
    }

    const pollAnalysisStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Authentication error. Please log in again.");
        }

        const response = await fetch(`${ANALYSIS_ENDPOINT}${feedbackId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch analysis: ${response.statusText}`);
        }

        const result = (await response.json()) as AnalyzedJobFeedback;
        setData(result);

        if (
          result.status === ProcessingStatus.Pending ||
          result.status === ProcessingStatus.Processing
        ) {
          pollingTimer.current = window.setTimeout(pollAnalysisStatus, 6000);
        } else if (pollingTimer.current) {
          clearTimeout(pollingTimer.current);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
        toast.error(message);
        if (pollingTimer.current) {
          clearTimeout(pollingTimer.current);
        }
      }
    };

    pollAnalysisStatus();
    return () => {
      if (pollingTimer.current) {
        clearTimeout(pollingTimer.current);
      }
    };
  }, [feedbackId]);

  // Loading state
  if (!data && !error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <DotLottieReact
            src="/images/loadingRobot.lottie"
            className="mx-auto w-92"
            loop
            autoplay
          />
          <p className="mt-4 text-lg text-foreground">
            Fetching your job match analysis...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-[var(--error-text)]">
            Error Loading Analysis
          </h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Analysis not found.</p>
      </div>
    );
  }

  switch (data.status) {
    case ProcessingStatus.Pending:
    case ProcessingStatus.Processing:
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <DotLottieReact
              src="/images/loadingRobot.lottie"
              className="mx-auto w-92"
              loop
              autoplay
            />
            <h3 className="mt-4 text-2xl font-bold text-foreground">
              Analyzing the match... 🤖
            </h3>
            <p className="mt-2 text-muted-foreground">
              Comparing this resume against the job. This may take a moment.
            </p>
          </div>
        </div>
      );

    case ProcessingStatus.Failed:
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-[var(--error-text)]">
              Analysis Failed
            </h2>
            <p className="mb-4 text-muted-foreground">
              An unknown error occurred during analysis.
            </p>
          </div>
        </div>
      );

    case ProcessingStatus.Completed: {
      const atsSuggestions = data.atsCompatibility.tips.map((t) => ({
        type: t.type.toLowerCase() as "good" | "improve",
        tip: t.tip,
      }));

      return (
        <div>
          <div className="flex w-full flex-row max-lg:flex-col-reverse">
            <section className="sticky top-4 flex h-[calc(100vh-4rem)] w-1/2 items-center justify-center bg-[url('/images/bg-small.svg')] bg-cover px-8 py-8 max-lg:w-full">
              {data.resumeImageUrl ? (
                <div className="gradient-border h-full max-h-full w-auto max-w-full animate-in fade-in p-2 duration-1000 max-sm:m-0">
                  <img
                    src={`${storageLocation}/preview/${data.resumeImageUrl}`}
                    alt="Resume preview"
                    className="h-full w-full rounded-2xl object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No preview available</p>
                </div>
              )}
            </section>

            <section className="feedback-section">
              <Link
                to="/jobs"
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Job Tracker
              </Link>

              <h2 className="text-4xl font-bold text-primary">
                {navState.jobTitle ? `Match: ${navState.jobTitle}` : "Job Match Analysis"}
              </h2>
              {navState.company && (
                <p className="text-muted-foreground">{navState.company}</p>
              )}

              <div className="mt-4 flex animate-in flex-col gap-8 fade-in duration-1000">
                <div className="w-full rounded-2xl bg-card p-4 shadow-md">
                  <div className="flex flex-row items-center gap-8">
                    <ScoreGauge score={data.overallScore} />
                    <div className="flex flex-col gap-2">
                      <h2 className="text-2xl font-bold text-foreground">
                        Overall Match Score
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {navState.resumeTitle
                          ? `How well ${navState.resumeTitle} matches this job, based on the categories below.`
                          : "How well this resume matches the job, based on the categories below."}
                      </p>
                    </div>
                  </div>
                </div>

                <ATS score={data.atsCompatibility.score} suggestions={atsSuggestions} />

                <Accordion>
                  <AccordionItem id="keyword">
                    <AccordionHeader itemId="keyword">
                      <JobMatchHeader title="Keyword Match" score={data.keywordMatch.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="keyword">
                      <JobMatchContent
                        matchedLabel="Matched Keywords"
                        matchedItems={data.keywordMatch.matched}
                        missingLabel="Missing Keywords"
                        missingItems={data.keywordMatch.missing}
                        tips={data.keywordMatch.tips}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem id="skills">
                    <AccordionHeader itemId="skills">
                      <JobMatchHeader title="Skills Match" score={data.skillsMatch.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="skills">
                      <JobMatchContent
                        matchedLabel="Matched Skills"
                        matchedItems={data.skillsMatch.matchedSkills}
                        missingLabel="Missing Skills"
                        missingItems={data.skillsMatch.missingSkills}
                        tips={data.skillsMatch.tips}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem id="experience">
                    <AccordionHeader itemId="experience">
                      <JobMatchHeader
                        title="Experience Alignment"
                        score={data.experienceAlignment.score}
                      />
                    </AccordionHeader>
                    <AccordionContent itemId="experience">
                      <JobMatchContent
                        matchedLabel="Matched Experience"
                        matchedItems={data.experienceAlignment.matchedExperience}
                        missingLabel="Gaps"
                        missingItems={data.experienceAlignment.gaps}
                        tips={data.experienceAlignment.tips}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem id="education">
                    <AccordionHeader itemId="education">
                      <JobMatchHeader
                        title="Education Alignment"
                        score={data.educationAlignment.score}
                      />
                    </AccordionHeader>
                    <AccordionContent itemId="education">
                      <JobMatchContent
                        matchedLabel="Matched"
                        matchedItems={data.educationAlignment.matched}
                        missingLabel="Missing"
                        missingItems={data.educationAlignment.missing}
                        tips={data.educationAlignment.tips}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </div>

          <Separator className="mx-4 my-4" />
        </div>
      );
    }

    default:
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-foreground">Unknown analysis status.</p>
        </div>
      );
  }
}

export default JobAnalysisPage;