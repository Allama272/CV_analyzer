import type { ReactNode } from "react";

interface ChartCardProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}