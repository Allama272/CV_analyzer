import { cn } from "@/lib/utils";
import { getScoreTier, SCORE_TIER_STYLES, SCORE_TIER_ICONS, SCORE_TIER_LABEL } from "@/lib/score";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}
interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const TIP_ICONS = { good: CheckCircle2, improve: AlertTriangle } as const;

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const tier = getScoreTier(score);
  const styles = SCORE_TIER_STYLES[tier];
  const Icon = SCORE_TIER_ICONS[tier];

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-md shadow-border">
      {/* Top section with icon and headline — colored icon in a neutral card, not a colored full-bleed panel */}
      <div className="mb-6 flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border",
            styles.bg,
            styles.border
          )}
        >
          <Icon className={cn("h-6 w-6", styles.text)} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">ATS Score — {score}/100</h2>
          <p className={cn("text-sm font-medium", styles.text)}>{SCORE_TIER_LABEL[tier]}</p>
        </div>
      </div>

      {/* Description section */}
      <div className="mb-6">
        <p className="mb-4 text-foreground">
          This score represents how well your resume is likely to perform in Applicant
          Tracking Systems used by employers.
        </p>

        {/* Suggestions list — each tip gets its own pastel/border chip instead of
            colored text sitting on a same-hue background, so it stays readable
            regardless of tier. */}
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => {
            const TipIcon = TIP_ICONS[suggestion.type];
            const isGood = suggestion.type === "good";
            return (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3",
                  isGood
                    ? "border-good-border bg-good-bg text-good-text"
                    : "border-improve-border bg-improve-bg text-improve-text"
                )}
              >
                <TipIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-sm">{suggestion.tip}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Closing encouragement */}
      <p className="text-sm italic text-muted-foreground">
        Keep refining your resume to improve your chances of getting past ATS filters and
        into the hands of recruiters.
      </p>
    </div>
  );
};

export default ATS;