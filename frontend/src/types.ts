export interface IResume {
    cvId: number,
    cvTitle: string,
    cvImageUrl: string,
    cvScore: number,
    cvUploadDate: string
}

export interface IResumeData {
    resumes: IResume[]
}

export interface ResumeFeedback {
    overallScore: number;
    cvImageUrl: string;
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
