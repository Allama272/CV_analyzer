import { cn } from "@/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordion";
import type { ResumeFeedback } from "@/types";

const ScoreBadge = ({ score }: { score: number }) => {
    return (
        <div
            className={cn(
                "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px]",
                score > 69
                    ? "bg-badge-green"
                    : score > 39
                        ? "bg-badge-yellow"
                        : "bg-badge-red"
            )}
        >
            <img
                src={score > 69 ? "/icons/check.svg" : "/icons/warning.svg"}
                alt="score"
                className="size-4"
            />
            <p
                className={cn(
                    "text-sm font-medium",
                    score > 69
                        ? "text-badge-green-text"
                        : score > 39
                            ? "text-badge-yellow-text"
                            : "text-badge-red-text"
                )}
            >
                {score}/100
            </p>
        </div>
    );
};

const CategoryHeader = ({
    title,
    categoryScore,
}: {
    title: string;
    categoryScore: number;
}) => {
    return (
        <div className="flex flex-row gap-4 items-center py-2">
            <p className="text-2xl font-semibold">{title}</p>
            <ScoreBadge score={categoryScore} />
        </div>
    );
};

const CategoryContent = ({
    tips,
}: {
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
    return (
        <div className="flex flex-col gap-4 items-center w-full">
            <div className="bg-muted w-full rounded-lg px-5 py-4 grid grid-cols-2 gap-4">
                {tips.map((tip, index) => (
                    <div className="flex flex-row gap-2 items-center" key={index}>
                        <img
                            src={
                                tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"
                            }
                            alt="score"
                            className="size-5"
                        />
                        <p className="text-xl ">{tip.tip}</p>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-4 w-full">
                {tips.map((tip, index) => (
                    <div
                        key={index + tip.tip}
                        className={cn(
                            "flex flex-col gap-2 rounded-2xl p-4",
                            tip.type === "good"
                                ? "bg-green-50 border border-green-200 text-green-700"
                                : "bg-yellow-50 border border-yellow-200 text-yellow-700"
                        )}
                    >
                        <div className="flex flex-row gap-2 items-center">
                            <img
                                src={
                                    tip.type === "good"
                                        ? "/icons/check.svg"
                                        : "/icons/warning.svg"
                                }
                                alt="score"
                                className="size-5"
                            />
                            <p className="text-xl font-semibold">{tip.tip}</p>
                        </div>
                        <p>{tip.explanation}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Details = ({ feedback }: { feedback: ResumeFeedback }) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <Accordion>
                {/* formating */}
                <AccordionItem id="formatting">
                    <AccordionHeader itemId="formatting">
                        <CategoryHeader
                            title="Formating"
                            categoryScore={feedback.formatting.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="formatting">
                        <CategoryContent tips={feedback.formatting.tips} />
                    </AccordionContent>
                </AccordionItem>

                {/* content */}
                <AccordionItem id="content">
                    <AccordionHeader itemId="content">
                        <CategoryHeader
                            title="Content Quality"
                            categoryScore={feedback.contentQuality.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="content">
                        <CategoryContent tips={feedback.contentQuality.tips} />
                    </AccordionContent>
                </AccordionItem>

                {/* structure */}
                <AccordionItem id="structure">
                    <AccordionHeader itemId="structure">
                        <CategoryHeader
                            title="Structure"
                            categoryScore={feedback.structure.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="structure">
                        <CategoryContent tips={feedback.structure.tips} />
                    </AccordionContent>
                </AccordionItem>

                {/* skills */}
                <AccordionItem id="skills">
                    <AccordionHeader itemId="skills">
                        <CategoryHeader
                            title="Skills Coverage"
                            categoryScore={feedback.skillsCoverage.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="skills">
                        <CategoryContent tips={feedback.skillsCoverage.tips} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default Details;