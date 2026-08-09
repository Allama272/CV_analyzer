import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import {
    ArrowLeft,
    ClipboardCheck,
    FileSearch,
    BarChart3,
    Loader2,
    Briefcase,
    Sparkles,
    Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/supabaseClient";
import { cn } from "@/lib/utils";
import type { AutoFillJob, ApiFail } from "@/types";

const apiUrl = import.meta.env.VITE_DEV_SERVER;

// Extensible validation configuration
const SUPPORTED_PLATFORMS = [
    { name: 'LinkedIn', regex: /linkedin\.com\/jobs/i },
    // { name: 'Indeed', regex: /indeed\.com/i },
    // { name: 'Glassdoor', regex: /glassdoor\.com/i },
];

function AddJobPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isAutoFilling, setIsAutoFilling] = useState(false);

    // Form State
    const [jobUrl, setJobUrl] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [company, setCompany] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [jobDescription, setJobDescription] = useState("");

    const navigate = useNavigate();

    const handleAutoFill = async (e: React.MouseEvent) => {
        e.preventDefault();

        const urlToFetch = jobUrl.trim();

        if (!urlToFetch) {
            toast.error("Please paste a link to auto-fill.");
            return;
        }

        // 1. Validation Logic
        const isValid = SUPPORTED_PLATFORMS.some(platform => platform.regex.test(urlToFetch));

        if (!isValid) {
            const supportedNames = SUPPORTED_PLATFORMS.map(p => p.name).join(", ");
            toast.error(`Invalid URL. Currently supported platforms: ${supportedNames}`);
            return;
        }

        setIsAutoFilling(true);

        // 2. Fetch Logic
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Authentication error. Please log in again.");
                setIsAutoFilling(false);
                return;
            }

            // Using encodeURIComponent to safely pass the URL in the query string
            const response = await fetch(`${apiUrl}/api/jobs/autofill?url=${encodeURIComponent(urlToFetch)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            const json = await response.json();
            const responseData = json as (AutoFillJob & ApiFail);

            if (!response.ok) {
                const errorMessage = responseData.message || `An error occurred: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            // 3. Populate State 
            setJobTitle(responseData.jobTitle || "");
            setCompany(responseData.company || "");
            setLogoUrl(responseData.logoUrl || "");
            setJobDescription(responseData.jobDescription || "");

            toast.success("Job details extracted successfully!");

        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unexpected error occurred while extracting the job.");
            }
        } finally {
            setIsAutoFilling(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (jobTitle.trim().length < 2) {
            toast.error("Please enter a valid job title.");
            return;
        }
        if (company.trim().length < 2) {
            toast.error("Please enter a valid company name.");
            return;
        }
        if (jobDescription.trim().length < 10) {
            toast.error("Job description must be at least 10 characters.");
            return;
        }

        setIsLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Authentication error. Please log in again.");
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${apiUrl}/api/jobs/save-job`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobUrl: jobUrl.trim(),
                    jobTitle: jobTitle.trim(),
                    company: company.trim(),
                    logoUrl: logoUrl.trim(),
                    jobDescription: jobDescription.trim(),
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errorMessage = responseData.message || `An error occurred: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            toast.success("Job saved successfully!");

            // Reset form
            setJobUrl("");
            setJobTitle("");
            setCompany("");
            setLogoUrl("");
            setJobDescription("");
            navigate("/jobs");

        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: ClipboardCheck,
            title: "Paste Any Job",
            description: "Copy-paste a job posting you're interested in directly from LinkedIn or Indeed."
        },
        {
            icon: FileSearch,
            title: "Resume Match",
            description: "See exactly how your resume stacks up against the job's core requirements."
        },
        {
            icon: BarChart3,
            title: "ATS Score",
            description: "Get a detailed compatibility score and actionable skill gap analysis."
        }
    ];

    const isSubmitDisabled = isLoading || !jobTitle.trim() || !company.trim() || jobDescription.trim().length < 10;

    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            <Link
                to="/jobs"
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Job Tracker
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Add a New Job
                </h1>
                <p className="mt-2 text-base text-muted-foreground">
                    Paste a job description to analyze how well your resume fits the role.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
                {/* Left Column: Form Card */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">
                                    Job Details
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Enter the information for the role you're applying for.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-6">
                            {/* Auto-fill Section */}
                            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
                                <label htmlFor="jobUrl" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                    Job Posting URL
                                    <span className="text-muted-foreground font-normal ml-1">
                                        (Auto-fill shortcut)
                                    </span>
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        id="jobUrl"
                                        type="url"
                                        placeholder="https://linkedin.com/jobs/..."
                                        value={jobUrl}
                                        onChange={(e) => setJobUrl(e.target.value)}
                                        className="h-10 flex-1 rounded-md bg-background"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleAutoFill}
                                        disabled={isAutoFilling || !jobUrl.trim()}
                                        className="h-10 shrink-0 gap-2 rounded-md px-4"
                                    >
                                        {isAutoFilling ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-4 w-4" />
                                        )}
                                        Auto-fill
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="jobTitle" className="text-sm font-medium text-foreground">
                                        Job Title
                                    </label>
                                    <Input
                                        id="jobTitle"
                                        type="text"
                                        placeholder="e.g. Senior Frontend Developer"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        className="h-10 w-full rounded-md"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="company" className="text-sm font-medium text-foreground">
                                        Company Name
                                    </label>
                                    <Input
                                        id="company"
                                        type="text"
                                        placeholder="e.g. Acme Corp"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="h-10 w-full rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="logoUrl" className="text-sm font-medium text-foreground">
                                    Company Logo URL
                                    <span className="text-muted-foreground font-normal ml-1.5">
                                        (Optional)
                                    </span>
                                </label>
                                <Input
                                    id="logoUrl"
                                    type="url"
                                    placeholder="https://example.com/logo.png"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    className="h-10 w-full rounded-md"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="description" className="text-sm font-medium text-foreground">
                                    Job Description
                                </label>
                                <Textarea
                                    id="description"
                                    placeholder="Paste the full job description requirements here..."
                                    rows={12}
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className="min-h-[250px] resize-y rounded-md"
                                />
                            </div>

                            <div className="mt-2 flex flex-col items-center gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={isSubmitDisabled}
                                    className={cn(
                                        "w-full rounded-full py-6 text-base font-medium",
                                        "transition-all duration-200"
                                    )}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Saving Job...
                                        </>
                                    ) : (
                                        "Save Job & Continue"
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    After saving, you can compare this job with any of your uploaded resumes.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Features Sidebar */}
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            How it works
                        </h3>
                        <div className="flex flex-col gap-6">
                            {features.map((feature, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
                                        <feature.icon className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-sm font-medium text-foreground">
                                            {feature.title}
                                        </h4>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddJobPage;