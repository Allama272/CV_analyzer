import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "./ChartCard";
import { CHART_TOOLTIP_STYLE, CHART_TOOLTIP_LABEL_STYLE, CHART_LEGEND_STYLE } from "@/lib/chart-theme";
import type { StatusBreakdownItem } from "@/lib/analytics-mappers";

export function StatusBreakdownChart({ data }: { data: StatusBreakdownItem[] }) {
    return (
        <ChartCard title="Current Status Breakdown" subtitle="Snapshot of where every job stands right now">
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie data={data} dataKey="count" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={2}>
                        {data.map((entry) => (
                            <Cell key={entry.status} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={{ color: "var(--popover-foreground)" }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={CHART_LEGEND_STYLE} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}