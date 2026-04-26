import { AppRole, EventStatus } from "./types";

export const STATUS_LABELS: Record<EventStatus, string> = {
  pending: "Pending",
  advisor_pending: "Advisor Review",
  hod_pending: "HOD Review",
  ed_pending: "ED Review",
  principal_pending: "Principal Review",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  advisor_pending: "bg-blue-100 text-blue-700 border-blue-200",
  hod_pending: "bg-indigo-100 text-indigo-700 border-indigo-200",
  ed_pending: "bg-violet-100 text-violet-700 border-violet-200",
  principal_pending: "bg-purple-100 text-purple-700 border-purple-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
};

export type ApprovalStage = {
    stage: EventStatus;
    label: string;
    role: AppRole;
    nextStage: EventStatus | null;
};

export const APPROVAL_FLOW: ApprovalStage[] = [
  { stage: "pending", label: "Submission", role: "advisor", nextStage: "advisor_pending" },
  { stage: "advisor_pending", label: "Class Advisor", role: "advisor", nextStage: "hod_pending" },
  { stage: "hod_pending", label: "HOD", role: "hod", nextStage: "ed_pending" },
  { stage: "ed_pending", label: "ED", role: "ed", nextStage: "principal_pending" },
  { stage: "principal_pending", label: "Principal", role: "principal", nextStage: "approved" },
  { stage: "approved", label: "Approved", role: "admin", nextStage: null },
];

export const getStageLabel = (status: EventStatus) =>
  APPROVAL_FLOW.find((s) => s.stage === status)?.label || status;

export const isPending = (status: EventStatus) => 
  status.includes("_pending") || status === "pending";

export const STAGE_INDEX: Record<string, number> = {
  pending: 0,
  advisor_pending: 1,
  hod_pending: 2,
  ed_pending: 3,
  principal_pending: 4,
  approved: 5,
  rejected: 0,
  cancelled: 0,
};

export const getStageInfo = (status: EventStatus) => {
  const index = STAGE_INDEX[status] ?? 0;
  const current = APPROVAL_FLOW.find((s) => s.stage === status);
  
  return {
    index,
    label: current?.label || "Unknown",
    role: current?.role || null,
    nextStage: current?.nextStage || null,
    isComplete: status === "approved",
    isRejected: status === "rejected",
    isCancelled: status === "cancelled",
  };
};
