import { ReactNode } from "react";
import { Navigate, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Store, LogOut, Loader2, Globe } from "lucide-react";

const items = [
  { title: "Genel bakış", url: "/platform", icon: LayoutDashboard, end: true },
  { title: "İşletmeler", url: "/platform/merchants", icon: Store, end: true },
];

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const { user, isPlatform, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  if (!isPlatform) return <Navigate to="/dashboard" replace />;

  const merchantsActive = location.pathname.startsWith("/platform/merchants");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Globe className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">Platform</div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {items.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.end}
              className={() => {
                const active =
                  item.url === "/platform/merchants" ? merchantsActive : location.pathname === "/platform";
                return `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`;
              }}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-2">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Çıkış
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card/50 px-4 backdrop-blur md:hidden">
          <Globe className="h-4 w-4" />
          <span className="text-sm font-semibold">Platform</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <nav className="flex gap-1 border-b border-border px-3 py-2 md:hidden">
          {items.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className={() => {
                const active =
                  item.url === "/platform/merchants" ? merchantsActive : location.pathname === "/platform";
                return `rounded-md px-3 py-1.5 text-sm ${
                  active ? "bg-accent font-medium" : "text-muted-foreground"
                }`;
              }}
            >
              {item.title}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
