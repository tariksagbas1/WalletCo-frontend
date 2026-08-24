import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KpiCard, type KpiBreakdownRow } from "@/components/analytics/KpiCard";
import { PeriodFilter } from "@/components/platform/PeriodFilter";
import { usePlatformRange, type PlatformKpi } from "@/pages/platform/range";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Store, Stamp, CreditCard, Gift } from "lucide-react";

type Breakdowns = {
  stamps: KpiBreakdownRow[];
  cards: KpiBreakdownRow[];
  rewards: KpiBreakdownRow[];
};

function normalizeRows(raw: unknown): KpiBreakdownRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r: any) => ({
      name: String(r.name ?? "İşletme"),
      count: Number(r.count ?? 0),
    }))
    .filter((r) => r.count > 0);
}

export default function PlatformDashboard() {
  const range = usePlatformRange();
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<PlatformKpi | null>(null);
  const [breakdowns, setBreakdowns] = useState<Breakdowns>({ stamps: [], cards: [], rewards: [] });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const since = range.since.toISOString();
      const until = range.until.toISOString();
      const [kpiRes, breakdownRes] = await Promise.all([
        (supabase as any).rpc("platform_kpi_counts", {
          _since: since,
          _merchant_id: null,
          _until: until,
        }),
        (supabase as any).rpc("platform_kpi_breakdowns", {
          _since: since,
          _until: until,
        }),
      ]);
      if (cancelled) return;
      if (kpiRes.error) {
        setError(kpiRes.error.message);
        setKpi(null);
        setBreakdowns({ stamps: [], cards: [], rewards: [] });
      } else {
        setError(null);
        setKpi(kpiRes.data as PlatformKpi);
        const b = breakdownRes.data ?? {};
        setBreakdowns({
          stamps: normalizeRows(b.stamps),
          cards: normalizeRows(b.cards),
          rewards: normalizeRows(b.rewards),
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [range.since, range.until]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Genel bakış</h1>
          <p className="text-sm text-muted-foreground">
            Platform genelindeki hareketler — {range.label.toLowerCase()}.
          </p>
        </div>
        <PeriodFilter
          value={{
            from: range.from,
            to: range.to,
            label: range.label,
            presetId: range.presetId,
            granularity: range.granularity,
          }}
          onChange={range.setValue}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="İşletme"
            value={(kpi?.merchants ?? 0).toLocaleString("tr-TR")}
            icon={Store}
            hint="Toplam kayıtlı işletme"
          />
          <KpiCard
            label="Damga"
            value={(kpi?.stamps_period ?? 0).toLocaleString("tr-TR")}
            icon={Stamp}
            hint={range.label}
            breakdown={breakdowns.stamps}
            breakdownTitle="Damga katkısı"
          />
          <KpiCard
            label="Oluşturulan kart"
            value={(kpi?.cards_period ?? 0).toLocaleString("tr-TR")}
            icon={CreditCard}
            hint={range.label}
            breakdown={breakdowns.cards}
            breakdownTitle="Kart katkısı"
          />
          <KpiCard
            label="Kazanılan ödül"
            value={(kpi?.rewards_period ?? 0).toLocaleString("tr-TR")}
            icon={Gift}
            hint={range.label}
            breakdown={breakdowns.rewards}
            breakdownTitle="Ödül katkısı"
          />
        </div>
      )}
    </div>
  );
}
