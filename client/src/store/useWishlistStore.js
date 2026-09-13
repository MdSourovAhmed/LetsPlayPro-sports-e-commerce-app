import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      productIds: [],

      isWishlisted: (productId) => get().productIds.includes(productId),

      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),

      remove: (productId) =>
        set((state) => ({ productIds: state.productIds.filter((id) => id !== productId) })),

      mergeIds: (incomingIds) =>
        set((state) => ({
          productIds: Array.from(new Set([...state.productIds, ...incomingIds])),
        })),

      clear: () => set({ productIds: [] }),
    }),
    { name: "letsplaypro-wishlist" }
  )
);
