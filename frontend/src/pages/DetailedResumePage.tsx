import { useParams } from "react-router";
import { ProcessingStatus, type ResumeFeedback } from "@/types";
import { useEffect, useRef, useState } from "react";
import Summary from "@/components/Summary";
import ATS from "@/components/ATS";
import Details from "@/components/Details";
import JobsAnalyzedSection from "@/components/JobsAnalyzedSection";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const apiUrl = import.meta.env.VITE_DEV_SERVER;
const storageLocation = import.meta.env.VITE_LOCAL_STORAGE;
const RESUME_ENDPOINT = `${apiUrl}/api/resume/get-resume?resumeId=`;

function DetailedResumePage() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const [resumeData, setResumeData] = useState<ResumeFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollingTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!resumeId) {
      toast.error("Resume ID is missing");
      setError("Resume ID is missing from the URL.");
      return;
    }

    const pollResumeStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Authentication error. Please log in again.");
        }

        // Fetching from the single resume endpoint
        const response = await fetch(`${RESUME_ENDPOINT}${resumeId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch resume status: ${response.statusText}`);
        }

        const result = (await response.json()) as ResumeFeedback;
        setResumeData(result);

        // --- Polling Logic ---
        // If the status is still pending or processing, schedule the next poll.
        if (
          result.status === ProcessingStatus.Pending ||
          result.status === ProcessingStatus.Processing
        ) {
          pollingTimer.current = window.setTimeout(pollResumeStatus, 3000); // Poll again after 3 seconds
        } else {
          // If completed or failed, we stop polling.
          if (pollingTimer.current) {
            clearTimeout(pollingTimer.current);
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(errorMessage);
        toast.error(errorMessage);
        if (pollingTimer.current) {
          clearTimeout(pollingTimer.current);
        }
      }
    };

    // Start the polling process
    pollResumeStatus();

    // Cleanup function
    return () => {
      if (pollingTimer.current) {
        clearTimeout(pollingTimer.current);
      }
    };
  }, [resumeId]);

  // Loading state
  if (!resumeData && !error) {
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
            Fetching your resume analysis...
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
            Error Loading Resume
          </h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!resumeData) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Resume Not Found</h2>
          <p className="text-muted-foreground">
            The requested resume could not be found.
          </p>
        </div>
      </div>
    );
  }

  switch (resumeData.status) {
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
              Analyzing Your Resume... 🤖
            </h3>
            <p className="mt-2 text-muted-foreground">
              Our AI is working its magic. This may take a moment.
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
              {error || "An unknown error occurred during analysis."}
            </p>
          </div>
        </div>
      );

    case ProcessingStatus.Completed:
      return (
        <div>
          <div className="flex w-full flex-row max-lg:flex-col-reverse">
            <section className="sticky top-4 flex h-[calc(100vh-4rem)] w-1/2 items-center justify-center bg-[url('/images/bg-small.svg')] bg-cover px-8 py-8 max-lg:w-full">
              {resumeData.resumeImageUrl ? (
                <div className="gradient-border h-full max-h-full w-auto max-w-full animate-in fade-in p-2 duration-1000 max-sm:m-0">
                  <a
                    href={`${storageLocation}/preview/${resumeData.resumeImageUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`${storageLocation}/preview/${resumeData.resumeImageUrl}`}
                      alt="Resume preview"
                      className="h-full w-full rounded-2xl object-contain"
                      title="Click to view full size"
                      onError={(e) => {
                        console.error("Failed to load resume image");
                        e.currentTarget.src = "/images/placeholder-resume.png";
                      }}
                    />
                  </a>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No preview available</p>
                </div>
              )}
            </section>

            <section className="feedback-section">
              <h2 className="text-4xl font-bold text-primary">Resume Review</h2>
              <div className="flex animate-in flex-col gap-8 fade-in duration-1000">
                <Summary feedback={resumeData} />
                <ATS
                  score={resumeData.ats?.score || 0}
                  suggestions={resumeData.ats?.tips || []}
                />
                <Details feedback={resumeData} />
              </div>
            </section>
          </div>

          <Separator className="mx-4 my-4" />

          {/*
            NOTE: ResumeFeedback doesn't appear to carry a resume title field
            anywhere it's used above, so JobsAnalyzedSection isn't passed one —
            it degrades gracefully (the analysis page just shows generic copy
            instead of "How {title} matches..."). Pass one here if you have it.
          */}
          {resumeId && <JobsAnalyzedSection resumeId={resumeId} />}
        </div>
      );

    default:
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-foreground">Unknown resume status.</p>
        </div>
      );
  }
}

export default DetailedResumePage;