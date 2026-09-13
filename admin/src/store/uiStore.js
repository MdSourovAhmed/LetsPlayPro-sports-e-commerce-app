import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' | 'dark'
      isSidebarCollapsed: false,
      isMobileNavOpen: false,

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      setTheme: (theme) => set({ theme }),

      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      openMobileNav: () => set({ isMobileNavOpen: true }),
      closeMobileNav: () => set({ isMobileNavOpen: false }),
    }),
    {
      name: 'admin-ui',
      partialize: (state) => ({ theme: state.theme, isSidebarCollapsed: state.isSidebarCollapsed }),
    }
  )
);
