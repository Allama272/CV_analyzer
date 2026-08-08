import { useState } from "react";
import { Link, useNavigate } from "react-router"; 
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Search, 
  Target, 
  Sparkles,
  Loader2,
  FileText,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabaseClient";
import { cn } from "@/lib/utils";

import FileUploader from "@/components/FileUploader"; 

const apiUrl = import.meta.env.VITE_DEV_SERVER;

function UploadResume() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [resumeTitle, setResumeTitle] = useState<string>("");

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (resumeTitle.trim().length < 5) {
            toast.error("Please enter a resume title (at least 5 characters).");
            return;
        }

        if (!file) {
            toast.error("Please choose a resume file to upload.");
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

            const formData = new FormData();
            formData.append('title', resumeTitle.trim());
            formData.append('file', file);

            const response = await fetch(`${apiUrl}/api/resume/upload-resume`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: formData
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errorMessage = responseData.message || `An error occurred: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            
            const resumeId = responseData.resumeId;
            toast.success("Resume uploaded successfully!");
            navigate(`/resume/${resumeId}`); 
            
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
            icon: Search,
            title: "Smart Analysis",
            description: "AI-powered parsing of your resume content and formatting."
        },
        {
            icon: Target,
            title: "Skills Matching",
            description: "Identify gaps and strengths in your skillset against target roles."
        },
        {
            icon: Sparkles,
            title: "Instant Feedback",
            description: "Get actionable insights and improvement suggestions in seconds."
        }
    ];

    const isSubmitDisabled = !file || isLoading || resumeTitle.trim().length < 5;

    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            <Link
                to="/resumes" // Assuming you have a resume list page. Adjust if needed!
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Resumes
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Upload a Resume
                </h1>
                <p className="mt-2 text-base text-muted-foreground">
                    Add your resume to get instant, actionable feedback to improve your job prospects.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
                {/* Left Column: Form Card */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">
                                    Resume Details
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Provide a recognizable title and upload your document.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="resumeTitle" className="text-sm font-medium text-foreground">
                                    Resume Title
                                </label>
                                <Input 
                                    id="resumeTitle"
                                    type="text" 
                                    placeholder="e.g. Senior Frontend Dev - 2024" 
                                    value={resumeTitle}
                                    onChange={(e) => setResumeTitle(e.target.value)}
                                    className="h-10 w-full rounded-md"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-foreground">
                                    Document Upload
                                </label>
                                <div className="rounded-lg border border-border bg-muted/20 p-2">
                                    <FileUploader onFileSelect={handleFileSelect} />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col items-center gap-3 pt-2 border-t border-border">
                                <Button
                                    type="submit"
                                    disabled={isSubmitDisabled}
                                    className={cn(
                                        "w-full rounded-full py-6 mt-4 text-base font-medium",
                                        "transition-all duration-200"
                                    )}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Analyzing Resume...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-5 w-5" />
                                            Upload & Analyze
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Your resume data is processed securely and kept private.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Features Sidebar */}
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Analysis Features
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

export default UploadResume;