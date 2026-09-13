import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store/uiStore';

export function DashboardLayout() {
  const { theme, isMobileNavOpen, openMobileNav, closeMobileNav } = useUIStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface dark:bg-surface-dark">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile nav drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 dark:bg-black/60"
            onClick={closeMobileNav}
            aria-hidden="true"
          />
          <div className="relative z-50 h-full w-64">
            <button
              onClick={closeMobileNav}
              aria-label="Close navigation menu"
              className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-muted hover:bg-surface dark:hover:bg-surface-dark"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar mobile onNavigate={closeMobileNav} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenMobileNav={openMobileNav} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
