import { ReactNode, useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import { useAuth, ROLE_LABELS } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean };

const baseNav: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/events", label: "Events", icon: CalendarRange },
  { to: "/app/events/new", label: "Submit Event", icon: CalendarPlus },
  { to: "/app/profile", label: "Profile", icon: User },
];

const adminNav: NavItem[] = [{ to: "/app/users", label: "Members", icon: Users }];

export const AppShell = ({ children }: { children?: ReactNode }) => {
  const { profile, college, highestRole, signOut, hasRole, roles } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("occasia_theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("occasia_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("occasia_theme", "light");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("occasia_theme");
    if (saved === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
    } else if (saved === "light") {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
    }
  }, []);

  const isFaculty = roles.some((r) => ["principal", "ed", "hod", "advisor"].includes(r));
  const nav = [...baseNav, ...(hasRole("admin") || isFaculty ? adminNav : [])];

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 grain shadow-elegant",
          isDark ? "bg-gradient-hero text-primary-foreground" : "bg-gradient-soft border-r border-border text-foreground",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-primary-foreground/10 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 backdrop-blur">
              <GraduationCap className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className={cn(
                  "font-display text-xl font-bold leading-none",
                  isDark ? "text-white" : "text-black"
                )}>
                Occasia<span className="text-accent">.</span>
              </p>
              <p className={cn(
                  "font-mono text-[0.65rem] uppercase tracking-[0.2em] mt-1",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                {college?.code ?? "—"}
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
                "lg:hidden",
                isDark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-black/60 hover:text-black hover:bg-black/5"
            )}
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User card */}
        <div className="p-4">
          <div className={cn(
              "rounded-xl p-4 border",
              isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
          )}>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-accent mb-1 font-bold">
              {highestRole ? ROLE_LABELS[highestRole] : "Member"}
            </p>
            <p className={cn(
                "font-bold leading-tight truncate",
                isDark ? "text-white" : "text-black"
            )}>{profile?.full_name}</p>
            <p className={cn(
                "text-xs truncate",
                isDark ? "text-white/60" : "text-black/60"
            )}>{profile?.email}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all",
                    isActive
                      ? "bg-accent text-accent-foreground shadow-gold"
                      : isDark 
                        ? "text-white/70 hover:bg-white/10 hover:text-white"
                        : "text-black/70 hover:bg-black/5 hover:text-black"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10 space-y-2">
          <p className={cn(
              "text-[0.65rem] font-bold uppercase tracking-widest mb-1 px-2",
              isDark ? "text-white/40" : "text-black/40"
          )}>{college?.name}</p>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={cn(
                "w-full justify-start font-bold",
                isDark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-black/70 hover:bg-black/5 hover:text-black"
            )}
          >
            {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={cn(
                "w-full justify-start font-bold group",
                isDark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-black/70 hover:bg-black/5 hover:text-black"
            )}
          >
            <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 lg:hidden border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex items-center gap-2 group transition-opacity active:opacity-70"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card group-hover:bg-muted transition-colors">
                <Menu className="h-4 w-4" />
              </div>
              <span className="font-display font-semibold text-lg">Occasia<span className="text-accent">.</span></span>
            </button>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-lg border border-border bg-card">
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <div className="h-8 w-8 rounded-full bg-gradient-hero flex items-center justify-center text-[0.6rem] text-primary-foreground font-bold border border-primary-foreground/20">
                    {profile?.full_name.split(' ').map(n=>n[0]).join('')}
                </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};
