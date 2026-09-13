import { axiosInstance } from "./axiosInstance";

/**
 * order-service's real responses use { success, order } / { success, orders, total, pages }
 * rather than a generic { data } envelope. Normalizing to { data, ... } here — instead of
 * changing every consumer — keeps the rest of the app decoupled from that backend detail and
 * matches the { data } shape used everywhere else in this API layer (products, auth).
 */
export const orderApi = {
  placeOrder: (payload) =>
    axiosInstance.post("/place-order", payload).then((r) => ({ data: r.data.order })),

  getMyOrders: () =>
    axiosInstance
      .get("/orders/my")
      .then((r) => ({ data: r.data.orders, total: r.data.total, pages: r.data.pages })),

  getOrderById: (orderId) =>
    axiosInstance.get(`/orders/${orderId}`).then((r) => ({ data: r.data.order })),

  updateOrderInfo: (orderId, payload) =>
    axiosInstance.put(`/update-order/${orderId}`, payload).then((r) => ({ data: r.data.order })),

  cancelOrder: (orderId, reason) =>
    axiosInstance.put(`/cancel-order/${orderId}`, { reason }).then((r) => ({ data: r.data.order })),
};
