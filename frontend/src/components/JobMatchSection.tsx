import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import ScoreBadge from "./ScoreBadge";
import type { JobFeedbackTip } from "@/types";

export const JobMatchHeader = ({
    title,
    score,
}: {
    title: string;
    score: number;
}) => {
    return (
        <div className="flex flex-row items-center gap-4 py-2">
            <p className="text-2xl font-semibold">{title}</p>
            <ScoreBadge score={score} />
        </div>
    );
};

const ChipList = ({
    label,
    items,
    variant,
}: {
    label: string;
    items: string[];
    variant: "good" | "improve";
}) => {
    if (items.length === 0) return null;
    const Icon = variant === "good" ? CheckCircle2 : AlertTriangle;

    return (
        <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">{label}</p>
            <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                    <span
                        key={i}
                        className={cn(
                            "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
                            variant === "good"
                                ? "border-good-border bg-good-bg text-good-text"
                                : "border-improve-border bg-improve-bg text-improve-text"
                        )}
                    >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
};

export const JobMatchContent = ({
    matchedLabel,
    matchedItems,
    missingLabel,
    missingItems,
    tips,
}: {
    matchedLabel: string;
    matchedItems: string[];
    missingLabel: string;
    missingItems: string[];
    tips: JobFeedbackTip[];
}) => {
    return (
        <div className="flex w-full flex-col gap-5">
            {(matchedItems.length > 0 || missingItems.length > 0) && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <ChipList label={matchedLabel} items={matchedItems} variant="good" />
                    <ChipList label={missingLabel} items={missingItems} variant="improve" />
                </div>
            )}

            {tips.length > 0 && (
                <div className="flex flex-col gap-3">
                    {tips.map((tip, index) => {
                        const isGood = tip.type === "Good";
                        const Icon = isGood ? CheckCircle2 : AlertTriangle;
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-start gap-3 rounded-2xl border p-4",
                                    isGood
                                        ? "border-good-border bg-good-bg text-good-text"
                                        : "border-improve-border bg-improve-bg text-improve-text"
                                )}
                            >
                                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                                <p className="text-sm">{tip.explanation}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {matchedItems.length === 0 && missingItems.length === 0 && tips.length === 0 && (
                <p className="text-sm text-muted-foreground">No details available for this category.</p>
            )}
        </div>
    );
};