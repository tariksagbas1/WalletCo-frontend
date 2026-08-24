import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import PlatformMerchantDetail from "./PlatformMerchantDetail";

interface MerchantRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

export default function PlatformMerchants() {
  const [params] = useSearchParams();
  const merchantId = params.get("merchant_id");
  if (merchantId) return <PlatformMerchantDetail merchantId={merchantId} />;
  return <MerchantList />;
}

function MerchantList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<MerchantRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("merchants")
        .select("id,name,slug,status,created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(500);
      setRows((data as MerchantRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">İşletmeler</h1>
        <p className="text-sm text-muted-foreground">Aktif işletmeleri inceleyin.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
          <CardDescription>{rows.length} işletme</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...
            </div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">Henüz aktif işletme yok.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İsim</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Oluşturuldu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((m) => (
                  <TableRow
                    key={m.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/platform/merchants?merchant_id=${m.id}`)}
                  >
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.slug}</TableCell>
                    <TableCell>
                      <Badge variant={m.status === "active" ? "default" : "secondary"}>{m.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString("tr-TR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
