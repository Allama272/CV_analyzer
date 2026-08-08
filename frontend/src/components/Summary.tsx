import ScoreGauge from "./ScoreGauge";
import ScoreBadge from "./ScoreBadge";
import type { ResumeFeedback } from "@/types";
import { getScoreTier, SCORE_TIER_STYLES } from "@/lib/score";
import { cn } from "@/lib/utils";
const Category = ({ title, score }: { title: string; score: number }) => {
    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row items-center justify-center gap-2">
                    <p className="text-2xl">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className={cn("text-2xl text-foreground", SCORE_TIER_STYLES[getScoreTier(score)].text)}>
                    {score}
                    <span className="text-muted-foreground"> /100</span >
                </p>
            </div>
        </div >
    );
};

const Summary = ({ feedback }: { feedback: ResumeFeedback }) => {
    return (
        <div className="w-full rounded-2xl bg-card shadow-md">
            <div className="flex flex-row items-center gap-8 p-4">
                <ScoreGauge score={feedback.overallScore} />
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-foreground">Your Resume Score</h2>
                    <p className="text-sm text-muted-foreground">
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>
            <Category title="Formatting" score={feedback.formatting.score} />
            <Category title="Content Quality" score={feedback.contentQuality.score} />
            <Category title="Structure" score={feedback.structure.score} />
            <Category title="Skills Coverage" score={feedback.skillsCoverage.score} />
        </div>
    );
};

export default Summary;