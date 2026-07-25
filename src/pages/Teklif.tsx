import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine(
    (value) => /^(?:\+90|0)?5\d{9}$/.test(value),
    "Geçerli bir cep telefonu girin (örn. 05XX XXX XX XX)",
  );

const emailSchema = z
  .string()
  .trim()
  .email("Geçerli bir e-posta girin (örn. ornek@isletme.com)")
  .max(255);

const leadSchema = z.object({
  business_name: z.string().trim().min(2, "İşletme adını girin").max(120),
  contact_name: z.string().trim().min(2, "Adınızı girin").max(100),
  phone_number: phoneSchema,
  email: emailSchema,
  branch_count: z.enum(["1", "2", "3-5", "6+"], {
    required_error: "Şube sayısını seçin",
  }),
  note: z.string().trim().max(1000).optional(),
});

type FieldErrors = {
  phone_number?: string;
  email?: string;
};

export default function Teklif() {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [branchCount, setBranchCount] = useState("");
  const [note, setNote] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validatePhone = (value: string) => {
    const result = phoneSchema.safeParse(value);
    const message = result.success ? undefined : result.error.issues[0].message;
    setFieldErrors((prev) => ({ ...prev, phone_number: message }));
    return result.success;
  };

  const validateEmail = (value: string) => {
    const result = emailSchema.safeParse(value);
    const message = result.success ? undefined : result.error.issues[0].message;
    setFieldErrors((prev) => ({ ...prev, email: message }));
    return result.success;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneOk = validatePhone(phoneNumber);
    const emailOk = validateEmail(email);

    if (!phoneOk || !emailOk) {
      toast({
        title: "Format hatalı",
        description: "Telefon ve e-posta alanlarını kontrol edin.",
        variant: "destructive",
      });
      return;
    }

    if (!accepted) {
      toast({
        title: "Onay gerekli",
        description: "Devam etmek için KVKK bilgilendirmesini onaylayın.",
        variant: "destructive",
      });
      return;
    }

    const parsed = leadSchema.safeParse({
      business_name: businessName,
      contact_name: contactName,
      phone_number: phoneNumber,
      email,
      branch_count: branchCount,
      note: note || undefined,
    });

    if (!parsed.success) {
      toast({
        title: "Eksik bilgi",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("leads").insert({
        business_name: parsed.data.business_name,
        contact_name: parsed.data.contact_name,
        phone_number: parsed.data.phone_number,
        email: parsed.data.email,
        branch_count: parsed.data.branch_count,
        note: parsed.data.note ?? null,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bir hata oluştu";
      toast({
        title: "Gönderilemedi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-[110px]" />
        <div className="absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}walletco-logo.png`}
              alt="WalletCo"
              className="h-9 w-9 rounded-lg object-contain"
            />
            <span className="text-lg font-semibold tracking-tight">WalletCo</span>
          </Link>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Ana sayfa
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8 lg:py-20">
        <div className="lg:pt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Teklif Al</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            İşletmeniz için sadakat kartını birlikte kuralım.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
            Formu doldurun, sizi arayalım. Kampanyanızı, kart tasarımınızı ve QR posterinizi
            işletmenize özel olarak hazırlayalım.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {[
              "Apple Wallet’a özel dijital damga kartı",
              "Uygulama indirmeden müşteri kaydı",
              "Personel paneli ve canlı istatistikler",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-[var(--shadow-elevated)] backdrop-blur sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <h2 className="mt-5 text-2xl font-semibold">Talebiniz alındı</h2>
              <p className="mt-3 max-w-sm text-muted-foreground">
                En kısa sürede sizinle iletişime geçeceğiz. Teşekkür ederiz.
              </p>
              <Button className="mt-8" asChild>
                <Link to="/">Ana sayfaya dön</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="business_name">İşletme adı</Label>
                <Input
                  id="business_name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="WalletCo Cafe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_name">Yetkili adı</Label>
                <Input
                  id="contact_name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Telefon</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (fieldErrors.phone_number) validatePhone(e.target.value);
                    }}
                    onBlur={() => {
                      if (phoneNumber.trim()) validatePhone(phoneNumber);
                    }}
                    placeholder="05XX XXX XX XX"
                    aria-invalid={Boolean(fieldErrors.phone_number)}
                    className={cn(fieldErrors.phone_number && "border-destructive focus-visible:ring-destructive")}
                    required
                  />
                  {fieldErrors.phone_number && (
                    <p className="text-xs text-destructive">{fieldErrors.phone_number}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) validateEmail(e.target.value);
                    }}
                    onBlur={() => {
                      if (email.trim()) validateEmail(email);
                    }}
                    placeholder="ornek@isletme.com"
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={cn(fieldErrors.email && "border-destructive focus-visible:ring-destructive")}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch_count">Şube sayısı</Label>
                <Select value={branchCount} onValueChange={setBranchCount}>
                  <SelectTrigger id="branch_count">
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 şube</SelectItem>
                    <SelectItem value="2">2 şube</SelectItem>
                    <SelectItem value="3-5">3–5 şube</SelectItem>
                    <SelectItem value="6+">6+ şube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Not (opsiyonel)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Kampanya fikriniz veya sorularınız varsa yazabilirsiniz."
                  rows={4}
                />
              </div>

              <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border"
                />
                <span>
                  Kişisel verilerimin teklif süreci için işlenmesini kabul ediyorum.{" "}
                  <Link to="/privacy-policy" className="font-medium text-primary underline-offset-4 hover:underline">
                    Gizlilik Politikası
                  </Link>
                </span>
              </label>

              <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gönder
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
