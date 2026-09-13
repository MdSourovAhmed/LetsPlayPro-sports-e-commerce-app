import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '@/store/uiStore';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ mobile = false, onNavigate }) {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const collapsed = isSidebarCollapsed && !mobile;

  return (
    <aside
      className={clsx(
        'flex h-full flex-col border-r border-border dark:border-border-dark bg-panel dark:bg-panel-dark',
        'transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 font-display text-sm font-bold text-white">
          LP
        </div>
        {!collapsed && (
          <span className="font-display text-sm font-semibold text-ink dark:text-ink-dark">
            LetsPlayPro
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-thin" aria-label="Main">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'text-muted hover:bg-surface hover:text-ink dark:text-muted-dark dark:hover:bg-surface-dark dark:hover:text-ink-dark'
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>{label}</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-panel-dark dark:border dark:border-border-dark">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {!mobile && (
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center gap-2 border-t border-border dark:border-border-dark px-4 py-3 text-sm text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      )}
    </aside>
  );
}
