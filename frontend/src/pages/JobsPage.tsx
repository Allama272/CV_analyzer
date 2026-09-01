import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Search, LayoutGrid, List as ListIcon, Archive, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { JobResumePreviewCard } from "@/components/JobResumePreviewCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabaseClient";
import { STATUS_CONFIG, STATUS_ORDER, ALWAYS_VISIBLE_STATUSES } from "@/lib/job-status";
import type { JobWithBestMatchPreview, JobStatusType } from "@/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const apiUrl: string = import.meta.env.VITE_DEV_SERVER;

type ViewMode = "board" | "list" | "archived";

// --- Draggable card wrapper -------------------------------------------------
function DraggableJobCard({
  job,
  isOverlay = false,
  onStatusChange,
  onArchive,
  onUnarchive,
}: {
  job: JobWithBestMatchPreview;
  isOverlay?: boolean;
  onStatusChange?: (jobId: number, status: JobStatusType) => void;
  onArchive?: (jobId: number) => void;
  onUnarchive?: (jobId: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.jobId,
    data: { status: job.status },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "touch-none",
        isDragging && !isOverlay && "opacity-40",
        isOverlay && "cursor-grabbing shadow-xl rotate-2"
      )}
    >
      <JobResumePreviewCard
        job={job}
        onStatusChange={onStatusChange}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
      />
    </div>
  );
}

// --- Droppable column -------------------------------------------------------
function DroppableColumn({
  status,
  jobs,
  onStatusChange,
  onArchive,
}: {
  status: JobStatusType;
  jobs: JobWithBestMatchPreview[];
  onStatusChange: (jobId: number, status: JobStatusType) => void;
  onArchive: (jobId: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div key={status} className="flex w-80 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className={cn("h-3 w-3 rounded-full", STATUS_CONFIG[status].dot)} />
          {STATUS_CONFIG[status].label}
          <span className="font-normal text-muted-foreground">({jobs.length})</span>
        </h2>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[8rem] flex-col gap-3 rounded-lg p-1 transition-colors",
          isOver && "bg-accent/50 ring-2 ring-primary/40"
        )}
      >
        {jobs.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground">
            No jobs here yet
          </div>
        ) : (
          jobs.map((job) => (
            <DraggableJobCard
              key={job.jobId}
              job={job}
              onStatusChange={onStatusChange}
              onArchive={onArchive}
            />
          ))
        )}
      </div>
    </div>
  );
}

