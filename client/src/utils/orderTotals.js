export const FREE_SHIPPING_THRESHOLD = 75;
const FLAT_SHIPPING = 7.5;
const TAX_RATE = 0.05;

/**
 * @param {number} subtotal
 * @returns {{subtotal: number, shipping: number, tax: number, total: number}}
 */
export function calculateOrderTotals(subtotal) {
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + shipping;
  return { subtotal, shipping, tax, total: Math.round(total * 100) / 100 };
}
