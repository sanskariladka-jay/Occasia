import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, profile, refresh, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (!profile) return;

    setBusy(true);
    try {
      await api.post("/users/me/change-password", { password });
      setBusy(false);
      toast.success("Password updated. Welcome aboard.");
      await refresh();
      navigate("/app", { replace: true });
    } catch (err: any) {
      setBusy(false);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-semibold">
            Occasia<span className="text-accent">.</span>
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">
                First sign-in
              </p>
              <h1 className="font-display text-2xl font-semibold">Set your own password</h1>
              <p className="text-sm text-muted-foreground mt-1">
                For security, please replace the temporary password your admin sent you.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-pass">New password</Label>
              <Input
                id="new-pass"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pass">Confirm password</Label>
              <Input
                id="confirm-pass"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your new password"
                required
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-gradient-hero shadow-elegant">
              {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
              Save and continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
