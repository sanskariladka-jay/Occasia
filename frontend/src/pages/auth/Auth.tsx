import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading: authLoading, setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (profile?.must_change_password) navigate("/auth/change-password", { replace: true });
      else if (profile?.college_id) navigate("/app", { replace: true });
      else navigate("/auth/setup", { replace: true });
    }
  }, [user, profile, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const data = await api.post("/auth/login", {
        email: parsed.data.email,
        password: parsed.data.password,
      });
      setAuth(data.token, data.user, data.user.college);
      
      if (data.user.must_change_password) {
        toast.success("Welcome — please set your own password");
        navigate("/auth/change-password", { replace: true });
        return;
      }

      toast.success("Welcome back");
      const dest = (location.state as { from?: string } | null)?.from ?? "/app";
      navigate(dest, { replace: true });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:block bg-gradient-hero overflow-hidden grain">
        <div
          className="absolute inset-0 opacity-40 animate-slow-pan"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, hsl(var(--accent) / 0.4) 0%, transparent 40%), radial-gradient(circle at 70% 70%, hsl(var(--primary-glow) / 0.4) 0%, transparent 40%)",
          }}
        />
        <div className="relative h-full flex flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-3 w-fit">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 backdrop-blur">
              <GraduationCap className="h-5 w-5 text-accent" />
            </div>
            <span className="font-display text-2xl font-semibold">Occasia<span className="text-accent">.</span></span>
          </Link>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-4">For institutions</p>
            <h2 className="font-display text-5xl font-semibold leading-tight max-w-md">
              The event approval workflow your college actually deserves.
            </h2>
            <p className="mt-6 text-primary-foreground/70 max-w-md">
              Multi-tier approvals, role-aware dashboards, full audit trail. Built for the rhythm of academic life.
            </p>
          </div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground/50">
            © Occasia · College Event Management
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-semibold">Occasia<span className="text-accent">.</span></span>
          </div>

          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Sign in</p>
          <h1 className="font-display text-4xl font-semibold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">
            Continue managing your college events.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-hero shadow-elegant">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Sign in
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border text-sm">
            <p className="text-muted-foreground text-center">
              Setting up Occasia for your institution?{" "}
              <Link to="/auth/register-college" className="text-primary font-medium hover:underline">
                Register your college
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
