import { useEffect, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { Loader2, Stamp, CheckCircle2, ShieldCheck, Apple } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { absoluteAppUrl } from "@/lib/appUrl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface ProgramInfo {
  id: string;
  name: string;
  description: string | null;
  brand_primary_color: string | null;
  terms_text: string | null;
  rule: { threshold?: number; reward_label?: string };
  merchant: { name: string; slug: string; logo_url: string | null };
}

function MerchantLogo({ logoUrl, brand }: { logoUrl: string | null; brand: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="" className="mx-auto size-14 rounded-xl object-contain" />;
  }
  return <Stamp className="mx-auto h-14 w-14" style={{ color: brand }} />;
}

const FormSchema = z.object({
  first_name: z.string().trim().min(1, "Adınız gerekli").max(80),
  last_name: z.string().trim().max(80).optional(),
  phone: z
    .string()
    .trim()
    .min(7, "Geçerli bir telefon girin")
    .max(20)
    .regex(/^[+0-9\s()-]+$/, "Geçerli bir telefon girin"),
  consent_kvkk: z.literal(true, {
    errorMap: () => ({ message: "Devam etmek için onay vermeniz gerekiyor" }),
  }),
  consent_marketing: z.boolean().optional(),
});

export default function PublicJoin() {
  const { merchantSlug, programSlug } = useParams<{ merchantSlug: string; programSlug: string }>();
  const [program, setProgram] = useState<ProgramInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addingToWallet, setAddingToWallet] = useState(false);
  const [done, setDone] = useState<{ passId: string; downloadUrl: string; authToken: string } | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    consent_kvkk: false,
    consent_marketing: false,
  });

  useEffect(() => {
    document.title = "Sadakat kartına katıl";
    if (!merchantSlug || !programSlug) return;
    (async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/public-program-info?merchant_slug=${encodeURIComponent(
            merchantSlug,
          )}&program_slug=${encodeURIComponent(programSlug)}`,
          { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } },
        );
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProgram({
          id: data.program.id,
          name: data.program.name,
          description: data.program.description,
          brand_primary_color: data.program.brand_primary_color,
          terms_text: data.program.terms_text,
          rule: data.program.rule ?? {},
          merchant: {
            name: data.merchant.name,
            slug: data.merchant.slug,
            logo_url: data.merchant.logo_url ?? null,
          },
        });
      } catch (err) {
        console.error("Failed to load program info:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [merchantSlug, programSlug]);

  const handleAddToWallet = () => {
    if (!done || addingToWallet) return;
    flushSync(() => {
      setAddingToWallet(true);
    });
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const downloadEndpoint =
      done.downloadUrl ||
      `${supabaseUrl}/functions/v1/pass-download?pass_id=${done.passId}&token=${done.authToken}`;
    window.setTimeout(() => {
      window.location.href = downloadEndpoint;
    }, 150);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    const parsed = FormSchema.safeParse(payload);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast({ title: "Lütfen kontrol edin", description: first ?? "Form geçersiz", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("public-join", {
        body: {
          merchant_slug: merchantSlug,
          program_slug: programSlug,
          first_name: parsed.data.first_name,
          last_name: parsed.data.last_name || null,
          phone: parsed.data.phone,
          email: null,
          consent_kvkk: true,
          consent_marketing: !!parsed.data.consent_marketing,
        },
      });
      if (error) throw error;
      setDone({
        passId: (data as any).pass_id,
        downloadUrl: (data as any).download_url,
        authToken: (data as any).auth_token,
      });
    } catch (err) {
      toast({
        title: "Üye olunamadı",
        description: err instanceof Error ? err.message : "Bilinmeyen hata",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!program) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold">Program bulunamadı</h1>
        <p className="mt-2 text-muted-foreground">Bu link artık aktif olmayabilir.</p>
      </div>
    );
  }

  const brand = program.brand_primary_color ?? "hsl(var(--primary))";
  const threshold = program.rule.threshold ?? 10;
  const rewardLabel = program.rule.reward_label ?? "Ödül";

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        {addingToWallet &&
          createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm"
              aria-busy="true"
              aria-label="Kartınız hazırlanıyor"
            >
              <div className="flex flex-col items-center gap-4">
                <p className="text-base font-medium text-foreground">Kartınız hazırlanıyor</p>
                <Loader2 className="h-8 w-8 animate-spin text-foreground" />
              </div>
            </div>,
            document.body,
          )}

        <div
          className="relative px-6 pb-12 pt-16 text-center"
          style={{ background: `linear-gradient(180deg, ${brand}, transparent)` }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/95 shadow-md">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-white">Hoş geldin!</h1>
          <p className="mt-1 text-sm text-white/85">{program.merchant.name} sadakat kartın hazır.</p>
        </div>

        <div className="-mt-6 px-6">
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
            <div className="text-sm text-muted-foreground">Program</div>
            <div className="mt-1 text-lg font-semibold">{program.name}</div>
            <div className="mt-4 text-sm">
              <span className="font-medium">{threshold}</span> damga doldur,{" "}
              <span className="font-medium">{rewardLabel}</span> kazan.
            </div>

            <button
              type="button"
              onClick={handleAddToWallet}
              disabled={addingToWallet}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-base font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              <Apple className="h-5 w-5" />
              Apple Wallet'a Ekle
            </button>

            <a
              href={absoluteAppUrl(`/pass/${done.passId}?token=${done.authToken}`)}
              className="mt-3 block text-center text-sm text-muted-foreground underline-offset-2 hover:underline"
            >
              Kartı bağlantıyla aç
            </a>
          </div>

          <p className="mx-auto mt-6 max-w-md text-center text-xs text-muted-foreground">
            iPhone'da açtığında kartın doğrudan Wallet'a eklenir. Android desteği yakında.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 pb-10 pt-16 text-center" style={{ background: `linear-gradient(180deg, ${brand}, transparent)` }}>
        <MerchantLogo logoUrl={program.merchant.logo_url} brand={brand} />
        <h1 className="mt-5 text-2xl font-semibold text-white">{program.merchant.name}</h1>
        <p className="mt-1 text-sm text-white/85">{program.name}</p>
      </div>

      <div className="-mt-6 px-6 pb-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{threshold}</span> damga doldur,{" "}
            <span className="font-semibold">{rewardLabel}</span> kazan.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">Adın *</Label>
                <Input
                  id="first_name"
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  required
                  maxLength={80}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Soyadın</Label>
                <Input
                  id="last_name"
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  maxLength={80}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="05XX XXX XX XX"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                required
                maxLength={20}
              />
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <Checkbox
                checked={form.consent_kvkk}
                onCheckedChange={(v) => setForm((f) => ({ ...f, consent_kvkk: v === true }))}
                className="mt-0.5"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                <Link
                  to="/privacy-policy"
                  className="font-semibold underline underline-offset-2 hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  KVKK aydınlatma metnini
                </Link>{" "}
                ve{" "}
                <Link
                  to="/user-agreement"
                  className="font-semibold underline underline-offset-2 hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  kullanım koşullarını
                </Link>{" "}
                okudum, sadakat programı için kişisel verilerimin işlenmesine onay veriyorum.
              </span>
            </label>

            {/* Marketing SMS opt-in — hidden for now
            <label className="flex items-start gap-3 px-1">
              <Checkbox
                checked={form.consent_marketing}
                onCheckedChange={(v) => setForm((f) => ({ ...f, consent_marketing: v === true }))}
                className="mt-0.5"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                Kampanya ve özel teklifler için SMS almak istiyorum (opsiyonel).
              </span>
            </label>
            */}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sadakat kartımı oluştur"}
            </Button>
          </form>
        </div>

        {program.terms_text && (
          <p className="mx-auto mt-4 max-w-md whitespace-pre-line text-center text-xs text-muted-foreground">
            {program.terms_text}
          </p>
        )}
      </div>
    </div>
  );
}
