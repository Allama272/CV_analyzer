import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { formatWeekLabel } from "@/lib/analytics-mappers";
import { CHART_TOOLTIP_STYLE, CHART_TOOLTIP_LABEL_STYLE, CHART_CURSOR_FILL } from "@/lib/chart-theme";
import type { WeekBucketDto } from "@/types";

export function JobsOverTimeChart({ data }: { data: WeekBucketDto[] }) {
    const chartData = data.map((bucket) => ({ weekLabel: formatWeekLabel(bucket.weekStart), count: bucket.count }));

    return (
        <ChartCard title="Jobs Added Per Week" subtitle="Based on when each job was added to your tracker (last 8 weeks)">
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={{ color: "var(--popover-foreground)" }} cursor={{ fill: CHART_CURSOR_FILL, opacity: 0.5 }} />
                    <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}