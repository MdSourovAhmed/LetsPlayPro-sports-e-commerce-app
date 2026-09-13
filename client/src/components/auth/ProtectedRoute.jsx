import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isBooting = useAuthStore((s) => s.isBooting);
  const location = useLocation();

  // This is the actual fix for the "persistent session doesn't work" bug: without this
  // check, a returning user's refresh-token exchange (kicked off in useAuthBoot.js) hasn't
  // resolved yet on the very first render after a reload — isAuthenticated is still false at
  // that instant, not because the session is invalid, but because we haven't finished
  // checking. Redirecting to /login on that stale "false" was the bug. Waiting here for
  // isBooting to resolve means this component never makes an auth decision on a value that
  // hasn't been confirmed yet.
  if (isBooting) {
    return (
      <div className="container-page py-32 text-center text-sm text-ink-soft">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
