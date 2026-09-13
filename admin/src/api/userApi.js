import axiosInstance from './axiosInstance';

// Backend integration contract (built out fully in the users module pass):
// GET   /admin/users          ?page&limit&search&role&status&dateFrom&dateTo&sort
// GET   /admin/users/:id
// GET   /admin/users/:id/orders
// PATCH /admin/users/:id/status     { isActive }
// DELETE /admin/users/:id

export const userApi = {
  list: (params) => axiosInstance.get('/admin/users', { params }),
  getById: (id) => axiosInstance.get(`/admin/users/${id}`),
  getOrderHistory: (id) => axiosInstance.get(`/admin/users/${id}/orders`),
  setActiveStatus: (id, isActive) => axiosInstance.patch(`/admin/users/${id}/status`, { isActive }),
  remove: (id) => axiosInstance.delete(`/admin/users/${id}`),
};
