import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, MapPin, Package, Settings, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/useAuthStore";
import { cn } from "../../utils/cn";

const NAV_ITEMS = [
  { to: "/account", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/addresses", label: "Address Book", icon: MapPin },
  { to: "/account/orders", label: "Orders", icon: Package },
  { to: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails (expired token, network blip), clear the local session.
    } finally {
      logout();
      toast.success("Logged out");
      navigate("/");
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mb-8 border-b border-line pb-4">
        <span className="eyebrow">My Account</span>
        <h1 className="mt-2 font-display text-3xl text-ink">
          {user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Your Account"}
        </h1>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2.5 border-l-2 px-3 py-2.5 text-sm transition-colors lg:shrink",
                    isActive
                      ? "border-ink font-medium text-ink"
                      : "border-transparent text-ink-soft hover:text-ink"
                  )
                }
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-2.5 border-l-2 border-transparent px-3 py-2.5 text-sm text-ink-soft transition-colors hover:text-danger"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Logout
            </button>
          </nav>
        </aside>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
