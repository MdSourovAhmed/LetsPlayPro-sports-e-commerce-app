import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { authApi } from '@/api/authApi';

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Dashboard', to: '/' }];
  return [
    { label: 'Dashboard', to: '/' },
    ...segments.map((seg, i) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      to: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ];
}

export function Header({ onOpenMobileNav }) {
  const breadcrumbs = useBreadcrumbs();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUIStore();
  const { user, logout: clearLocalSession } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — an expired/already-invalid token here shouldn't block the user from
      // clearing their local session and leaving. The refresh token still gets revoked
      // server-side whenever this call does succeed, which is what actually matters for
      // "can a leaked token be reused after logout".
    } finally {
      clearLocalSession();
      toast.success('Logged out');
      navigate('/login', { replace: true });
    }
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="rounded-md p-1.5 text-muted hover:bg-surface dark:hover:bg-surface-dark lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:block">
          <ol className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.to} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted dark:text-muted-dark">/</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-ink dark:text-ink-dark">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.to}
                    className="text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className="rounded-md p-2 text-muted hover:bg-surface dark:hover:bg-surface-dark"
        >
          {theme === 'light' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-md p-1.5 hover:bg-surface dark:hover:bg-surface-dark"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="hidden text-sm font-medium text-ink dark:text-ink-dark sm:inline">
              {user?.name || 'Admin'}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-muted sm:inline" />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark py-1 shadow-panel"
            >
              <div className="border-b border-border dark:border-border-dark px-3 py-2">
                <p className="text-sm font-medium text-ink dark:text-ink-dark">{user?.name}</p>
                <p className="text-xs text-muted dark:text-muted-dark">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface dark:text-ink-dark dark:hover:bg-surface-dark"
              >
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface dark:text-ink-dark dark:hover:bg-surface-dark"
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
