
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/use-role";

interface ProtectedRouteProps {
  requiredRole?: "admin" | "professional" | "client";
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useRole();
  const location = useLocation();

  // Show loading state while checking authentication and role
  if (authLoading || roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <p>Carregando...</p>
    </div>;
  }

  // If user is not logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && role !== requiredRole) {
    // Redirect based on user's role
    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (role === "professional") {
      return <Navigate to="/professional" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
