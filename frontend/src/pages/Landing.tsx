import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="container flex items-center justify-between py-4 sm:py-6">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 text-primary-foreground">
            <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-lg bg-accent/20 backdrop-blur">
              <GraduationCap className="h-5 w-5 text-accent" />
            </div>
            <span className="font-display text-xl sm:text-2xl font-semibold">
              Occasia<span className="text-accent">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link to="/auth">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10 sm:h-10 sm:px-4"
              >
                Sign in
              </Button>
            </Link>
            <Link to="/auth/register-college">
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold sm:h-10 sm:px-4"
              >
                <span className="sm:hidden">Register</span>
                <span className="hidden sm:inline">Register college</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground grain pt-24 pb-16 sm:pt-32 sm:pb-24 md:pt-40 md:pb-32">
        <div
          className="absolute inset-0 opacity-30 animate-slow-pan"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, hsl(var(--accent) / 0.4) 0%, transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--primary-glow) / 0.5) 0%, transparent 45%)",
          }}
        />
        <div className="relative container">
          <div className="max-w-4xl">
            <p className="font-mono text-[0.65rem] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-accent mb-4 sm:mb-6">
              College Event Management · Built for institutions
            </p>
            <h1 className="font-display text-4xl sm:text-6xl md:text-8xl font-semibold leading-[1.05] sm:leading-[0.95] tracking-tight">
              Approvals that<br />
              <span className="italic font-light">respect the chain.</span>
            </h1>
            <p className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
              Occasia routes every campus event through the right hands —
              Class Advisor → HOD → ED → Principal — with a clean audit trail
              and zero email back-and-forth.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <Link to="/auth/register-college" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold">
                  Register your college
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/10">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>

          {/* Workflow visual */}
          <div className="mt-12 sm:mt-20 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur p-5 sm:p-8 md:p-10">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-accent mb-5 sm:mb-6">The approval flow</p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
              {["Student", "Advisor", "HOD", "ED", "Principal"].map((step, i) => (
                <div key={step} className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2 sm:px-5 sm:py-3">
                    <p className="font-mono text-[0.55rem] sm:text-[0.6rem] uppercase tracking-widest text-accent/80">
                      Step {i + 1}
                    </p>
                    <p className="font-display font-semibold text-sm sm:text-base">{step}</p>
                  </div>
                  {i < 4 && <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-accent shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-16 sm:py-24">
        <div className="max-w-2xl mb-10 sm:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="editorial-rule" />
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">What you get</p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
            Every role gets a dashboard. Every event gets a paper trail.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Building2,
              title: "Multi-college",
              text: "Each institution registers itself. Data is fully isolated — admins only see their college.",
            },
            {
              icon: Workflow,
              title: "4-tier approvals",
              text: "Advisor → HOD → ED → Principal. Reject at any step ends it. Forward to keep it moving.",
            },
            {
              icon: ShieldCheck,
              title: "Role-based access",
              text: "Six roles: Admin, Principal, ED, HOD, Class Advisor, Student. Each sees what they need.",
            },
            {
              icon: Calendar,
              title: "Event lifecycle",
              text: "Banner uploads, contact info, venue, schedule. Track status in real time.",
            },
            {
              icon: Users,
              title: "Member management",
              text: "Admin assigns roles, promotes faculty, oversees students. Everyone in one place.",
            },
            {
              icon: CheckCircle2,
              title: "Full audit trail",
              text: "Every approval, rejection, and forward is logged with timestamp and comment.",
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-gradient-card p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/5 text-primary mb-4 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-16 sm:pb-24">
        <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-7 sm:p-10 md:p-16 grain shadow-elegant relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle at 80% 50%, hsl(var(--accent) / 0.5) 0%, transparent 50%)",
            }}
          />
          <div className="relative max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-4">Ready to start?</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
              Set up Occasia for your college in under two minutes.
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-base sm:text-lg">
              You'll be the College Admin. Add faculty afterwards. They'll add students. Done.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <Link to="/auth/register-college" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold">
                  Register your college <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/roadmap" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/10">
                  See the roadmap
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-gradient-soft">
        <div className="container py-8 flex flex-wrap justify-between gap-4 items-center text-sm text-muted-foreground">
          <p>
            <span className="font-display text-foreground font-semibold">Occasia<span className="text-accent">.</span></span>
            {" "}— College event management, end to end.
          </p>
          <Link to="/roadmap" className="hover:text-foreground">Development roadmap</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
