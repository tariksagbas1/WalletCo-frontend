import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { absoluteAppUrl } from "@/lib/appUrl";
import { relativeFromNow } from "@/lib/analytics";
import { PeriodFilter } from "@/components/platform/PeriodFilter";
import { PlatformLineChart } from "@/components/platform/PlatformLineChart";
import { usePlatformRange, type PlatformBucket, type PlatformKpi } from "@/pages/platform/range";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Gift, Loader2, Stamp, UserPlus } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  owner: "Sahip",
  admin: "Yönetici",
  manager: "Şube müdürü",
  staff: "Personel",
  analyst: "Analist",
  support: "Destek",
};

const EVENT_LABEL: Record<string, { title: (e: TimelineEvent) => string; icon: typeof Stamp }> = {
  stamp_added: {
    title: (e) => `+${e.delta ?? 1} damga`,
    icon: Stamp,
  },
  reward_earned: {
    title: () => "Ödül kazanıldı",
    icon: Gift,
  },
  wallet_signup_completed: {
    title: () => "Yeni kart kaydı",
    icon: UserPlus,
  },
};

type Merchant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  legal_name: string | null;
};

type TimelineEvent = {
  id: string;
  event_type: string;
  created_at: string;
  delta?: number;
  customer_name: string;
};

type TeamMember = {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
};

type ProgramRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  terms_text: string | null;
  status: string;
  program_rules: { rule_json: { threshold?: number } }[] | null;
};

function customerName(c: { first_name?: string | null; last_name?: string | null } | null) {
  if (!c) return "Müşteri";
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || "Müşteri";
}

function formatBucketLabel(iso: string, granularity: "hour" | "day") {
  const d = new Date(iso);
  if (granularity === "hour") {
    return d.toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "short",
  });
}

