export interface IResume {
    resumeId: number,
    resumeTitle: string,
    resumeThumbnailUrl: string,
    resumePdfUrl: string,
    resumeOverallScore: number,
    resumeUploadDate: string
}


export const ProcessingStatus = {
    Pending: 0,      // Job is queued, waiting to be processed
    Processing: 1,   // The AI is actively analyzing the resume
    Completed: 2,    // Analysis is done and results are available
    Failed: 3        // An error occurred during processing
}
type ProcessingStatus = typeof ProcessingStatus[keyof typeof ProcessingStatus];
export interface ResumeFeedback {
    status: ProcessingStatus;
    overallScore: number;
    resumeImageUrl: string;
    ats: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
        }[];
    };
    formatting: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    contentQuality: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    structure: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    skillsCoverage: {
        score: number;
        detectedSkills: string[];
        missingCommonSkills: string[];
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
}

export interface ResumeJobFeedback {
    overallMatchScore: number; // 0–100, how well resume fits the job
    cvImageUrl: string;
    keywordMatch: {
        matched: string[];
        missing: string[];
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    skillsMatch: {
        matchedSkills: string[];
        missingSkills: string[];
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    experienceAlignment: {
        score: number;
        matchedExperience: string[];
        gaps: string[];
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    educationAlignment: {
        score: number;
        matched: string[];
        missing: string[];
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    atsCompatibility: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
        }[];
    };
}
export const JobStatus = {
    Saved: 0,
    Applied: 1,
    Interviewing: 2,
    Offered: 3,
    Rejected: 4,
    Archived: 5
} as const;
export type JobStatusType = typeof JobStatus[keyof typeof JobStatus];

export interface JobFeedbacksMinimal {
    feedbackId: number,
    overAllMatchScore: number,
    resumeId: number,
    resumeTitle: string,
    resumeThumbnailUrl: string
}
export interface JobWithFeedbackPreview {
    jobId: number,
    company: string,
    jobTitle: string,
    status: JobStatusType,
    feedbacks: JobFeedbacksMinimal[]
}

export interface JobWithBestMatchPreview {
    jobId: number,
    company: string,
    jobTitle: string,
    logoUrl: string | null,
    status: JobStatusType,
    bestMatchScore: number | null, // null when no resumes have been analyzed yet
    resumeCount: number,           // how many resumes were analyzed — 0 if none
    createdAt: string
}

export interface JobDetail {
    jobId: number;
    company: string;
    jobTitle: string;
    jobDescription: string;
    logoUrl: string | null;
    status: JobStatusType;
    uploadDate: string;
    feedbacks: JobFeedbacksMinimal[];
}
export type JobTipType = "Good" | "Improve";

export interface JobFeedbackTip {
    type: JobTipType,
    explanation: string
}

export interface AtsFeedbackTip {
    type: JobTipType,
    tip: string
}

export interface JobMatchFeedback {
    matched: string[],
    missing: string[],
    score: number,
    tips: JobFeedbackTip[]
}

export interface JobSkillsMatchFeedback {
    matchedSkills: string[],
    missingSkills: string[],
    score: number,
    tips: JobFeedbackTip[]
}

export interface JobExperienceAlignmentFeedback {
    score: number,
    matchedExperience: string[],
    gaps: string[],
    tips: JobFeedbackTip[]
}

export interface JobAtsCompatibilityFeedback {
    score: number,
    tips: AtsFeedbackTip[]
}

export interface AnalyzedJobFeedback {
    overallScore: number,
    keywordMatch: JobMatchFeedback,
    skillsMatch: JobSkillsMatchFeedback,
    experienceAlignment: JobExperienceAlignmentFeedback,
    educationAlignment: JobMatchFeedback,
    atsCompatibility: JobAtsCompatibilityFeedback,
    status: ProcessingStatus, // reusing your existing enum
    resumeImageUrl: string
}
export interface ResumeJobMatch {
    feedbackId: number,
    jobId: number,
    jobTitle: string,
    company: string,
    overallMatchScore: number
}

export interface AutoFillJob {
    jobTitle: string,
    company: string,
    jobDescription: string,
    logoUrl: string
}
export interface ApiFail {
    message: string
}