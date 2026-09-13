/**
 * Formats a numeric price for display.
 * @param {number} value
 * @returns {string}
 */
export function formatPrice(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `$${value.toFixed(2)}`;
}

/**
 * Returns the effective price a customer pays: discountPrice if present, else price.
 * @param {{price: number, discountPrice?: number|null}} product
 */
export function getEffectivePrice(product) {
  if (!product) return 0;
  return product.discountPrice ?? product.price;
}

/**
 * Returns the discount percentage (rounded) if a discountPrice is active, else null.
 * @param {{price: number, discountPrice?: number|null}} product
 */
export function getDiscountPercent(product) {
  if (!product?.discountPrice || product.discountPrice >= product.price) return null;
  return Math.round(((product.price - product.discountPrice) / product.price) * 100);
}
