import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Link } from "react-router";

interface Resume {
    resumeId: number;
    resumeTitle: string;
    resumeThumbnailUrl: string;
    feedback: { overallMatchScore: number };
    analysisId: number;
}

interface Job {
    jobId: number;
    title: string;
    company: string;
    resumes: Resume[];
}

export function JobResumePreviewCard({ job }: { job: Job }) {
    const [open, setOpen] = useState(false);
    // Sort resumes by score descending
    const sortedResumes = [...job.resumes].sort((a, b) => b.feedback.overallMatchScore - a.feedback.overallMatchScore);
    const bestResume = sortedResumes[0];
    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {job.title}
                    <Badge variant="secondary">{job.company}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">
                    {job.resumes.length} of your resumes analyzed for this job
                </div>
                <div className="flex flex-col gap-2">
                    {sortedResumes.slice(0, 2).map((resume) => (
                        <Link to={`/job-analyzed/${resume.analysisId}`}>
                            <div
                                key={resume.resumeId}
                                className={`flex items-center gap-3 justify-between rounded px-2 py-2 
                                ${resume === bestResume ? "bg-green-success hover:brightness-90" : "hover:bg-accent"}
                                 hover:cursor-pointer transition-all duration-300 ease-in-out
                                 `}
                            >
                                <img src={resume.resumeThumbnailUrl} alt={resume.resumeTitle} className="w-10 h-12 object-cover rounded border" />
                                <span className="font-medium flex-1">{resume.resumeTitle}</span>
                                <span className="text-sm">Score: {resume.feedback.overallMatchScore}/100</span>
                                {resume === bestResume && (
                                    <Badge variant="secondary">Best Match</Badge>
                                )}
                            </div></Link>
                    ))}
                    {sortedResumes.length > 2 && (
                        <div className="flex flex-col items-center">
                            <Button variant="outline" size="sm" className="mt-1 flex items-center gap-1 " onClick={() => setOpen(true)}>
                                View all resumes <ChevronDown className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
                {/* Dialog for viewing all resumes */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>All resumes analyzed for {job.title}</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 mt-2">
                            {sortedResumes.map((resume) => (
                                <div
                                    key={resume.resumeId}
                                    className={`flex items-center gap-3 justify-between rounded px-2 py-2
                                        ${resume === bestResume ? "bg-green-success hover:brightness-90" : "hover:bg-accent"} 
                                        hover:cursor-pointer transition-all duration-300 ease-in-out
                                     `}
                                >
                                    <img src={resume.resumeThumbnailUrl} alt={resume.resumeTitle} className="w-10 h-12 object-cover rounded border" />
                                    <span className="font-medium flex-1">{resume.resumeTitle}</span>
                                    <span className="text-sm">Score: {resume.feedback.overallMatchScore}/100</span>
                                    {resume === bestResume && (
                                        <Badge variant="secondary">Best Match</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                        <DialogClose asChild>
                            <Button variant="outline" className="mt-4 w-full">Close</Button>
                        </DialogClose>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