export default function PlatformMerchantDetail({ merchantId }: { merchantId: string }) {
  const range = usePlatformRange();
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [kpi, setKpi] = useState<PlatformKpi | null>(null);
  const [buckets, setBuckets] = useState<PlatformBucket[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [openProgram, setOpenProgram] = useState<ProgramRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("merchants")
        .select("id,name,slug,status,created_at,legal_name")
        .eq("id", merchantId)
        .maybeSingle();
      if (!cancelled) setMerchant((data as Merchant) ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [merchantId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const since = range.since.toISOString();
      const until = range.until.toISOString();
      const [kpiRes, bucketRes, eventRes, roleRes, programRes] = await Promise.all([
        (supabase as any).rpc("platform_kpi_counts", {
          _since: since,
          _merchant_id: merchantId,
          _until: until,
        }),
        (supabase as any).rpc("platform_event_buckets", {
          _since: since,
          _granularity: range.granularity,
          _merchant_id: merchantId,
          _until: until,
        }),
        supabase
          .from("customer_events")
          .select("id,event_type,created_at,metadata,customer_id")
          .eq("merchant_id", merchantId)
          .in("event_type", ["stamp_added", "reward_earned", "wallet_signup_completed"])
          .gte("created_at", since)
          .lte("created_at", until)
          .order("created_at", { ascending: false })
          .limit(400),
        supabase.from("user_roles").select("role, user_id").eq("merchant_id", merchantId),
        supabase
          .from("programs")
          .select("id,name,slug,description,terms_text,status,program_rules(rule_json)")
          .eq("merchant_id", merchantId)
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;

      setKpi((kpiRes.data as PlatformKpi) ?? null);
      setBuckets(
        ((bucketRes.data ?? []) as { bucket: string; stamps: number; cards: number; rewards: number }[]).map((b) => ({
          bucket: b.bucket,
          stamps: Number(b.stamps),
          cards: Number(b.cards),
          rewards: Number(b.rewards),
        })),
      );
      const eventRows = (eventRes.data ?? []) as any[];
      const customerIds = [...new Set(eventRows.map((e) => e.customer_id).filter(Boolean))];
      const nameById = new Map<string, string>();
      if (customerIds.length > 0) {
        const { data: customers } = await supabase
          .from("customers")
          .select("id,first_name,last_name")
          .in("id", customerIds);
        for (const c of customers ?? []) {
          nameById.set(c.id, customerName(c));
        }
      }
      setEvents(
        eventRows.map((e) => ({
          id: e.id,
          event_type: e.event_type,
          created_at: e.created_at,
          delta: e.metadata?.delta,
          customer_name: nameById.get(e.customer_id) ?? "Müşteri",
        })),
      );

      const roles = (roleRes.data ?? []) as { role: string; user_id: string }[];
      const userIds = [...new Set(roles.map((r) => r.user_id))];
      let members: TeamMember[] = [];
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("merchant_users")
          .select("user_id,email,first_name,last_name")
          .in("user_id", userIds);
        members = (users ?? []).map((u) => ({
          ...u,
          roles: roles.filter((r) => r.user_id === u.user_id).map((r) => r.role),
        }));
      }
      if (!cancelled) {
        setTeam(members);
        setPrograms((programRes.data as ProgramRow[]) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [merchantId, range.since, range.until, range.granularity]);

  const chartData = useMemo(
    () =>
      buckets.map((b) => ({
        label: formatBucketLabel(b.bucket, range.granularity),
        stamps: b.stamps,
        cards: b.cards,
        rewards: b.rewards,
      })),
    [buckets, range.granularity],
  );

  const groupedEvents = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const e of events) {
      const key = new Date(e.created_at).toLocaleDateString("tr-TR", {
        timeZone: "Europe/Istanbul",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [events]);

  const stampCount = events.filter((e) => e.event_type === "stamp_added").length;
  const rewardCount = events.filter((e) => e.event_type === "reward_earned").length;
  const joinUrl = openProgram && merchant ? absoluteAppUrl(`/join/${merchant.slug}/${openProgram.slug}`) : "";
  const threshold = openProgram?.program_rules?.[0]?.rule_json?.threshold;

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link kopyalandı" });
    } catch {
      toast({ title: "Link kopyalanamadı", variant: "destructive" });
    }
  };

  if (!merchant && !loading) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        İşletme bulunamadı.{" "}
        <Link to="/platform/merchants" className="underline">
          Listeye dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link to="/platform/merchants">
              <ArrowLeft className="h-4 w-4" /> İşletmeler
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{merchant?.name ?? "İşletme"}</h1>
          <p className="text-sm text-muted-foreground">
            {merchant?.slug}
            {merchant?.legal_name ? ` · ${merchant.legal_name}` : ""}
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
      ) : (
        <>
          <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
            <div>
              <p className="text-sm text-muted-foreground">Toplam</p>
              <div className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
                <div>
                  <div className="text-4xl font-semibold tracking-tight tabular-nums">
                    {(kpi?.stamps_total ?? 0).toLocaleString("tr-TR")}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">damga</div>
                </div>
                <div>
                  <div className="text-4xl font-semibold tracking-tight tabular-nums">
                    {(kpi?.cards_total ?? 0).toLocaleString("tr-TR")}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">kart</div>
                </div>
                <div>
                  <div className="text-4xl font-semibold tracking-tight tabular-nums">
                    {(kpi?.rewards_total ?? 0).toLocaleString("tr-TR")}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">ödül</div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{range.label}</p>
              <div className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
                <div>
                  <div className="text-4xl font-semibold tracking-tight tabular-nums">
                    {(kpi?.stamps_period ?? 0).toLocaleString("tr-TR")}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">damga</div>
                </div>
                <div>
                  <div className="text-4xl font-semibold tracking-tight tabular-nums">
                    {(kpi?.cards_period ?? 0).toLocaleString("tr-TR")}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">kart</div>
                </div>
                <div>
                  <div className="text-4xl font-semibold tracking-tight tabular-nums">
                    {(kpi?.rewards_period ?? 0).toLocaleString("tr-TR")}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">ödül</div>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Etkinlik grafiği</CardTitle>
              <CardDescription>{range.label} — damga, kart kaydı ve ödül</CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformLineChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <CardTitle>{range.label} etkinlikleri</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Damga basımları, kart kayıtları ve ödüller</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stampCount} damga · {rewardCount} ödül
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">Bu dönemde henüz etkinlik yok.</p>
              ) : (
                <div className="space-y-6">
                  {groupedEvents.map(([dayLabel, dayEvents]) => (
                    <div key={dayLabel}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {dayLabel}
                      </div>
                      <div className="space-y-2">
                        {dayEvents.map((e) => {
                          const meta = EVENT_LABEL[e.event_type] ?? {
                            title: () => e.event_type,
                            icon: Stamp,
                          };
                          const Icon = meta.icon;
                          return (
                            <div
                              key={e.id}
                              className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium">{meta.title(e)}</div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {e.customer_name} · {relativeFromNow(e.created_at)} ·{" "}
                                  {new Date(e.created_at).toLocaleTimeString("tr-TR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: "Europe/Istanbul",
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

          <Card>
            <CardHeader>
              <CardTitle>Kullanıcılar</CardTitle>
              <CardDescription>Bu işletmeye bağlı hesaplar</CardDescription>
            </CardHeader>
            <CardContent>
              {team.length === 0 ? (
                <p className="text-sm text-muted-foreground">Kayıtlı kullanıcı yok.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İsim</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Rol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.map((u) => (
                      <TableRow key={u.user_id}>
                        <TableCell className="font-medium">
                          {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((r) => (
                              <Badge key={r} variant="secondary">
                                {ROLE_LABEL[r] ?? r}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Programlar</CardTitle>
              <CardDescription>Detay için bir programa tıklayın</CardDescription>
            </CardHeader>
            <CardContent>
              {programs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Program yok.</p>
              ) : (
                <div className="space-y-2">
                  {programs.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setOpenProgram(p)}
                      className="flex w-full items-center justify-between rounded-md border border-border px-4 py-3 text-left hover:bg-muted/50"
                    >
                      <div>
                        <div className="font-medium">{p.name}</div>
                        {p.description && (
                          <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{p.description}</div>
                        )}
                      </div>
                      <Badge variant={p.status === "published" ? "default" : "secondary"}>
                        {p.status === "published" ? "Yayında" : p.status === "draft" ? "Taslak" : "Arşiv"}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={!!openProgram} onOpenChange={(open) => !open && setOpenProgram(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{openProgram?.name}</DialogTitle>
            <DialogDescription>{openProgram?.description || "Açıklama yok"}</DialogDescription>
          </DialogHeader>
          {openProgram && merchant && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Şartlar</div>
                <p className="mt-1 text-sm">{openProgram.terms_text || "—"}</p>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Damga eşiği</div>
                <p className="mt-1 text-sm font-medium">{threshold ?? "—"}</p>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Katılım linki</div>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md bg-muted px-2 py-1 text-xs">{joinUrl}</code>
                  <Button size="sm" variant="outline" onClick={() => copyLink(joinUrl)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-center rounded-md border border-border bg-white p-4">
                <QRCodeCanvas id="platform-program-qr" value={joinUrl} size={180} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
