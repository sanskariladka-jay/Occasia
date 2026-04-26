import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  requireRoles?: AppRole[];
}

export const RequireAuth = ({ children, requireRoles }: Props) => {
  const { user, loading, roles, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Has account but no college yet — go register/join
  if (!profile?.college_id) {
    return <Navigate to="/auth/setup" replace />;
  }


  // Force first-login password change (members created by admin/faculty)
  if (profile?.must_change_password && location.pathname !== "/auth/change-password") {
    return <Navigate to="/auth/change-password" replace />;
  }

  if (requireRoles && requireRoles.length > 0) {
    const ok = roles.some((r) => requireRoles.includes(r));
    if (!ok) {
      return <Navigate to="/app" replace />;
    }
  }

  return <>{children}</>;
};
