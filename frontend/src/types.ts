export interface IResume {
    resumeId: number,
    resumeTitle: string,
    resumeThumbnailUrl: string,
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

