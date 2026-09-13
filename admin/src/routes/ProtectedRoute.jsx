import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Wrap any route subtree that requires authentication. Pass `minimumRole`
// to additionally gate by role hierarchy (staff < admin < super_admin).
export function ProtectedRoute({ minimumRole }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasRole = useAuthStore((s) => s.hasRole);

  if (!isAuthenticated) {
    // Preserve the attempted destination so login can redirect back after success
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (minimumRole && !hasRole(minimumRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

// Wrap the auth pages themselves so a logged-in admin visiting /login
// gets bounced straight to the dashboard instead of seeing the form again.
export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
