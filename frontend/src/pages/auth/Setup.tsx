import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type College = { id: string; name: string; code: string };

const Setup = () => {
  const { profile, refresh } = useAuth();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<College[]>([]);
  const [collegeId, setCollegeId] = useState("");
  const [departments, setDepartments] = useState<{ name: string; branches: string[] }[]>([]);
  const [department, setDepartment] = useState("");
  const [branch, setBranch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/colleges").then((data) => {
      setColleges(data ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!collegeId) {
      setDepartments([]);
      return;
    }
    api.get(`/college/structure?collegeId=${collegeId}`).then((data) => {
      setDepartments(data.departments || []);
    }).catch(() => {});
  }, [collegeId]);

  useEffect(() => {
    if (profile?.college_id) navigate("/app", { replace: true });
  }, [profile, navigate]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !collegeId) {
      toast.error("Pick your college");
      return;
    }
    if (!department || !branch) {
      toast.error("All fields (College, Department, Branch) are necessary");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/users/me/profile", {
        college_id: collegeId,
        department: department || null,
        branch: branch || null,
      });
      await refresh();
      toast.success("You're in.");
      navigate("/app");
    } catch (err: any) {
      toast.error(err.message || "Failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft py-10 px-4 grid place-items-center">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card shadow-elegant p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-gold text-accent-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-semibold">One more step</h1>
        </div>
        <p className="text-muted-foreground mb-6">Pick the college you belong to.</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <Label>College *</Label>
            <Select value={collegeId} onValueChange={setCollegeId}>
              <SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger>
              <SelectContent>
                {colleges.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Department *</Label>
            <Select value={department} onValueChange={(v) => { setDepartment(v); setBranch(""); }}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Branch</Label>
            <Select value={branch} onValueChange={setBranch} disabled={!department}>
              <SelectTrigger><SelectValue placeholder="Select branch (Optional)" /></SelectTrigger>
              <SelectContent>
                {departments.find(d => d.name === department)?.branches.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-hero">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Join college
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-6">
          Or{" "}
          <Link to="/auth/register-college" className="text-primary underline">register a new college</Link>
          {" "}if yours isn't listed.
        </p>
      </div>
    </div>
  );
};

export default Setup;
