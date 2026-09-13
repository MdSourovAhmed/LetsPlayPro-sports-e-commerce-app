import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * A cart line item is keyed by productId + size (variant) so the same
 * product in two different sizes doesn't collapse into one row.
 */
function lineKey(productId, size) {
  return `${productId}::${size ?? "default"}`;
}

export const useCartStore = create(
  persist(
    (set) => ({
      items: [], // { productId, name, image, price, discountPrice, size, quantity, stock }

      addItem: (product, { size = null, quantity = 1 } = {}) =>
        set((state) => {
          const key = lineKey(product._id, size);
          const existing = state.items.find((i) => lineKey(i.productId, i.size) === key);

          if (existing) {
            return {
              items: state.items.map((i) =>
                lineKey(i.productId, i.size) === key
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock || 99) }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product._id,
                name: product.name,
                image: product.images?.[0] ?? null,
                price: product.price,
                discountPrice: product.discountPrice ?? null,
                size,
                quantity,
                stock: product.stock,
                savedForLater: false,
              },
            ],
          };
        }),

      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            lineKey(i.productId, i.size) === lineKey(productId, size)
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock || 99)) }
              : i
          ),
        })),

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter((i) => lineKey(i.productId, i.size) !== lineKey(productId, size)),
        })),

      toggleSaveForLater: (productId, size) =>
        set((state) => ({
          items: state.items.map((i) =>
            lineKey(i.productId, i.size) === lineKey(productId, size)
              ? { ...i, savedForLater: !i.savedForLater }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      /** Merges a guest cart into a server/user cart after login (union by line key, quantities summed). */
      mergeItems: (incomingItems) =>
        set((state) => {
          const merged = [...state.items];
          for (const incoming of incomingItems) {
            const key = lineKey(incoming.productId, incoming.size);
            const idx = merged.findIndex((i) => lineKey(i.productId, i.size) === key);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + incoming.quantity };
            } else {
              merged.push(incoming);
            }
          }
          return { items: merged };
        }),
    }),
    {
      name: "letsplaypro-cart",
      // IMPORTANT: only ever persist `items`. Derived values must never be persisted — see
      // the selector functions below for why they're plain functions, not state getters.
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ─── Derived selectors ──────────────────────────────────────────────────────
// These were previously `get subtotal()` / `get itemCount()` getters defined directly on the
// store's state object. That's a trap with zustand's `persist` middleware: persist serializes
// the *entire state* to localStorage on every change, which invokes getters and bakes their
// current numeric value in as a plain, frozen field. On the next page load, persist's merge
// step does `{...freshState, ...persistedState}`, and that frozen number silently overwrites
// the live getter — so subtotal/itemCount stop updating forever after the first rehydration
// (this is exactly why the cart badge could go stale and the Checkout button could stay stuck
// disabled). Plain selector functions computed from `items` on every call don't have this
// problem, since they're never part of the persisted state at all.
export const selectActiveCartItems = (state) => state.items.filter((i) => !i.savedForLater);

export const selectCartSubtotal = (state) =>
  selectActiveCartItems(state).reduce((sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity, 0);

export const selectCartItemCount = (state) =>
  selectActiveCartItems(state).reduce((sum, i) => sum + i.quantity, 0);
