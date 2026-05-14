import { useRouter } from "next/router";
import Link from "next/link";
import { Home, Search, Briefcase, Building2, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: Briefcase, label: "Portfolio", path: "/portfolio" },
    { icon: Building2, label: "Brokers", path: "/brokers" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-full flex h-16 items-center justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <img
              src="/bloom-logo.png"
              alt="Bloom"
              className="h-8 w-auto"
            />
            <span className="font-serif text-xl font-bold text-foreground">
              Bloom
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${active ? "fill-current" : ""}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}