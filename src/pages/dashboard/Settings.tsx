import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

export default function Settings() {
  const { merchant, refreshMerchant } = useAuth();
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!merchant) return;
    (async () => {
      const { data } = await supabase
        .from("merchants")
        .select("name,legal_name")
        .eq("id", merchant.id)
        .maybeSingle();
      if (data) {
        setName(data.name);
        setLegalName(data.legal_name ?? "");
      }
      setLoading(false);
    })();
  }, [merchant]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !merchant) return;
    const maxBytes = 1 * 1024 * 1024; // 1 MB
    if (file.size > maxBytes) {
      toast({
        title: "Dosya çok büyük",
        description: "Logo en fazla 1 MB olabilir.",
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${merchant.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("brand-assets")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("brand-assets").getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      const { error: updErr } = await supabase
        .from("merchants")
        .update({ logo_url: publicUrl })
        .eq("id", merchant.id);
      if (updErr) throw updErr;
      refreshMerchant();
      toast({ title: "Logo güncellendi" });
    } catch (err: any) {
      toast({ title: "Yüklenemedi", description: err?.message ?? "Bilinmeyen hata", variant: "destructive" });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!merchant) return;
    setSaving(true);
    const { error } = await supabase
      .from("merchants")
      .update({ name, legal_name: legalName || null })
      .eq("id", merchant.id);
    setSaving(false);
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Kaydedildi" });
    refreshMerchant();
  };

  return (
    <div className="container max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Ayarlar</h1>
        <p className="mt-1 text-muted-foreground">İşletme profili ve genel ayarlar.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İşletme profili</CardTitle>
          <CardDescription>Müşterilere ve cüzdan kartlarında görünen bilgiler.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="space-y-2">
                <Label>İşletme adı</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Yasal ünvan</Label>
                <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kaydet
              </Button>

              <div className="space-y-2 pt-2">
                <Label>Logo</Label>
                {merchant?.logo_url && (
                  <img
                    src={merchant.logo_url}
                    alt="İşletme logosu"
                    className="h-20 w-20 object-contain"
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {merchant?.logo_url ? "Yeni Logo Yükle" : "Logo Yükle"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
