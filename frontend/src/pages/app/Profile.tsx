import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth, ROLE_LABELS } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { profile, college, roles, refresh } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [department, setDepartment] = useState(profile?.department ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const isStudent = roles.includes("student") && !roles.includes("admin") && !roles.includes("advisor") && !roles.includes("hod") && !roles.includes("ed") && !roles.includes("principal");
  // More reliably:
  const isOnlyStudent = roles.length === 1 && roles[0] === "student";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await api.patch("/users/me/profile", {
        fullName: fullName.trim(),
        department: department.trim() || null,
        phone: phone.trim() || null,
      });
      setLoading(false);
      toast.success("Profile updated");
      await refresh();
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-2xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Settings</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold">Your profile</h1>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Membership</p>
        <p className="font-display text-xl font-semibold">{college?.name}</p>
        <p className="text-sm text-muted-foreground">{college?.code}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {roles.map((r) => (
            <span key={r} className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-foreground">
              {ROLE_LABELS[r]}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl font-semibold">Account details</h2>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile?.email ?? ""} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={isOnlyStudent} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" disabled={isOnlyStudent} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." disabled={isOnlyStudent} />
        </div>
        {isOnlyStudent && (
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
            Note: As a student, your profile can only be updated by the college faculty or admin.
          </p>
        )}
        <Button type="submit" disabled={loading || isOnlyStudent} className="w-full bg-gradient-hero">
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isOnlyStudent ? "Profile is read-only" : "Save changes"}
        </Button>
      </form>
    </div>
  );
};

export default Profile;
