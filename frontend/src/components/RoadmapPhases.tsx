import { Check, Sparkles } from "lucide-react";
import { phases } from "@/data/roadmap";
import { cn } from "@/lib/utils";

interface Props {
  completed: Set<string>;
  toggle: (id: string) => void;
}

export const RoadmapPhases = ({ completed, toggle }: Props) => {
  return (
    <div className="space-y-16">
      {phases.map((phase, idx) => {
        const phaseTaskIds = phase.tasks.map((_, i) => `t-${phase.id}-${i}`);
        const phaseDone = phaseTaskIds.filter((id) => completed.has(id)).length;
        const phasePct = Math.round((phaseDone / phaseTaskIds.length) * 100);

        return (
          <section
            key={phase.id}
            className="relative animate-fade-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Vertical rule */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/15 to-transparent md:left-8" />

            <div className="relative pl-20 md:pl-28">
              {/* Phase marker */}
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div
                  className={cn(
                    "relative grid h-12 w-12 md:h-16 md:w-16 place-items-center rounded-full font-display text-xl md:text-2xl font-bold shadow-elegant transition-all",
                    phasePct === 100
                      ? "bg-gradient-gold text-accent-foreground shadow-gold"
                      : "bg-gradient-hero text-primary-foreground"
                  )}
                >
                  {phasePct === 100 ? <Check className="h-7 w-7" strokeWidth={3} /> : phase.id}
                  {phasePct === 100 && (
                    <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-accent" />
                  )}
                </div>
              </div>

              {/* Header */}
              <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Phase {String(phase.id).padStart(2, "0")} · {phase.weeks} · {phase.duration}
                </p>
              </div>
              <h3 className="mb-6 font-display text-3xl md:text-4xl font-semibold leading-tight text-foreground">
                {phase.title}
              </h3>

              {/* Phase progress */}
              <div className="mb-6 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-hero transition-all duration-700"
                    style={{ width: `${phasePct}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {phaseDone}/{phaseTaskIds.length}
                </span>
              </div>

              {/* Tasks */}
              <ul className="space-y-3">
                {phase.tasks.map((task, i) => {
                  const id = `t-${phase.id}-${i}`;
                  const isDone = completed.has(id);
                  return (
                    <li key={id}>
                      <button
                        onClick={() => toggle(id)}
                        className={cn(
                          "group flex w-full items-start gap-4 rounded-xl border bg-gradient-card p-4 text-left transition-all hover:shadow-card hover:-translate-y-0.5",
                          isDone ? "border-success/30 bg-success/5" : "border-border"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-all",
                            isDone
                              ? "border-success bg-success text-success-foreground"
                              : "border-border group-hover:border-primary"
                          )}
                        >
                          {isDone && <Check className="h-3.5 w-3.5" strokeWidth={3.5} />}
                        </span>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "font-semibold leading-snug text-foreground transition-colors",
                              isDone && "text-muted-foreground line-through"
                            )}
                          >
                            {task.title}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Milestone */}
              <div className="mt-6 flex items-start gap-4 rounded-xl border border-accent/30 bg-accent/10 p-5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-gold shadow-gold">
                  <Check className="h-5 w-5 text-accent-foreground" strokeWidth={3} />
                </div>
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent-foreground/70">
                    Milestone
                  </p>
                  <p className="font-display text-lg font-semibold text-foreground">
                    {phase.milestone.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {phase.milestone.description}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
