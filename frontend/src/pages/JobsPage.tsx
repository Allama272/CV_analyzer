import { JobResumePreviewCard } from "@/components/JobResumePreviewCard";

// Mock job and resume analysis data (user's own resumes)
const jobs = [
    {
        jobId: 1,
        title: "Frontend Developer",
        company: "TechCorp",
        resumes: [
            {
                resumeId: 101,
                resumeTitle: "Modern React Resume",
                resumeThumbnailUrl: "https://placehold.co/80x100?text=React",
                feedback: { overallMatchScore: 88 }, analysisId: 2,
            },
            {
                resumeId: 102,
                resumeTitle: "General Software Engineer CV",
                resumeThumbnailUrl: "https://placehold.co/80x100?text=SE",
                feedback: { overallMatchScore: 72 }, analysisId: 2,
            },
            {
                resumeId: 102,
                resumeTitle: "General Software Engineer CV",
                resumeThumbnailUrl: "https://placehold.co/80x100?text=SE",
                feedback: { overallMatchScore: 72 }, analysisId: 2,
            },
        ],
    },
    {
        jobId: 2,
        title: "Backend Engineer",
        company: "DataWorks",
        resumes: [
            {
                resumeId: 103,
                resumeTitle: "Node.js Backend Resume",
                resumeThumbnailUrl: "https://placehold.co/80x100?text=Node",
                feedback: { overallMatchScore: 91 }, analysisId: 2,
            }, {
                resumeId: 102,
                resumeTitle: "General Software Engineer CV",
                resumeThumbnailUrl: "https://placehold.co/80x100?text=SE",
                feedback: { overallMatchScore: 72 },
                analsisId: 2,
            },
            {
                resumeId: 102,
                resumeTitle: "General Software Engineer CV",
                resumeThumbnailUrl: "https://placehold.co/80x100?text=SE",
                feedback: { overallMatchScore: 80 }, analysisId: 2,
            },
        ],
    },
];

function JobsPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Job Analysis Preview</h1>
            <div className="grid gap-6 md:grid-cols-2">
                {jobs.map((job) => (
                    <JobResumePreviewCard key={job.jobId} job={job} />
                ))}
            </div>
        </div>
    );
}

export default JobsPage;