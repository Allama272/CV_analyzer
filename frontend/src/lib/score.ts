import { CheckCircle2, AlertTriangle, XCircle, type LucideIcon } from "lucide-react";

export type ScoreTier = "good" | "improve" | "warning" | "error";

export function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return "good";
  if (score >= 65) return "improve";
  if (score >= 50) return "warning";
  return "error";
}

export const SCORE_TIER_LABEL: Record<ScoreTier, string> = {
  good: "Great job!",
  improve: "Good start",
  warning: "Needs some work",
  error: "Needs improvement",
};

export const SCORE_TIER_STYLES: Record<
  ScoreTier,
  { bg: string; text: string; border: string }
> = {
  good: {
    bg: "bg-[var(--badge-green-bg)]",
    text: "text-[var(--badge-green-text)]",
    border: "border-[var(--badge-green-border)]",
  },
  improve: {
    bg: "bg-[var(--improve-bg)]",
    text: "text-[var(--improve-text)]",
    border: "border-[var(--improve-border)]",
  },
  warning: {
    bg: "bg-[var(--badge-yellow-bg)]",
    text: "text-[var(--badge-yellow-text)]",
    border: "border-[var(--badge-yellow-border)]",
  },
  error: {
    bg: "bg-[var(--badge-red-bg)]",
    text: "text-[var(--badge-red-text)]",
    border: "border-[var(--badge-red-border)]",
  },
};

// lucide icons instead of static SVG assets — these inherit currentColor,
// so paired with `styles.text` above they're guaranteed to match/contrast
// correctly no matter which tier renders.
export const SCORE_TIER_ICONS: Record<ScoreTier, LucideIcon> = {
  good: CheckCircle2,
  improve: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};