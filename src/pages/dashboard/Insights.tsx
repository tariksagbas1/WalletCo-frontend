import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fetchCustomersWithMetrics, type CustomerRow } from "@/lib/insights";
import { relativeFromNow } from "@/lib/analytics";
import { KpiCard } from "@/components/analytics/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserPlus,
  Activity,
  Crown,
  Loader2,
  Stamp,
  Gift,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ActivityEvent = {
  id: string;
  type: "stamp" | "redemption";
  created_at: string;
  customer_id: string;
  customer_name: string;
  delta?: number;
  reversal_of_event_id?: string | null;
  reward_title?: string | null;
};

export default function Insights() {
  const { merchant } = useAuth();
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!merchant) return;
    setLoading(true);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    (async () => {
      const [customers, stamps, redeems] = await Promise.all([
        fetchCustomersWithMetrics(merchant.id),
        supabase
          .from("stamp_events")
          .select("id,delta,created_at,reversal_of_event_id,customer_id,customers:customer_id(first_name,last_name)")
          .eq("merchant_id", merchant.id)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("redemption_events")
          .select(
            "id,created_at,reversal_of_event_id,customer_id,customers:customer_id(first_name,last_name),reward_definitions:reward_definition_id(reward_title)",
          )
          .eq("merchant_id", merchant.id)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(200),
      ]);

      setRows(customers);

      const customerName = (c: any) => {
        if (!c) return "Müşteri";
        return [c.first_name, c.last_name].filter(Boolean).join(" ") || "Müşteri";
      };

      const merged: ActivityEvent[] = [
        ...(stamps.data ?? []).map((s: any) => ({
          id: s.id,
          type: "stamp" as const,
          created_at: s.created_at,
          customer_id: s.customer_id,
          customer_name: customerName(s.customers),
          delta: s.delta,
          reversal_of_event_id: s.reversal_of_event_id,
        })),
        ...(redeems.data ?? []).map((r: any) => ({
          id: r.id,
          type: "redemption" as const,
          created_at: r.created_at,
          customer_id: r.customer_id,
          customer_name: customerName(r.customers),
          reversal_of_event_id: r.reversal_of_event_id,
          reward_title: r.reward_definitions?.reward_title ?? null,
        })),
      ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

      setEvents(merged);
      setLoading(false);
    })();
  }, [merchant]);

  const stats = useMemo(() => {
    const now = Date.now();
    const day = 86_400_000;
    let newWeek = 0,
      newMonth = 0,
      active = 0,
      loyal = 0;
    for (const c of rows) {
      const created = new Date(c.created_at).getTime();
      if (now - created < 7 * day) newWeek++;
      if (now - created < 30 * day) newMonth++;
      const m = c.metrics;
      if (m) {
        if (m.lifecycle_status === "active" || m.lifecycle_status === "new") active++;
        if (m.loyalty_segment === "vip" || m.loyalty_segment === "regular") loyal++;
      }
    }
    return {
      total: rows.length,
      newWeek,
      newMonth,
      active,
      loyal,
    };
  }, [rows]);

  const stampCount = useMemo(
    () => events.filter((e) => e.type === "stamp" && (e.delta ?? 0) > 0 && !e.reversal_of_event_id).length,
    [events],
  );
  const redeemCount = useMemo(
    () => events.filter((e) => e.type === "redemption" && !e.reversal_of_event_id).length,
    [events],
  );

  const groupedEvents = useMemo(() => {
    const groups = new Map<string, ActivityEvent[]>();
    for (const e of events) {
      const key = new Date(e.created_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const arr = groups.get(key) ?? [];
      arr.push(e);
      groups.set(key, arr);
    }
    return Array.from(groups.entries());
  }, [events]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Müşteri İçgörüleri</h1>
          <p className="mt-1 text-muted-foreground">
            Müşterilerinizi tanıyın, segmentlere ayırın ve davranışlarını takip edin.
          </p>
        </div>
        <Link to="/dashboard/insights/customers">
          <Button variant="outline">Tüm müşterileri görüntüle</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Toplam müşteri" value={stats.total.toLocaleString("tr-TR")} icon={Users} hint={`+${stats.newWeek} son 7g`} />
        <KpiCard label="Yeni (30g)" value={stats.newMonth.toLocaleString("tr-TR")} icon={UserPlus} />
        <KpiCard label="Aktif" value={stats.active.toLocaleString("tr-TR")} icon={Activity} />
        <KpiCard label="Sadık / VIP" value={stats.loyal.toLocaleString("tr-TR")} icon={Crown} />
      </div>

      <Card className="mt-8 shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <CardTitle>Son 7 gün etkinlikleri</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Damga basımları ve ödül kullanımları
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {stampCount} damga · {redeemCount} ödül
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Son 7 günde henüz etkinlik yok.</p>
          ) : (
            <div className="space-y-6">
              {groupedEvents.map(([dayLabel, dayEvents]) => (
                <div key={dayLabel}>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {dayLabel}
                  </div>
                  <div className="space-y-2 border-l-2 border-border pl-4">
                    {dayEvents.map((e) => {
                      const isReversal = !!e.reversal_of_event_id;
                      const isStamp = e.type === "stamp";
                      const negative = isStamp && (e.delta ?? 0) < 0;
                      return (
                        <div
                          key={`${e.type}-${e.id}`}
                          className="relative flex items-center gap-3 rounded-md border border-border bg-card p-3"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              isReversal || negative
                                ? "bg-muted text-muted-foreground"
                                : isStamp
                                  ? "bg-primary/10 text-primary"
                                  : "bg-accent/15 text-accent"
                            }`}
                          >
                            {isReversal || negative ? (
                              <Undo2 className="h-4 w-4" />
                            ) : isStamp ? (
                              <Stamp className="h-4 w-4" />
                            ) : (
                              <Gift className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium">
                              {isStamp
                                ? isReversal
                                  ? "Damga geri alındı"
                                  : `${(e.delta ?? 0) > 0 ? "+" : ""}${e.delta} damga`
                                : e.reward_title
                                  ? `Ödül kullanıldı · ${e.reward_title}`
                                  : "Ödül kullanıldı"}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              <Link
                                to={`/dashboard/insights/customers/${e.customer_id}`}
                                className="hover:underline"
                              >
                                {e.customer_name}
                              </Link>
                              {" · "}
                              {relativeFromNow(e.created_at)} ·{" "}
                              {new Date(e.created_at).toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
