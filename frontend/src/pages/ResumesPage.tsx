import type { IResume } from "@/types";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Search,
  Edit,
  Download,
  Trash2,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn, downloadPdfFromUrl } from "@/lib/utils";
import { supabase } from "@/supabaseClient";

const apiUrl = import.meta.env.VITE_DEV_SERVER;
const thumbnailUrl = `${import.meta.env.VITE_LOCAL_STORAGE}/thumbnail`;
const basePdfUrl = `${import.meta.env.VITE_LOCAL_STORAGE}/resumes`;

type ScoreTier = "good" | "improve" | "warning" | "error";

function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return "good";
  if (score >= 65) return "improve";
  if (score >= 50) return "warning";
  return "error";
}

const TIER_STYLES: Record<
  ScoreTier,
  { bg: string; text: string; border: string; icon: React.ElementType }
> = {
  good: {
    bg: "bg-[var(--badge-green-bg)]",
    text: "text-[var(--badge-green-text)]",
    border: "border-[var(--badge-green-border)]",
    icon: CheckCircle2,
  },
  improve: {
    bg: "bg-[var(--improve-bg)]",
    text: "text-[var(--improve-text)]",
    border: "border-[var(--improve-border)]",
    icon: CheckCircle2,
  },
  warning: {
    bg: "bg-[var(--badge-yellow-bg)]",
    text: "text-[var(--badge-yellow-text)]",
    border: "border-[var(--badge-yellow-border)]",
    icon: AlertTriangle,
  },
  error: {
    bg: "bg-[var(--badge-red-bg)]",
    text: "text-[var(--badge-red-text)]",
    border: "border-[var(--badge-red-border)]",
    icon: XCircle,
  },
};

function ScoreBadge({ score }: { score: number }) {
  const tier = getScoreTier(score);
  const { bg, text, border, icon: Icon } = TIER_STYLES[tier];
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold",
        bg,
        text,
        border
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {score}%
    </div>
  );
}

function relativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}



function UploadNewCard() {
  return (
    <Link
      to="/upload-resume"
      className="group flex h-72 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card transition-colors hover:border-primary hover:bg-muted"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Plus className="h-6 w-6" />
      </div>
      <span className="text-sm font-medium text-foreground">
        Upload new resume
      </span>
      <span className="text-xs text-muted-foreground">
        PDF, DOCX up to 5MB
      </span>
    </Link>
  );
}

function ResumeCard({
  resume,
  onDelete,
  onDownload,
}: {
  resume: IResume;
  onDelete: (id: number) => void;
  onDownload: (pdfUrl: string, pdfName: string) => void;
}) {
  const uploadDate = new Date(resume.resumeUploadDate);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative flex h-72 flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      {/* Thumbnail area */}
      <div className="relative h-40 w-full bg-muted">
        {resume.resumeThumbnailUrl && !imgError ? (
          <img
            src={`${thumbnailUrl}/${resume.resumeThumbnailUrl}`}
            alt={`Thumbnail for ${resume.resumeTitle}`}
            className="h-full w-full object-cover object-top"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <FileText className="h-12 w-12" />
          </div>
        )}

        {/* Score badge – positioned over the top‑right corner */}
        <div className="absolute right-2 top-2">
          <ScoreBadge score={resume.resumeOverallScore} />
        </div>
      </div>

      {/* Content area – extra bottom padding prevents overlap */}
      <div className="flex flex-1 flex-col p-4 pb-11">
        <h3 className="mb-1 text-lg font-semibold text-foreground line-clamp-1">
          {resume.resumeTitle}
        </h3>
        <p className="text-sm text-muted-foreground">
          {resume.resumeThumbnailUrl ? "Uploaded" : "Draft"}
        </p>
        <div className="mt-auto flex items-center gap-1 pt-2 text-xs text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />
          Last edited {relativeTime(uploadDate)}
        </div>
      </div>

      {/* Hover actions – slides up into the empty bottom padding */}
      <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-around border-t border-border bg-card/90 p-3 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        <Link
          to={`/resume/${resume.resumeId}`}
          title="View"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowRight className="h-[18px] w-[18px]" />
        </Link>
        <button
          title="Edit"
          onClick={() => toast("Editing isn't available yet")}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary"
        >
          <Edit className="h-[18px] w-[18px]" />
        </button>
        <button
          title="Download"
          onClick={() => onDownload(resume.resumePdfUrl, resume.resumeTitle)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary"
        >
          <Download className="h-[18px] w-[18px]" />
        </button>
        {/* Allert dialgo */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              title="Delete"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-[var(--error-text)]"
            >
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {resume.resumeTitle}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your resume and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => onDelete(resume.resumeId)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div >
  );
}
function ResumesPage() {
  const [userResumes, setUserResumes] = useState<IResume[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");


  useEffect(() => {
    const getUserResumes = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Authentication error. Please log in again.");
          return;
        }

        const response = await fetch(`${apiUrl}/api/resume/get-resumes`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch resumes.");
        }
        const resumes = (await response.json()) as IResume[];
        setUserResumes(resumes);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to load resumes: ${error.message}`);
        } else {
          toast.error("An unexpected error occurred while loading resumes.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    getUserResumes();
  }, []);

  const handleDelete = async (resumeId: number) => {
    if (!window.confirm(`Delete This Resume? This can't be undone.`)) return;
    const previous = userResumes;
    setUserResumes((resumes) => resumes.filter((r) => r.resumeId !== resumeId));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication error.");

      const response = await fetch(
        `${apiUrl}/api/resume/${resumeId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete resume.");
      toast.success("Resume deleted.");
    } catch (error) {
      setUserResumes(previous);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete resume."
      );
    }
  };

  const handleDownload = (pdfUrl: string, pdfName: string) => {
    const safeName = `${pdfName}.pdf`
    toast.promise(
      downloadPdfFromUrl(`${basePdfUrl}/${pdfUrl}`, safeName),
      {
        loading: `Downloading ${safeName}...`,
        success: `${safeName} downloaded successfully!`,
        error: 'Failed to download the PDF.',
      });
  }

  const filteredResumes = useMemo(() => {
    if (!query.trim()) return userResumes;
    const q = query.toLowerCase();
    return userResumes.filter((r) => r.resumeTitle.toLowerCase().includes(q));
  }, [userResumes, query]);

  return (
    <div>
      {/* Desktop top bar */}
      <div className="mx-auto hidden h-16 max-w-[1200px] items-center justify-end gap-4 px-6 md:flex">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search resumes..."
            className="w-64 rounded-md border border-border bg-card py-1.5 pl-10 pr-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Link
          to="/upload-resume"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:bg-primary/90 active:scale-[0.98]"
        >
          Upload Resume
        </Link>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Your Resumes
            </h2>
            <p className="mt-1 text-muted-foreground">
              Manage and track your document versions.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
            <p className="ml-4 text-muted-foreground">Loading resumes...</p>
          </div>
        ) : userResumes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <UploadNewCard />
            {filteredResumes.map((resume) => (
              <ResumeCard
                key={resume.resumeId}
                resume={resume}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-20 text-center">
            <h3 className="text-2xl font-semibold text-foreground">
              No resumes found
            </h3>
            <p className="max-w-sm text-muted-foreground">
              It looks like you haven't uploaded any resumes yet. Add your
              first one to get started.
            </p>
            <Link
              to="/upload-resume"
              className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:bg-primary/90 active:scale-[0.98]"
            >
              Add a new resume
            </Link>
          </div>
        )}


      </div>

    </div>
  );
}

export default ResumesPage;