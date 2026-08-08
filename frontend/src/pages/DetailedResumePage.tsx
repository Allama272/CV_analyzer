import { useParams } from "react-router"
import { ProcessingStatus, type ResumeFeedback } from "@/types";
import { useEffect, useRef, useState } from "react";
import Summary from "@/components/Summary";
import ATS from "@/components/ATS";
import Details from "@/components/Details";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ScoreGauge from "@/components/ScoreGauge";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
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
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    throw new Error("Authentication error. Please log in again.");
                }

                // Fetching from the single resume endpoint
                const response = await fetch(`${RESUME_ENDPOINT}${resumeId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch resume status: ${response.statusText}`);
                }

                const result = await response.json() as ResumeFeedback;
                setResumeData(result);

                // --- Polling Logic ---
                // If the status is still pending or processing, schedule the next poll.
                if (result.status === ProcessingStatus.Pending || result.status === ProcessingStatus.Processing) {
                    pollingTimer.current = window.setTimeout(pollResumeStatus, 3000); // Poll again after 3 seconds
                } else {
                    // If completed or failed, we stop polling.
                    if (pollingTimer.current) {
                        clearTimeout(pollingTimer.current);
                    }
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
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
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <DotLottieReact src="/images/loadingRobot.lottie" className="w-92 mx-auto" loop autoplay />
                    <p className="mt-4 text-lg">Fetching your resume analysis...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Resume</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // No data state
    if (!resumeData) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Resume Not Found</h2>
                    <p className="text-gray-600">The requested resume could not be found.</p>
                </div>
            </div>
        );
    }

    switch (resumeData.status) {
        case ProcessingStatus.Pending:
        case ProcessingStatus.Processing:
            return (
                <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                    <div className="text-center">
                        <DotLottieReact src="/images/loadingRobot.lottie" className="w-92 mx-auto" loop autoplay />
                        <h3 className="text-2xl font-bold mt-4">Analyzing Your Resume... 🤖</h3>
                        <p className="mt-2 text-gray-600">Our AI is working its magic. This may take a moment.</p>
                    </div>
                </div>
            );

        case ProcessingStatus.Failed:
            return (
                <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Analysis Failed</h2>
                        <p className="text-gray-600 mb-4">{error || "An unknown error occurred during analysis."}</p>
                    </div>
                </div>
            );

        case ProcessingStatus.Completed:
            return (
                <div>
                    <div className="flex flex-row w-full max-lg:flex-col-reverse">
                        <section className="sticky top-4 h-[calc(100vh-4rem)] w-1/2 max-lg:w-full flex items-center justify-center bg-[url('/images/bg-small.svg')] bg-cover px-8 py-8">
                            {resumeData.resumeImageUrl ? (
                                <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-full max-h-full w-auto max-w-full p-2">
                                    <a
                                        href={`${storageLocation}/preview/${resumeData.resumeImageUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <img
                                            src={`${storageLocation}/preview/${resumeData.resumeImageUrl}`}
                                            alt="Resume preview"
                                            className="h-full w-full object-contain rounded-2xl"
                                            title="Click to view full size"
                                            onError={(e) => {
                                                console.error('Failed to load resume image');
                                                e.currentTarget.src = '/images/placeholder-resume.png';
                                            }}
                                        />
                                    </a>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No preview available</p>
                                </div>
                            )}
                        </section>

                        <section className="feedback-section">
                            <h2 className="text-4xl text-primary font-bold">Resume Review</h2>
                            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                                <Summary feedback={resumeData} />
                                <ATS
                                    score={resumeData.ats?.score || 0}
                                    suggestions={resumeData.ats?.tips || []}
                                />
                                <Details feedback={resumeData} />
                            </div>
                        </section>
                    </div>

                    <Separator className="my-4 mx-4" />

                    <h1 className="text-5xl sm:text-6xl mx-auto text-center pt-10 pb-4 px-5">Jobs Analyzed</h1>
                    <div className="flex flex-col md:flex-row flex-wrap content-center justify-start gap-4 py-10 mx-auto px-5">
                        <Card className="w-52 h-64">
                            <CardHeader>
                                <CardTitle className="w-full text-center text-xl overflow-hidden overflow-ellipsis">
                                    AI Engineer
                                </CardTitle>
                                <CardDescription className="w-full text-center overflow-hidden overflow-ellipsis">
                                    Gamma Pegassi TB
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScoreGauge score={82} />
                            </CardContent>
                            <CardFooter>
                                <CardDescription className="w-full text-center">
                                    2024-05-15
                                </CardDescription>
                            </CardFooter>
                        </Card>

                        {/* Add a new job */}
                        <Card className="w-52 h-64 flex justify-center items-center hover:cursor-pointer hover:shadow-xl hover:shadow-border transition-shadow">
                            <button
                                className="text-7xl text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => {
                                    // TODO: Implement add job functionality
                                    toast.info("Add job functionality coming soon!");
                                }}
                                aria-label="Add new job analysis"
                            >
                                +
                            </button>
                        </Card>
                    </div>
                </div>
            );

        default:
            return (
                <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                    <p>Unknown resume status.</p>
                </div>
            );
    }
}

export default DetailedResumePage;