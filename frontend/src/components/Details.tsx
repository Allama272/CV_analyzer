import { cn } from "@/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordion";
import ScoreBadge from "./ScoreBadge";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { ResumeFeedback } from "@/types";

const TIP_ICONS = { good: CheckCircle2, improve: AlertTriangle } as const;

const CategoryHeader = ({
    title,
    categoryScore,
}: {
    title: string;
    categoryScore: number;
}) => {
    return (
        <div className="flex flex-row items-center gap-4 py-2">
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
        <div className="flex w-full flex-col items-center gap-4">
            <div className="grid w-full grid-cols-2 gap-4 rounded-lg bg-muted px-5 py-4">
                {tips.map((tip, index) => {
                    const Icon = TIP_ICONS[tip.type];
                    return (
                        <div className="flex flex-row items-center gap-2" key={index}>
                            <Icon
                                className={cn(
                                    "size-5 shrink-0",
                                    tip.type === "good"
                                        ? "text-[var(--good-text)]"
                                        : "text-[var(--improve-text)]"
                                )}
                            />
                            <p className="text-sm">{tip.tip}</p>
                        </div>
                    );
                })}
            </div>
            <div className="flex w-full flex-col gap-4">
                {tips.map((tip, index) => {
                    const Icon = TIP_ICONS[tip.type];
                    return (
                        <div
                            key={index + tip.tip}
                            className={cn(
                                "flex flex-col gap-2 rounded-2xl p-4",
                                tip.type === "good"
                                    ? "border border-good-border bg-good-bg text-good-text"
                                    : "border border-improve-border bg-improve-bg text-improve-text"
                            )}
                        >
                            <div className="flex flex-row items-center gap-2">
                                <Icon className="size-5 shrink-0" />
                                <p className="text-sm font-semibold">{tip.tip}</p>
                            </div>
                            <p>{tip.explanation}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Details = ({ feedback }: { feedback: ResumeFeedback }) => {
    return (
        <div className="flex w-full flex-col gap-4">
            <Accordion>
                {/* formatting */}
                <AccordionItem id="formatting">
                    <AccordionHeader itemId="formatting">
                        <CategoryHeader
                            title="Formatting"
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