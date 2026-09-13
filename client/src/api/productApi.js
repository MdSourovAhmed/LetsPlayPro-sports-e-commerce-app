import { axiosInstance } from "./axiosInstance";

export const productApi = {
  /**
   * @param {object} params - page, limit, sport, type, brand, minPrice, maxPrice, sort, search, inStock
   */
  getFilteredProducts: (params = {}) =>
    axiosInstance.get("/products", { params }).then((r) => r.data),

  getProductById: (id) => axiosInstance.get(`/product/${id}`).then((r) => r.data),

  /**
   * The real endpoint filters by sport/type, not by the product's own id — pass the current
   * product's sport and/or type plus its own id (to exclude it from its own "related" list).
   * @param {{sport?: string, type?: string, excludeId?: string}} params
   */
  getRelatedProducts: ({ sport, type, excludeId } = {}) =>
    axiosInstance.get("/products/related", { params: { sport, type, excludeId } }).then((r) => r.data),

  getLatestProducts: (limit = 8) =>
    axiosInstance.get("/latest", { params: { limit } }).then((r) => r.data),

  getBestSellers: (limit = 8) =>
    axiosInstance.get("/bestsellers", { params: { limit } }).then((r) => r.data),

  // /search returns { products, total, pages } (no `data`/`success` wrapper, unlike every
  // other product endpoint) — normalized to { data, total, pages } to match the rest of this
  // API layer. Not currently wired to any page (Shop's search box uses getFilteredProducts
  // instead), kept here for when a dedicated full-text search experience is built.
  searchProducts: (q, params = {}) =>
    axiosInstance
      .get("/search", { params: { q, ...params } })
      .then((r) => ({ data: r.data.products, total: r.data.total, pages: r.data.pages })),
};
