import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth, ROLE_LABELS } from "@/lib/auth";
import { 
  AppRole, 
  EventStatus, 
  ApprovalAction, 
  Profile, 
  College 
} from "@/lib/types";
import {
  APPROVAL_FLOW,
  STAGE_INDEX,
  STATUS_LABELS,
  getStageInfo,
} from "@/lib/events";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CircleCheck,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type EventRow = {
  _id: string;
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  start_date: string;
  end_date?: string | null;
  venue: string | null;
  banner_url: string | null;
  creator_id: { _id: string, full_name: string, email: string, department?: string };
  createdAt: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  organizer_name?: string | null;
  members?: { name: string; department: string }[] | null;
  cancellation_reason?: string | null;
};

type ApprovalRow = {
  _id: string;
  id: string;
  actor_id: { _id: string, full_name: string, email: string };
  actor_role: AppRole;
  action: ApprovalAction;
  comment: string | null;
  createdAt: string;
};

const ACTION_LABELS: Record<ApprovalAction, string> = {
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  forwarded: "Forwarded",
  cancelled: "Cancelled",
};

const ACTION_STYLES: Record<ApprovalAction, string> = {
  submitted: "bg-info/10 text-info border-info/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  forwarded: "bg-primary/10 text-primary border-primary/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, roles, hasRole } = useAuth();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState("");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { event: ev, approvals: apps } = await api.get(`/events/${id}`);
      setEvent(ev);
      setApprovals(apps);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!event || !user) {
    return <div className="p-10 text-center text-muted-foreground">Event not found.</div>;
  }

  const stageInfo = getStageInfo(event.status);
  const isCreator = (event.creator_id?._id || event.creator_id) === user.id;
  const canActAtStage = stageInfo && roles.includes(stageInfo.role);
  const canCancel = (isCreator || hasRole("admin")) && event.status !== "approved" && event.status !== "rejected" && event.status !== "cancelled";
  const stageIdx = STAGE_INDEX[event.status];

  const recordApproval = async (action: ApprovalAction, nextStatus: EventStatus | null) => {
    if (!stageInfo && action !== "cancelled") return;
    setActionLoading(true);
    try {
      await api.patch(`/events/${event._id || event.id}/status`, {
        status: nextStatus || event.status,
        action,
        comment: comment.trim() || null,
      });

      toast.success(`Event ${action}`);
      setComment("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => {
    if (!stageInfo) return;
    recordApproval("approved", stageInfo.nextStage);
  };
  const handleForward = () => {
    if (!stageInfo) return;
    recordApproval("forwarded", stageInfo.nextStage);
  };
  const handleReject = () => recordApproval("rejected", "rejected");
  const handleCancel = () => recordApproval("cancelled", "cancelled");

  const creator = event.creator_id;

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Banner */}
      {event.banner_url ? (
        <div className="rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] shadow-elegant">
          <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="rounded-2xl aspect-[16/9] sm:aspect-[21/9] bg-gradient-hero grid place-items-center shadow-elegant">
          <span className="font-display text-5xl sm:text-7xl text-primary-foreground/30">{event.title[0]}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Event #{ (event._id || event.id).slice(0, 8) }
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight break-words">{event.title}</h1>
        </div>
        <StatusBadge status={event.status} className="self-start text-sm py-1.5 px-4" />
      </div>

      {/* Approval progress bar */}
      <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Approval progress</p>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {APPROVAL_FLOW.map((stage, i) => {
            const passed = stageIdx > (i + 1);
            const current = stageIdx === (i + 1);
            const isRejected = event.status === "rejected" && (i + 1) >= (stageIdx === 0 ? 0 : stageIdx);
            return (
              <div key={stage.stage} className="flex flex-col items-center gap-2">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold transition-all ${
                    isRejected
                      ? "bg-destructive/20 text-destructive"
                      : passed
                      ? "bg-success text-success-foreground shadow-card"
                      : current
                      ? "bg-gradient-hero text-primary-foreground shadow-elegant ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {passed ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
                </div>
                <p className="text-[0.65rem] font-mono uppercase tracking-wider text-center text-muted-foreground">
                  {ROLE_LABELS[stage.role].split(" ").slice(-1)[0]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold mb-3">About this event</h2>
            <p className="whitespace-pre-line text-muted-foreground leading-relaxed">{event.description}</p>
          </section>

          {/* Approval Timeline */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold mb-4">Approval history</h2>
            <ol className="space-y-4 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {approvals.map((a) => {
                const actor = a.actor_id;
                return (
                  <li key={a._id || a.id} className="flex gap-4 relative">
                    <div
                      className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 bg-card font-mono text-xs ${
                        a.action === "approved" || a.action === "forwarded"
                          ? "border-success text-success"
                          : a.action === "rejected"
                          ? "border-destructive text-destructive"
                          : a.action === "cancelled"
                          ? "border-muted-foreground text-muted-foreground"
                          : "border-info text-info"
                      }`}
                    >
                      {a.action === "approved" || a.action === "forwarded" ? (
                        <Check className="h-4 w-4" strokeWidth={3} />
                      ) : a.action === "rejected" || a.action === "cancelled" ? (
                        <X className="h-4 w-4" strokeWidth={3} />
                      ) : (
                        <CircleCheck className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ACTION_STYLES[a.action]}`}
                        >
                          {ACTION_LABELS[a.action]}
                        </span>
                        <p className="font-semibold">{actor?.full_name ?? "Member"}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {ROLE_LABELS[a.actor_role as AppRole]}
                        </p>
                      </div>
                      {a.comment && (
                        <p className="mt-1.5 text-sm text-muted-foreground italic">"{a.comment}"</p>
                      )}
                      <p className="font-mono text-[0.7rem] text-muted-foreground mt-1">
                        {format(new Date(a.createdAt), "MMM d, yyyy · h:mm a")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Team Members */}
          {event.members && event.members.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-xl font-semibold mb-4">Team members & Volunteers</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {event.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 border border-accent/20">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm leading-tight truncate">{m.name}</p>
                      <p className="text-[0.65rem] font-mono uppercase tracking-wider text-muted-foreground">{m.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Action panel */}
          {(canActAtStage || canCancel) && (
            <section className="rounded-2xl border-2 border-accent/40 bg-accent/5 p-6 shadow-card">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">Take action</h2>
                {canActAtStage && stageInfo && (
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Acting as {ROLE_LABELS[stageInfo.role]}
                  </p>
                )}
              </div>

              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Add a comment (optional)..."
                className="mb-4 bg-card"
              />

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                {canActAtStage && stageInfo && (
                  <>
                    <Button
                      onClick={stageInfo.nextStage === "approved" ? handleApprove : handleForward}
                      disabled={actionLoading}
                      className="w-full sm:w-auto bg-success hover:bg-success/90 text-success-foreground"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : stageInfo.nextStage === "approved" ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-2" />
                      )}
                      <span className="truncate">
                        {stageInfo.nextStage === "approved" ? "Final approval" : `Forward to ${ROLE_LABELS[APPROVAL_FLOW.find((s) => s.stage === stageInfo.nextStage)?.role ?? "principal"]}`}
                      </span>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={actionLoading} className="w-full sm:w-auto">
                          <X className="h-4 w-4 mr-2" /> Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject this event?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This ends the approval flow. The creator will see your comment as the rejection reason.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Back</AlertDialogCancel>
                          <AlertDialogAction onClick={handleReject} className="bg-destructive hover:bg-destructive/90">
                            Confirm rejection
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}

                {canCancel && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" disabled={actionLoading} className="w-full sm:w-auto">
                        Cancel event
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The event will be marked as cancelled. Add a reason in the comment box if you'd like.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep event</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel}>Confirm cancellation</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Details</p>
            <dl className="space-y-3 text-sm">
              <Detail icon={Calendar} label="Starts" value={format(new Date(event.start_date), "MMM d, yyyy · h:mm a")} />
              {event.end_date && (
                <Detail icon={Calendar} label="Ends" value={format(new Date(event.end_date), "MMM d, yyyy · h:mm a")} />
              )}
              {event.venue && <Detail icon={MapPin} label="Venue" value={event.venue} />}
              {event.organizer_name && <Detail icon={User} label="Organizer" value={event.organizer_name} />}
              {event.contact_name && <Detail icon={User} label="Contact" value={event.contact_name} />}
              {event.contact_email && <Detail icon={Mail} label="Email" value={event.contact_email} />}
              {event.contact_phone && <Detail icon={Phone} label="Phone" value={event.contact_phone} />}
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Submitted by</p>
            <p className="font-semibold">{creator?.full_name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{creator?.department}</p>
            <p className="text-xs text-muted-foreground font-mono mt-2">
              {format(new Date(event.createdAt), "MMM d, yyyy")}
            </p>
          </div>

          {event.cancellation_reason && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-destructive mb-2">Cancellation reason</p>
              <p className="text-sm">{event.cancellation_reason}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

const Detail = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  </div>
);

export default EventDetail;
