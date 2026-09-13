import axiosInstance from './axiosInstance';

// Backend integration contract (built out fully in the orders module pass):
// GET   /admin/orders          ?page&limit&search&status&paymentStatus&dateFrom&dateTo&minTotal&maxTotal&sort
// GET   /admin/orders/:id
// PATCH /admin/orders/:id/status      { status, reason? }
// PATCH /admin/orders/:id/payment     { paymentStatus }
// POST  /admin/orders/:id/notes       { note }
// GET   /admin/orders/:id/invoice     -> PDF blob

export const orderApi = {
  list: (params) => axiosInstance.get('/admin/orders', { params }),
  getById: (id) => axiosInstance.get(`/admin/orders/${id}`),
  updateStatus: (id, payload) => axiosInstance.patch(`/admin/orders/${id}/status`, payload),
  updatePayment: (id, paymentStatus) =>
    axiosInstance.patch(`/admin/orders/${id}/payment`, { paymentStatus }),
  addNote: (id, note) => axiosInstance.post(`/admin/orders/${id}/notes`, { note }),
  downloadInvoice: (id) =>
    axiosInstance.get(`/admin/orders/${id}/invoice`, { responseType: 'blob' }),
};
