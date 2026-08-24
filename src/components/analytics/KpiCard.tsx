import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

export type KpiBreakdownRow = {
  name: string;
  count: number;
};

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: { value: number; positive: boolean };
  hint?: string;
  breakdown?: KpiBreakdownRow[];
  breakdownTitle?: string;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  breakdown,
  breakdownTitle,
}: KpiCardProps) {
  const card = (
    <Card
      className={`shadow-[var(--shadow-card)] ${breakdown ? "transition-colors hover:border-primary/30" : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {delta && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium ${
                delta.positive
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {delta.positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta.value)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );

  if (!breakdown) return card;

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <div className="cursor-default">{card}</div>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-72 p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">
          {breakdownTitle ?? "İşletme katkısı"}
        </div>
        {breakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bu dönemde katkı yok.</p>
        ) : (
          <ul className="max-h-64 space-y-1.5 overflow-auto">
            {breakdown.map((row) => (
              <li key={row.name} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">{row.name}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {row.count.toLocaleString("tr-TR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
