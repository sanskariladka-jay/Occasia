import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";
import { AppRole, User, Profile, College } from "./types";

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  college: College | null;
  roles: AppRole[];
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  highestRole: AppRole | null;
  setAuth: (token: string, user: User, college?: College) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ROLE_PRIORITY: AppRole[] = ["admin", "principal", "ed", "hod", "advisor", "student"];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [college, setCollege] = useState<College | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Safety check for highestRole
  const highestRole = ROLE_PRIORITY.find((r) => Array.isArray(roles) && roles.includes(r)) ?? null;

  const setAuth = (token: string, userData: any, collegeData?: any) => {
    if (!userData) {
      console.warn("setAuth called with null userData");
      return;
    }
    
    console.log("Setting auth for user:", userData.email);
    localStorage.setItem('occasia_token', token);
    
    const userId = userData.id || userData._id;
    const mappedUser: User = {
        id: userId,
        full_name: userData.full_name || 'User',
        email: userData.email,
        roles: Array.isArray(userData.roles) ? userData.roles : [],
        department: userData.department || null
    };
    
    setUser(mappedUser);
    setRoles(mappedUser.roles);
    
    const mappedProfile: Profile = {
        id: userId,
        full_name: mappedUser.full_name,
        email: mappedUser.email,
        college_id: collegeData?.id || collegeData?._id || userData.college_id || null,
        department: userData.department || null,
        phone: userData.phone || null,
        roles: mappedUser.roles,
        must_change_password: !!userData.must_change_password
    };
    setProfile(mappedProfile);
    
    if (collegeData || userData.college) {
        const c = collegeData || userData.college;
        setCollege({
            id: c.id || c._id,
            name: c.name || 'Unknown College',
            code: c.code || ''
        });
    }
  };

  const loadProfile = async () => {
    console.log("AuthProvider: Loading profile...");
    const token = localStorage.getItem('occasia_token');
    if (!token) {
      console.log("AuthProvider: No token found");
      setLoading(false);
      return;
    }
    try {
        const data = await api.get('/auth/me');
        console.log("AuthProvider: Me data received", data);
        if (data) {
            setAuth(token, data, data.college_id);
        }
    } catch (err) {
        console.error("Auth initialization failed", err);
        localStorage.removeItem('occasia_token');
    } finally {
        setLoading(false);
        console.log("AuthProvider: Loading complete");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const refresh = async () => {
    await loadProfile();
  };

  const signOut = async () => {
    localStorage.removeItem('occasia_token');
    setUser(null);
    setProfile(null);
    setCollege(null);
    setRoles([]);
  };

  const hasRole = (role: AppRole) => Array.isArray(roles) && roles.includes(role);

  return (
    <AuthContext.Provider
      value={{ user, profile, college, roles, loading, refresh, signOut, hasRole, highestRole, setAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "College Admin",
  principal: "Principal",
  ed: "Executive Director",
  hod: "Head of Department",
  advisor: "Class Advisor",
  student: "Student",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  admin: "Manages users, oversees all events and activity in the college.",
  principal: "Final authority on event approvals.",
  ed: "Reviews events forwarded by HODs.",
  hod: "Approves events from their department or forwards them.",
  advisor: "First-line reviewer for student-submitted events.",
  student: "Submits events for approval.",
};
