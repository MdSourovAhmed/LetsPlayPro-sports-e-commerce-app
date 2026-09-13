import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isBooting = useAuthStore((s) => s.isBooting);

  // Not strictly load-bearing the way ProtectedRoute's check is — isAuthenticated starts
  // false during boot, and this component only redirects when isAuthenticated is true, so
  // there's no false-redirect risk here the way there was in ProtectedRoute. This still
  // waits anyway so a returning logged-in user landing on /login mid-boot doesn't see the
  // login form flash before getting redirected home a moment later.
  if (isBooting) {
    return (
      <div className="container-page py-32 text-center text-sm text-ink-soft">
        Loading…
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
