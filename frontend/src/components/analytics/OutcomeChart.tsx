import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { STATUS_CHART_COLOR } from "@/lib/job-status";
import { CHART_TOOLTIP_STYLE, CHART_TOOLTIP_LABEL_STYLE, CHART_CURSOR_FILL } from "@/lib/chart-theme";
import { JobStatus } from "@/types";
import type { OutcomesDto } from "@/types";

export function OutcomeChart({ data }: { data: OutcomesDto }) {
    const chartData = [
        { label: "Offered", count: data.offered, color: STATUS_CHART_COLOR[JobStatus.Offered] },
        { label: "Rejected", count: data.rejected, color: STATUS_CHART_COLOR[JobStatus.Rejected] },
    ];

    return (
        <ChartCard title="Decided Outcomes" subtitle="Offers vs. rejections among decided applications">
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={80} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={{ color: "var(--popover-foreground)" }} cursor={{ fill: CHART_CURSOR_FILL, opacity: 0.5 }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry) => (
                            <Cell key={entry.label} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}