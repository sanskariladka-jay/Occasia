import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth, ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/auth";
import { Profile, EventStatus, AppRole } from "@/lib/types";
import { STATUS_LABELS, getStageInfo, isPending } from "@/lib/events";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  FileCheck,
  Inbox,
  Loader2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

type EventRow = {
  _id: string;
  id: string;
  title: string;
  status: EventStatus;
  start_date: string;
  createdAt: string;
  creator_id: { _id: string, full_name: string };
  description: string;
};

const Dashboard = () => {
  const { profile, college, highestRole, roles, hasRole } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/events")
      .then((data) => {
        setEvents(data ?? []);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Stats
  const total = events.length;
  const approved = events.filter((e) => e.status === "approved").length;
  const pending = events.filter((e) => isPending(e.status)).length;
  const rejected = events.filter((e) => e.status === "rejected").length;

  // For approver roles: actionable events
  const approverRole: AppRole | null = (["principal", "ed", "hod", "advisor"] as AppRole[]).find((r) =>
    roles.includes(r)
  ) ?? null;

  const actionable = events.filter((e) => {
    if (!approverRole) return false;
    const stage = getStageInfo(e.status);
    return stage?.role === approverRole;
  });

  const myEvents = events.filter((e) => (e.creator_id?._id || e.creator_id) === profile?.id);

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
            {format(new Date(), "EEEE · MMMM d, yyyy")}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight break-words">
            {college?.name}
          </h1>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-muted-foreground mt-2">
            Hello, {profile?.full_name?.split(" ")[0]}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
            {highestRole ? ROLE_DESCRIPTIONS[highestRole] : "Welcome to Occasia."}
          </p>
        </div>
        <Link to="/app/events/new" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto bg-gradient-hero shadow-elegant">
            <CalendarPlus className="mr-2 h-4 w-4" /> Submit event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Total events" value={total} accent="primary" />
        <StatCard icon={Clock} label="In approval" value={pending} accent="info" />
        <StatCard icon={CheckCircle2} label="Approved" value={approved} accent="success" />
        <StatCard icon={XCircle} label="Rejected" value={rejected} accent="destructive" />
      </div>

      {/* Approver inbox */}
      {approverRole && (
        <section>
          <SectionHeader
            label="Awaiting your action"
            title={`${ROLE_LABELS[approverRole]} inbox`}
            count={actionable.length}
          />
          {actionable.length === 0 ? (
            <EmptyState icon={Inbox} text="You're all caught up. No events waiting on you." />
          ) : (
            <div className="grid gap-3">
              {actionable.map((e) => (
                <EventRowCard key={e._id || e.id} event={e} actionable />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Admin oversight */}
      {hasRole("admin") && (
        <section>
          <SectionHeader label="College overview" title="Recent activity" count={Math.min(5, events.length)} />
          {events.length === 0 ? (
            <EmptyState icon={Inbox} text="No events submitted yet." />
          ) : (
            <div className="grid gap-3">
              {events.slice(0, 5).map((e) => (
                <EventRowCard key={e._id || e.id} event={e} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* My submissions */}
      <section>
        <SectionHeader label="Your submissions" title="My events" count={myEvents.length} />
        {myEvents.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            text="You haven't submitted an event yet."
            cta={
              <Link to="/app/events/new">
                <Button size="sm">Submit your first event</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3">
            {myEvents.slice(0, 5).map((e) => (
              <EventRowCard key={e._id || e.id} event={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: number;
  accent: "primary" | "info" | "success" | "destructive";
}) => {
  const accentClasses = {
    primary: "text-primary bg-primary/10",
    info: "text-info bg-info/10",
    success: "text-success bg-success/10",
    destructive: "text-destructive bg-destructive/10",
  };
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-4 sm:p-6 shadow-card">
      <div className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-lg mb-3 ${accentClasses[accent]}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <p className="font-display text-2xl sm:text-3xl font-semibold">{value}</p>
      <p className="font-mono text-[0.65rem] sm:text-xs uppercase tracking-[0.15em] text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

const SectionHeader = ({ label, title, count }: { label: string; title: string; count: number }) => (
  <div className="flex items-end justify-between mb-4">
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <h2 className="font-display text-2xl font-semibold mt-1">{title}</h2>
    </div>
    <span className="font-mono text-sm text-muted-foreground">{count}</span>
  </div>
);

const EventRowCard = ({ event, actionable }: { event: EventRow; actionable?: boolean }) => (
  <Link
    to={`/app/events/${event._id || event.id}`}
    className={`group flex items-center gap-4 rounded-xl border bg-gradient-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant ${
      actionable ? "border-accent/40" : "border-border"
    }`}
  >
    <div className="flex-1 min-w-0">
      <p className="font-semibold truncate group-hover:text-primary transition-colors">{event.title}</p>
      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{event.description}</p>
      <p className="text-xs text-muted-foreground mt-2 font-mono">
        Event date: {format(new Date(event.start_date), "MMM d, yyyy")}
      </p>
    </div>
    <StatusBadge status={event.status} />
  </Link>
);

const EmptyState = ({
  icon: Icon,
  text,
  cta,
}: {
  icon: any;
  text: string;
  cta?: React.ReactNode;
}) => (
  <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
    <div className="grid h-12 w-12 mx-auto place-items-center rounded-xl bg-muted text-muted-foreground mb-3">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-muted-foreground">{text}</p>
    {cta && <div className="mt-4">{cta}</div>}
  </div>
);

export default Dashboard;
