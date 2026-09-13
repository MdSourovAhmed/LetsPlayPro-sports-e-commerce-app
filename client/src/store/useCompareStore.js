import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

const MAX_COMPARE = 4;

export const useCompareStore = create(
  persist(
    (set, get) => ({
      productIds: [],

      isComparing: (productId) => get().productIds.includes(productId),

      toggle: (productId) =>
        set((state) => {
          if (state.productIds.includes(productId)) {
            return { productIds: state.productIds.filter((id) => id !== productId) };
          }
          if (state.productIds.length >= MAX_COMPARE) {
            toast.error(`You can compare up to ${MAX_COMPARE} products at a time`);
            return state;
          }
          return { productIds: [...state.productIds, productId] };
        }),

      clear: () => set({ productIds: [] }),
    }),
    { name: "letsplaypro-compare" }
  )
);
