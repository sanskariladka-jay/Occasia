import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { EventStatus, STATUS_LABELS } from "@/lib/events";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarPlus, Loader2, Search } from "lucide-react";
import { format } from "date-fns";

type EventRow = {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  start_date: string;
  banner_url: string | null;
  created_by: string;
  created_at: string;
};

const EventsList = () => {
  const { college } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");

  useEffect(() => {
    setLoading(true);
    api.get("/events")
      .then((data) => {
        setEvents(data ?? []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [events, search, statusFilter]);

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">All events</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">Event registry</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">Every event submitted in your college.</p>
        </div>
        <Link to="/app/events/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-gradient-hero shadow-elegant">
            <CalendarPlus className="mr-2 h-4 w-4" /> Submit event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 no-transition">
        <div className="relative flex-1 sm:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EventStatus | "all")}>
          <SelectTrigger className="w-full sm:w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent className="no-transition">
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(STATUS_LABELS) as EventStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-16 text-center">
          <p className="text-muted-foreground">No events match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <Link
              key={e.id}
              to={`/app/events/${e.id}`}
              className="group rounded-2xl overflow-hidden border border-border bg-gradient-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="aspect-[16/9] bg-gradient-hero relative overflow-hidden">
                {e.banner_url ? (
                  <img
                    src={e.banner_url}
                    alt={e.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-primary-foreground/40">
                    <span className="font-display text-5xl">{e.title[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={e.status} />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {e.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{e.description}</p>
                <p className="text-xs text-muted-foreground font-mono mt-3">
                  {format(new Date(e.start_date), "MMM d, yyyy")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;
