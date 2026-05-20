import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ReactNode } from "react";
import { hasPermission, Permission } from "../auth/permissions";

export function ProtectedRoute({ children, permission }: { children: ReactNode; permission?: Permission }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (permission && !hasPermission(user?.role, permission)) return <Navigate to="/dashboard" replace />;

  return children;
}
