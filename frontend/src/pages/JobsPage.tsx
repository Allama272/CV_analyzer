import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Search, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { JobResumePreviewCard } from "@/components/JobResumePreviewCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabaseClient";
import { STATUS_CONFIG, STATUS_ORDER, ALWAYS_VISIBLE_STATUSES } from "@/lib/job-status";
import type { JobWithBestMatchPreview, JobStatusType } from "@/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const apiUrl: string = import.meta.env.VITE_DEV_SERVER;

type ViewMode = "board" | "list";

function JobsPage() {
  const [userJobs, setUserJobs] = useState<JobWithBestMatchPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("board");

  const scrollRef = useRef<HTMLDivElement>(null); // this now refs the ScrollArea ROOT

  const scroll = (direction: 'left' | 'right') => {
    const viewport = scrollRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement | null;
    if (!viewport) return;
    const amount = 400;
    viewport.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const getUserJobs = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Authentication error. Please log in again.");
          return;
        }


        const response = await fetch(`${apiUrl}/api/jobs`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch jobs.");
        }
        // console.table(await response.json())
        const jobs = (await response.json()) as JobWithBestMatchPreview[];
        setUserJobs(jobs);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to load jobs: ${error.message}`);
        } else {
          toast.error("An unexpected error occurred while loading jobs.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    getUserJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    if (!query.trim()) return userJobs;
    const q = query.toLowerCase();
    return userJobs.filter(
      (job) =>
        job.jobTitle.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q)
    );
  }, [userJobs, query]);

  const columns = useMemo(() => {
    const grouped = new Map<JobStatusType, JobWithBestMatchPreview[]>();
    STATUS_ORDER.forEach((s) => grouped.set(s, []));
    filteredJobs.forEach((job) => grouped.get(job.status)?.push(job));

    return STATUS_ORDER.filter(
      (s) => ALWAYS_VISIBLE_STATUSES.includes(s) || (grouped.get(s)?.length ?? 0) > 0
    ).map((status) => {
      const columnJobs = grouped.get(status) ?? [];

      // Sort them by date (descending / newest first)
      const sortedJobs = columnJobs.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return { status, jobs: sortedJobs };
    });
  }, [filteredJobs]);

  // console.table(userJobs)
  return (
    <div className="px-6 py-8 pb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Job Tracker</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
          <button
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors",
              view === "board"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:bg-card/60"
            )}
          >
            <LayoutGrid className="h-4 w-4" /> Board
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors",
              view === "list"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:bg-card/60"
            )}
          >
            <ListIcon className="h-4 w-4" /> List
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-card p-2 shadow-sm">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search job titles or companies..."
            className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="ml-4 text-muted-foreground">Loading jobs...</p>
        </div>
      ) : userJobs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 pt-16 text-center">
          <h3 className="text-xl font-semibold text-foreground">No jobs yet</h3>
          <p className="max-w-sm text-muted-foreground">
            Add a job to start tracking your applications and match scores.
          </p>
        </div>
      ) : view === "list" ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredJobs.map((job) => (
            <JobResumePreviewCard key={job.jobId} job={job} />
          ))}
        </div>
      ) : (

        <div className="group relative -mx-6">

          {/* Left button + Gradient mask (adjusted width & margin to fit the new edge) */}
          <div className="pointer-events-none absolute bottom-6 left-0 top-0 z-10 hidden w-32 items-center bg-gradient-to-r from-background via-background/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
            <button
              onClick={() => scroll('left')}
              className="pointer-events-auto ml-6 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-md transition-transform hover:scale-105 hover:bg-accent focus:opacity-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <ScrollArea ref={scrollRef} className="w-full whitespace-nowrap">
            {/* Added px-6 HERE so the padding scrolls with the content */}
            <div className="flex w-max gap-6 px-6 pb-6">
              {columns.map(({ status, jobs }) => (
                <div key={status} className="flex w-80 shrink-0 flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span
                        className={cn("h-3 w-3 rounded-full", STATUS_CONFIG[status].dot)}
                      />
                      {STATUS_CONFIG[status].label}
                      <span className="font-normal text-muted-foreground">
                        ({jobs.length})
                      </span>
                    </h2>
                  </div>
                  {jobs.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground">
                      No jobs here yet
                    </div>
                  ) : (
                    jobs.map((job) => <JobResumePreviewCard key={job.jobId} job={job} />)
                  )}
                </div>
              ))}

              {/* Saftey spacer for Safari which occasionally ignores right-padding on flex containers */}
              <div className="w-1 shrink-0" />
            </div>
            <ScrollBar orientation="horizontal" className="px-4"/>
          </ScrollArea>

          {/* Right button + Gradient mask */}
          <div className="pointer-events-none absolute bottom-6 right-0 top-0 z-10 hidden w-32 items-center justify-end bg-gradient-to-l from-background via-background/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
            <button
              onClick={() => scroll('right')}
              className="pointer-events-auto mr-6 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-md transition-transform hover:scale-105 hover:bg-accent focus:opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <Link to="/add-job" className="block w-fit mx-auto mt-8">
        <Button
          variant="outline"
          className="h-auto rounded-2xl p-3 px-5 text-lg hover:cursor-pointer"
        >
          Add A New Job
        </Button>
      </Link>
    </div>
  );
}

export default JobsPage;