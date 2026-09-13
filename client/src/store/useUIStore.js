import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 8;

export const useUIStore = create(
  persist(
    (set) => ({
      theme: "light", // 'light' | 'dark'
      isMobileMenuOpen: false,
      recentlyViewed: [], // array of productIds, most recent first

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),

      setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),

      addRecentlyViewed: (productId) =>
        set((state) => ({
          recentlyViewed: [
            productId,
            ...state.recentlyViewed.filter((id) => id !== productId),
          ].slice(0, MAX_RECENT),
        })),
    }),
    {
      name: "letsplaypro-ui",
      partialize: (state) => ({ theme: state.theme, recentlyViewed: state.recentlyViewed }),
    }
  )
);
