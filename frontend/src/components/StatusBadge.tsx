import { cn } from "@/lib/utils";
import { EventStatus, STATUS_BADGE, STATUS_LABELS } from "@/lib/events";

export const StatusBadge = ({ status, className }: { status: EventStatus; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap",
      STATUS_BADGE[status],
      className
    )}
  >
    {STATUS_LABELS[status]}
  </span>
);
