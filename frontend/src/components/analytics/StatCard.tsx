import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    hint?: string;
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}