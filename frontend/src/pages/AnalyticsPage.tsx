import { useMemo, useState } from "react";
import { Award, Briefcase, CalendarPlus, Target, TrendingUp } from "lucide-react";
import { useAnalyticsSummary } from "@/hooks/useAnalyticsSummary";
import { StatCard } from "@/components/analytics/StatCard";
import { StatusBreakdownChart } from "@/components/analytics/StatusBreakdownChart";
import { OutcomeChart } from "@/components/analytics/OutcomeChart";
import { JobsOverTimeChart } from "@/components/analytics/JobsOverTimeChart";
import { MatchScoreHistogram } from "@/components/analytics/MatchScoreHistogram";
import { mapStatusBreakdown, mapScoreHistogram } from "@/lib/analytics-mappers";
import { cn } from "@/lib/utils";

function AnalyticsPage() {
    const { summary, isLoading } = useAnalyticsSummary();
    const [includeArchived, setIncludeArchived] = useState(false);

    const scope = useMemo(() => {
        if (!summary) return null;
        return includeArchived ? summary.includingArchived : summary.activeOnly;
    }, [summary, includeArchived]);

    if (isLoading || !scope) {
        return (
            <div className="flex h-40 items-center justify-center px-6 py-8">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
                <p className="ml-4 text-muted-foreground">Loading analytics...</p>
            </div>
        );
    }

    if (scope.kpis.totalJobs === 0) {
        return (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                <h3 className="text-xl font-semibold text-foreground">No data yet</h3>
                <p className="max-w-sm text-muted-foreground">
                    Add and update some jobs to start seeing your stats here.
                </p>
            </div>
        );
    }

    const { kpis } = scope;
    const statusBreakdown = mapStatusBreakdown(scope.statusBreakdown);
    const scoreHistogram = mapScoreHistogram(scope.scoreHistogram);

    return (
        <div className="px-6 py-8 pb-12">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                <button
                    onClick={() => setIncludeArchived((v) => !v)}
                    className={cn(
                        "rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors",
                        includeArchived
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-muted-foreground hover:bg-accent"
                    )}
                >
                    {includeArchived ? "Including archived" : "Active jobs only"}
                </button>
            </div>

            <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
                Rates below are estimated from each job&apos;s current status, since status-change history
                isn&apos;t tracked yet — treat them as a directional signal, not exact conversion metrics.
            </p>

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
                <StatCard label="Total Jobs" value={String(kpis.totalJobs)} icon={Briefcase} />
                <StatCard label="Added This Week" value={String(kpis.addedThisWeek)} icon={CalendarPlus} />
                <StatCard
                    label="Interview Rate"
                    value={kpis.interviewRatePercent !== null ? `${kpis.interviewRatePercent.toFixed(0)}%` : "—"}
                    icon={TrendingUp}
                    hint="Of jobs you applied to"
                />
                <StatCard
                    label="Offer Rate"
                    value={kpis.offerRatePercent !== null ? `${kpis.offerRatePercent.toFixed(0)}%` : "—"}
                    icon={Award}
                    hint="Of decided applications"
                />
                <StatCard
                    label="Avg. Match Score"
                    value={kpis.averageMatchScore !== null ? `${kpis.averageMatchScore.toFixed(0)}%` : "—"}
                    icon={Target}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <StatusBreakdownChart data={statusBreakdown} />
                <OutcomeChart data={scope.outcomes} />
                <div className="lg:col-span-2">
                    <JobsOverTimeChart data={scope.jobsOverTime} />
                </div>
                <div className="lg:col-span-2">
                    <MatchScoreHistogram data={scoreHistogram} />
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;