function JobsPage() {
  const [userJobs, setUserJobs] = useState<JobWithBestMatchPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("board");
  const [activeJob, setActiveJob] = useState<JobWithBestMatchPreview | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const scroll = (direction: "left" | "right") => {
    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
    if (!viewport) return;
    viewport.scrollBy({ left: direction === "left" ? -600 : 600, behavior: "smooth" });
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
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch jobs.");
        }
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

  // --- Optimistic mutation helpers ------------------------------------------
  const patchJob = async (jobId: number, path: string, body: Record<string, unknown>) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Authentication error. Please log in again.");

    const response = await fetch(`${apiUrl}/api/jobs/${jobId}/${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Request failed.");
    }
  };

  const handleStatusChange = async (jobId: number, newStatus: JobStatusType) => {
    const job = userJobs.find((j) => j.jobId === jobId);
    if (!job || job.status === newStatus) return;
    const previousStatus = job.status;

    setUserJobs((prev) =>
      prev.map((j) => (j.jobId === jobId ? { ...j, status: newStatus } : j))
    );

    try {
      await patchJob(jobId, "status", { status: newStatus });
    } catch (error) {
      setUserJobs((prev) =>
        prev.map((j) => (j.jobId === jobId ? { ...j, status: previousStatus } : j))
      );
      toast.error(error instanceof Error ? `Couldn't update status: ${error.message}` : "Couldn't update job status.");
    }
  };

  const handleArchiveToggle = async (jobId: number, archived: boolean) => {
    const job = userJobs.find((j) => j.jobId === jobId);
    if (!job) return;

    const previous = { archived: job.archived };

    setUserJobs((prev) =>
      prev.map((j) =>
        j.jobId === jobId
          ? { ...j, archived }
          : j
      )
    );

    toast.success(archived ? "Job archived" : "Job restored");

    try {
      await patchJob(jobId, "archive", { archived });
    } catch (error) {
      setUserJobs((prev) =>
        prev.map((j) => (j.jobId === jobId ? { ...j, ...previous } : j))
      );
      toast.error(error instanceof Error ? `Couldn't update: ${error.message}` : "Couldn't update job.");
    }
  };

  // --- Filtering / grouping ---------------------------------------------------
  const activeJobs = useMemo(() => userJobs.filter((j) => !j.archived), [userJobs]);
  const archivedJobs = useMemo(() => userJobs.filter((j) => j.archived), [userJobs]);

  const baseJobs = view === "archived" ? archivedJobs : activeJobs;

  const filteredJobs = useMemo(() => {
    if (!query.trim()) return baseJobs;
    const q = query.toLowerCase();
    return baseJobs.filter(
      (job) =>
        job.jobTitle.toLowerCase().includes(q) || job.company.toLowerCase().includes(q)
    );
  }, [baseJobs, query]);

  const columns = useMemo(() => {
    const grouped = new Map<JobStatusType, JobWithBestMatchPreview[]>();
    STATUS_ORDER.forEach((s) => grouped.set(s, []));
    filteredJobs.forEach((job) => grouped.get(job.status)?.push(job));

    return STATUS_ORDER.filter(
      (s) => ALWAYS_VISIBLE_STATUSES.includes(s) || (grouped.get(s)?.length ?? 0) > 0
    ).map((status) => {
      const columnJobs = (grouped.get(status) ?? []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return { status, jobs: columnJobs };
    });
  }, [filteredJobs]);

  const handleDragStart = (event: DragStartEvent) => {
    const job = activeJobs.find((j) => j.jobId === event.active.id);
    setActiveJob(job ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);
    if (!over) return;
    const newStatus = over.id as JobStatusType;
    handleStatusChange(active.id as number, newStatus);
  };

  return (
    <div className="px-6 py-8 pb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Job Tracker</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
          <button
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors",
              view === "board" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-card/60"
            )}
          >
            <LayoutGrid className="h-4 w-4" /> Board
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors",
              view === "list" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-card/60"
            )}
          >
            <ListIcon className="h-4 w-4" /> List
          </button>
          <button
            onClick={() => setView("archived")}
            className={cn(
              "flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors",
              view === "archived" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-card/60"
            )}
          >
            <Archive className="h-4 w-4" /> Archived
            {archivedJobs.length > 0 && (
              <span className="ml-0.5 rounded-full bg-muted-foreground/20 px-1.5 text-xs">
                {archivedJobs.length}
              </span>
            )}
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
      ) : view === "archived" ? (
        filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 pt-16 text-center">
            <Archive className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground">No archived jobs</h3>
            <p className="max-w-sm text-muted-foreground">
              Jobs you archive will show up here, out of your main board.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobResumePreviewCard
                key={job.jobId}
                job={job}
                onStatusChange={handleStatusChange}
                onUnarchive={(jobId) => handleArchiveToggle(jobId, false)}
              />
            ))}
          </div>
        )
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
            <JobResumePreviewCard
              key={job.jobId}
              job={job}
              onStatusChange={handleStatusChange}
              onArchive={(jobId) => handleArchiveToggle(jobId, true)}
            />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="group relative -mx-6">
            <div className="pointer-events-none absolute bottom-6 left-0 top-0 z-10 hidden w-20 items-center bg-gradient-to-r from-background via-background/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
              <button
                onClick={() => scroll("left")}
                className="pointer-events-auto ml-6 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-md transition-transform hover:scale-105 hover:bg-accent focus:opacity-100"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <ScrollArea ref={scrollRef} className="w-full whitespace-nowrap">
              <div className="flex w-max gap-6 px-6 pb-6">
                {columns.map(({ status, jobs }) => (
                  <DroppableColumn
                    key={status}
                    status={status}
                    jobs={jobs}
                    onStatusChange={handleStatusChange}
                    onArchive={(jobId) => handleArchiveToggle(jobId, true)}
                  />
                ))}
                <div className="w-1 shrink-0" />
              </div>
              <ScrollBar orientation="horizontal" className="px-4" />
            </ScrollArea>

            <div className="pointer-events-none absolute bottom-6 right-0 top-0 z-10 hidden w-20 items-center justify-end bg-gradient-to-l from-background via-background/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
              <button
                onClick={() => scroll("right")}
                className="pointer-events-auto mr-6 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-md transition-transform hover:scale-105 hover:bg-accent focus:opacity-100"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <DragOverlay>
            {activeJob ? <DraggableJobCard job={activeJob} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <Link to="/add-job" className="block w-fit mx-auto mt-8">
        <Button variant="outline" className="h-auto rounded-2xl p-3 px-5 text-lg hover:cursor-pointer">
          Add A New Job
        </Button>
      </Link>
    </div>
  );
}

export default JobsPage;