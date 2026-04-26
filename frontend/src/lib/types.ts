export type AppRole = 'admin' | 'principal' | 'ed' | 'hod' | 'advisor' | 'student';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  college_id: string | null;
  department: string | null;
  phone?: string | null;
  roles: AppRole[];
  must_change_password?: boolean;
}

export interface College {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  roles: AppRole[];
  department?: string | null;
}

export type EventStatus = 
  | "pending" // Initial submission
  | "advisor_pending" 
  | "hod_pending" 
  | "ed_pending" 
  | "principal_pending" 
  | "approved" 
  | "rejected" 
  | "cancelled";

export type ApprovalAction = "submitted" | "approved" | "rejected" | "forwarded" | "cancelled";
