import { useMemo, useState } from "react";
import { GraduationCap, Map, Zap, Cpu, Clock, RotateCcw, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { phases, features, techCore, techExtras, timeline } from "@/data/roadmap";
import { useTaskProgress } from "@/hooks/use-task-progress";
import { RoadmapPhases } from "@/components/RoadmapPhases";
import { WorkflowDiagram } from "@/components/WorkflowDiagram";

const tabs = [
  { id: "overview", label: "Overview", icon: GraduationCap },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "features", label: "Features", icon: Zap },
  { id: "tech", label: "Tech Stack", icon: Cpu },
  { id: "timeline", label: "Timeline", icon: Clock },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Roadmap = () => {
  const [active, setActive] = useState<TabId>("overview");

  const allTaskIds = useMemo(
    () => phases.flatMap((p) => p.tasks.map((_, i) => `t-${p.id}-${i}`)),
    []
  );
  const { completed, toggle, reset, pct, done, total } = useTaskProgress(allTaskIds);

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <header className="relative overflow-hidden bg-gradient-hero text-primary-foreground grain">
        <div
          className="absolute inset-0 opacity-30 animate-slow-pan"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(var(--accent) / 0.4) 0%, transparent 40%), radial-gradient(circle at 80% 60%, hsl(var(--primary-glow) / 0.5) 0%, transparent 45%)",
          }}
        />
        <div className="relative container py-20 md:py-32">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 backdrop-blur">
              <GraduationCap className="h-5 w-5 text-accent" />
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/70">
              Development Roadmap · v1.0
            </p>
          </div>

          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.95] tracking-tight">
            Occasia<span className="text-accent">.</span>
          </h1>

          <p className="mt-6 max-w-2xl font-display text-2xl md:text-3xl font-light italic text-primary-foreground/85">
            A college event management system, designed for the rhythm of academia.
          </p>

          <p className="mt-8 max-w-xl text-base md:text-lg leading-relaxed text-primary-foreground/70">
            Streamline event approvals through a multi-tier workflow — from student submission to
            principal sign-off — with role-based access, automated notifications, and a clear audit
            trail.
          </p>

          {/* Stats strip */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 backdrop-blur">
            {[
              { v: "10", l: "Phases" },
              { v: "60+", l: "Tasks" },
              { v: "20wk", l: "Timeline" },
              { v: "6", l: "User Roles" },
            ].map((s) => (
              <div key={s.l} className="bg-primary/40 p-6 text-center">
                <p className="font-display text-3xl md:text-4xl font-semibold text-accent">{s.v}</p>
                <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-primary-foreground/60">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* TABS — sticky */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={cn(
                    "relative flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
            <div className="ml-auto hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-gold transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {done}/{total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-16 md:py-24">
        {/* OVERVIEW */}
        {active === "overview" && (
          <div className="space-y-16 animate-fade-in">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="editorial-rule" />
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Project Overview
                </p>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight max-w-3xl">
                Approval workflows that respect institutional hierarchy.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Project Goals",
                  emoji: "🎯",
                  items: [
                    "Streamline event approval process",
                    "Implement multi-level workflow",
                    "Enable role-based access control",
                    "Automate email notifications",
                    "Maintain secure event records",
                  ],
                },
                {
                  title: "User Roles",
                  emoji: "👥",
                  items: [
                    "College Admin (Super Admin)",
                    "Principal (Final Authority)",
                    "Executive Director (ED)",
                    "Head of Department (HOD)",
                    "Class Advisor",
                    "Students",
                  ],
                },
                {
                  title: "Approval Workflow",
                  emoji: "🔄",
                  items: [
                    "Student submits event",
                    "Class Advisor reviews",
                    "HOD approves / forwards",
                    "ED approves / forwards",
                    "Principal gives final approval",
                  ],
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group rounded-2xl border border-border bg-gradient-card p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant"
                >
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/5 text-2xl transition-transform group-hover:scale-110">
                    {card.emoji}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-4">{card.title}</h3>
                  <ul className="space-y-2.5 text-sm">
                    {card.items.map((it) => (
                      <li key={it} className="flex items-start gap-2.5 text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <WorkflowDiagram />
          </div>
        )}

        {/* ROADMAP */}
        {active === "roadmap" && (
          <div className="animate-fade-in">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="editorial-rule" />
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Phase by Phase
                  </p>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight max-w-2xl">
                  Ten phases. Twenty weeks. One shipped product.
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset progress
              </Button>
            </div>
            <RoadmapPhases completed={completed} toggle={toggle} />
          </div>
        )}

        {/* FEATURES */}
        {active === "features" && (
          <div className="animate-fade-in space-y-12">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="editorial-rule" />
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Core Capabilities
                </p>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight max-w-3xl">
                Every feature, mapped to a real institutional need.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant animate-fade-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/5 blur-2xl transition-all group-hover:bg-accent/15" />
                  <div className="relative">
                    <span className="text-3xl">{f.icon}</span>
                    <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                      {f.items.map((it) => (
                        <li key={it} className="flex items-start gap-2 text-muted-foreground">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TECH */}
        {active === "tech" && (
          <div className="animate-fade-in space-y-16">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="editorial-rule" />
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  The MERN Stack
                </p>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight max-w-3xl">
                Built on a stack that scales with the institution.
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {techCore.map((t, i) => (
                <div
                  key={t.name}
                  className="rounded-2xl border-2 border-primary/10 bg-gradient-card p-6 shadow-card transition-all hover:border-primary/30 hover:shadow-elegant animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="mb-3 text-3xl">{t.icon}</div>
                  <h3 className="font-display text-xl font-semibold mb-3">{t.name}</h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {t.items.map((it) => (
                      <li key={it}>· {it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-display text-2xl font-semibold mb-6">
                Additional libraries & tools
              </h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {techExtras.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-5 transition-all hover:bg-gradient-card hover:shadow-card"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xl">{t.icon}</span>
                      <h4 className="font-display text-base font-semibold">{t.name}</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {t.items.map((it) => (
                        <li key={it}>· {it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE */}
        {active === "timeline" && (
          <div className="animate-fade-in space-y-12">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="editorial-rule" />
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Project Timeline
                </p>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight max-w-3xl">
                Twenty weeks, give or take a semester.
              </h2>
            </div>

            <div className="rounded-2xl bg-gradient-hero p-8 md:p-10 text-primary-foreground shadow-elegant">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
                Total Duration
              </p>
              <p className="mt-2 font-display text-4xl md:text-5xl font-semibold">
                20 Weeks <span className="text-primary-foreground/60">· ~5 Months</span>
              </p>
              <div className="mt-6 grid gap-4 text-sm text-primary-foreground/80 md:grid-cols-2">
                <p>
                  <span className="text-accent font-semibold">Full-time:</span> ~5 months as listed.
                </p>
                <p>
                  <span className="text-accent font-semibold">Part-time (20h/wk):</span> ~10 months.
                </p>
                <p>
                  <span className="text-accent font-semibold">Weekends only:</span> ~15 months.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {timeline.map((t, i) => (
                <div
                  key={t.weeks}
                  className="relative overflow-hidden rounded-xl border border-border bg-gradient-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
                    {t.weeks}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold">{t.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                  <div className="absolute right-4 top-4 font-display text-3xl font-bold text-primary/5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Overall Progress
                  </p>
                  <p className="mt-1 font-display text-3xl font-semibold">
                    {pct}% <span className="text-base text-muted-foreground font-sans">complete</span>
                  </p>
                </div>
                <p className="font-mono text-sm text-muted-foreground tabular-nums">
                  {done} / {total} tasks
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-gold shadow-gold transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Track your journey by checking off tasks in the Roadmap tab. Progress is saved
                locally in your browser.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-gradient-soft">
        <div className="container py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-display text-2xl font-semibold">
                Occasia<span className="text-accent">.</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                College Event Management System · Development Roadmap
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Github className="h-4 w-4" /> Repository
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Roadmap;
