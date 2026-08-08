import { cn } from "@/lib/utils";
import { getScoreTier, SCORE_TIER_STYLES, SCORE_TIER_ICONS } from "@/lib/score";

const ScoreBadge = ({ score }: { score: number }) => {
  const tier = getScoreTier(score);
  const styles = SCORE_TIER_STYLES[tier];
  const Icon = SCORE_TIER_ICONS[tier];

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-1 rounded-full border px-2 py-0.5",
        styles.bg,
        styles.border
      )}
    >
      <Icon className={cn("size-4", styles.text)} />
      <p className={cn("text-sm font-medium", styles.text)}>{score}/100</p>
    </div>
  );
};

export default ScoreBadge;