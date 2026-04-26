import { workflow } from "@/data/roadmap";
import { ArrowRight } from "lucide-react";

export const WorkflowDiagram = () => {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-8 md:p-12 shadow-card">
      <div className="mb-8 flex items-center gap-4">
        <div className="editorial-rule" />
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Approval Flow
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {workflow.map((step, i) => (
          <div key={step} className="flex items-center gap-3 md:gap-4">
            <div
              className="group relative rounded-xl bg-gradient-hero px-5 py-3 md:px-6 md:py-4 text-primary-foreground shadow-elegant transition-transform hover:-translate-y-1 hover:shadow-glow"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="font-mono text-[0.6rem] uppercase tracking-widest opacity-60">
                Step {i + 1}
              </p>
              <p className="font-display text-base md:text-lg font-semibold">{step}</p>
            </div>
            {i < workflow.length - 1 && (
              <ArrowRight className="h-5 w-5 text-accent" strokeWidth={2.5} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
