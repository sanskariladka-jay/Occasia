import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "@/lib/api";
import { AppRole } from "@/lib/types";
import { useAuth } from "@/lib/auth";

const STAFF_ROLES: AppRole[] = ["admin", "principal", "ed", "hod", "advisor"];
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(150),
  description: z.string().trim().min(10, "Add a description").max(2000),
  venue: z.string().trim().max(150).optional(),
  startDate: z.string().min(1, "Pick a start date"),
  endDate: z.string().optional(),
  organizerName: z.string().trim().min(2, "Organizer name is required"),
  contactName: z.string().trim().max(100).optional(),
  contactEmail: z.string().trim().email().or(z.literal("")).optional(),
  contactPhone: z.string().trim().max(40).optional(),
});

type EventMember = { name: string; department: string };

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AI&DS", "MBA", "MCA", "Other"];

const NewEvent = () => {
  const navigate = useNavigate();
  const { user, college, roles } = useAuth();
  const isStaff = useMemo(() => STAFF_ROLES.some((r) => roles.includes(r)), [roles]);
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    startDate: "",
    endDate: "",
    organizerName: user?.full_name || "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [members, setMembers] = useState<EventMember[]>([]);

  const addMember = () => setMembers(p => [...p, { name: "", department: "CSE" }]);
  const removeMember = (i: number) => setMembers(p => p.filter((_, idx) => idx !== i));
  const updateMember = (i: number, field: keyof EventMember, val: string) => {
    setMembers(p => p.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  };

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Banner must be under 5MB");
      return;
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setBannerFile(null);
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !college) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const data = await api.post("/events", {
        title: parsed.data.title,
        description: parsed.data.description,
        venue: parsed.data.venue || null,
        start_date: new Date(parsed.data.startDate).toISOString(),
        end_date: parsed.data.endDate ? new Date(parsed.data.endDate).toISOString() : null,
        organizer_name: parsed.data.organizerName,
        members: members.filter(m => m.name.trim() !== ""),
        contact_name: parsed.data.contactName || null,
        contact_email: parsed.data.contactEmail || null,
        contact_phone: parsed.data.contactPhone || null,
        banner_url: null, // Banner upload to be implemented later or via Base64
      });

      toast.success(isStaff ? "Event published — auto-approved" : "Event submitted for approval");
      navigate(`/app/events/${data._id || data.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
          {isStaff ? "Publish event" : "New submission"}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold">
          {isStaff ? "Publish an event" : "Submit an event"}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          {isStaff
            ? "As a staff member, your event is approved instantly — no further steps required."
            : "Fill in the details. It'll move through Class Advisor → HOD → ED → Principal."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Banner */}
        <div className="space-y-2">
          <Label>Event banner</Label>
          {bannerPreview ? (
            <div className="relative rounded-xl overflow-hidden aspect-[16/9] border border-border">
              <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-foreground/80 text-background backdrop-blur"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-[16/9] border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
              <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="font-medium text-sm">Upload banner</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="title">Event title *</Label>
                <Input id="title" value={form.title} onChange={update("title")} placeholder="Annual Tech Symposium 2026" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="organizerName">Organizer name *</Label>
                <Input id="organizerName" value={form.organizerName} onChange={update("organizerName")} placeholder="Department of CSE / Student Union" required />
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={update("description")}
            rows={5}
            placeholder="What's the event about? Who's it for? What's the budget? Expected attendance?"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start date & time *</Label>
            <Input id="startDate" type="datetime-local" value={form.startDate} onChange={update("startDate")} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End date & time</Label>
            <Input id="endDate" type="datetime-local" value={form.endDate} onChange={update("endDate")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input id="venue" value={form.venue} onChange={update("venue")} placeholder="Main Auditorium, Block A" />
        </div>

        {/* Members */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="font-display text-lg font-semibold">Team members / Volunteers</h3>
            <Button type="button" variant="outline" size="sm" onClick={addMember} className="h-8 text-xs">
                + Add Member
            </Button>
          </div>
          
          {members.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-2">No team members added yet.</p>
          )}

          <div className="space-y-3">
            {members.map((member, i) => (
                <div key={i} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                    <div className="flex-1">
                        <Input 
                            placeholder="Member name" 
                            value={member.name}
                            onChange={(e) => updateMember(i, "name", e.target.value)}
                        />
                    </div>
                    <div className="w-32 sm:w-48">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={member.department}
                            onChange={(e) => updateMember(i, "department", e.target.value)}
                        >
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeMember(i)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold border-b border-border pb-2">Point of contact</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="contactName">Name</Label>
              <Input id="contactName" value={form.contactName} onChange={update("contactName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input id="contactEmail" type="email" value={form.contactEmail} onChange={update("contactEmail")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input id="contactPhone" value={form.contactPhone} onChange={update("contactPhone")} />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="sm:flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="sm:flex-1 bg-gradient-hero shadow-elegant">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isStaff ? "Publish event" : "Submit for approval"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewEvent;
