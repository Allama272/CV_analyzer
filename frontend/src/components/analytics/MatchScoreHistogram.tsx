import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { CHART_TOOLTIP_STYLE, CHART_TOOLTIP_LABEL_STYLE, CHART_CURSOR_FILL } from "@/lib/chart-theme";
import type { ScoreBucketItem } from "@/lib/analytics-mappers";

export function MatchScoreHistogram({ data }: { data: ScoreBucketItem[] }) {
    return (
        <ChartCard title="Match Score Distribution" subtitle="How your saved jobs score against your resume">
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={{ color: "var(--popover-foreground)" }} cursor={{ fill: CHART_CURSOR_FILL, opacity: 0.5 }} />
                    <Bar dataKey="count" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}