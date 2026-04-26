import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  collegeName: z.string().trim().min(2, "College name is required").max(150),
  collegeCode: z
    .string()
    .trim()
    .min(2, "Provide a short unique code")
    .max(20)
    .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, dashes only"),
  address: z.string().trim().max(300).optional(),
  contactPhone: z.string().trim().max(40).optional(),
  adminFullName: z.string().trim().min(2).max(100),
  adminEmail: z.string().trim().email().max(255),
  adminPassword: z.string().min(6, "At least 6 characters").max(72),
});

const RegisterCollege = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    collegeName: "",
    collegeCode: "",
    address: "",
    contactPhone: "",
    adminFullName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);

    setLoading(true);

    try {
      const data = await api.post("/auth/register-college", {
        collegeName: parsed.data.collegeName,
        collegeCode: parsed.data.collegeCode,
        adminName: parsed.data.adminFullName,
        adminEmail: parsed.data.adminEmail,
        adminPassword: parsed.data.adminPassword,
      });

      toast.success("College registered! Please log in with your admin credentials.");
      navigate("/auth");
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        <div className="rounded-2xl border border-border bg-card shadow-elegant p-6 sm:p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-card shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[0.65rem] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground">Step 1 · Institution</p>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold">Register your college</h1>
            </div>
          </div>

          <p className="text-muted-foreground mb-8">
            Set up your college on Occasia. You'll become the College Admin — the only person who can see all activity
            and assign roles to faculty and students.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold border-b border-border pb-2">College Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="collegeName">College name *</Label>
                  <Input id="collegeName" value={form.collegeName} onChange={update("collegeName")} placeholder="Stanford College of Engineering" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collegeCode">Short code *</Label>
                  <Input id="collegeCode" value={form.collegeCode} onChange={update("collegeCode")} placeholder="SCE-2024" className="uppercase" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={form.address} onChange={update("address")} rows={2} placeholder="Street, City, State, PIN" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact phone</Label>
                <Input id="contactPhone" value={form.contactPhone} onChange={update("contactPhone")} placeholder="+91 ..." />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold border-b border-border pb-2">Your Admin Account</h3>
              <div className="space-y-2">
                <Label htmlFor="adminFullName">Full name *</Label>
                <Input id="adminFullName" value={form.adminFullName} onChange={update("adminFullName")} placeholder="Dr. Jane Smith" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email *</Label>
                  <Input id="adminEmail" type="email" value={form.adminEmail} onChange={update("adminEmail")} placeholder="admin@college.edu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password *</Label>
                  <Input id="adminPassword" type="password" value={form.adminPassword} onChange={update("adminPassword")} placeholder="Min 6 characters" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full bg-gradient-hero shadow-elegant">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Register college & create admin
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterCollege;
