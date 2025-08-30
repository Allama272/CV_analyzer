import ScoreGauge from "./ScoreGauge"
import ScoreBadge from './ScoreBadge';
import type { ResumeFeedback } from "@/types";


const Category = ({ title, score }: { title: string, score: number }) => {
    const textColor = score > 70 ? 'text-green-600'
        : score > 49 ? 'text-yellow-600'
            : 'text-red-600';
    return (
        <div className='resume-summary'>
            <div className='category'>
                <div className='flex flex-row gap-2 items-center justify-center'>
                    <p className='text-2xl'>{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className='text-2xl'>
                    <span className={textColor}>{score}</span>/100
                </p>

            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: ResumeFeedback }) => {
    return (
        <div className='bg-card rounded-2xl shadow-md w-full'>
            <div className='flex flex-row items-center p-4 gap-8'>
                <ScoreGauge score={feedback.overallScore} />
                <div className='flex flex-col gap-2'>
                    <h2 className='text-2xl font-bold'>Your Resume Score</h2>
                    <p className='text-sm text-gray-500'>
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>
            <Category title="Formatting" score={feedback.formatting.score} />
            <Category title="Content Quality" score={feedback.contentQuality.score} />
            <Category title="Structure" score={feedback.structure.score} />
            <Category title="Skills Coverage" score={feedback.skillsCoverage.score} />

        </div>
    )
}

export default Summary