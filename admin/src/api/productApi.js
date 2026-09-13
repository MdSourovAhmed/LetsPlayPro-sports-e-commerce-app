import axiosInstance from './axiosInstance';

// Backend integration contract (built out fully in the products module pass):
// GET    /admin/products            ?page&limit&search&category&status&sort
// GET    /admin/products/:id
// POST   /admin/products
// PUT    /admin/products/:id
// DELETE /admin/products/:id
// PATCH  /admin/products/bulk       { ids, action }

export const productApi = {
  list: (params) => axiosInstance.get('/admin/products', { params }),
  getById: (id) => axiosInstance.get(`/admin/products/${id}`),
  create: (payload) => axiosInstance.post('/admin/products', payload),
  update: (id, payload) => axiosInstance.put(`/admin/products/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/admin/products/${id}`),
  bulkAction: (ids, action) => axiosInstance.patch('/admin/products/bulk', { ids, action }),
};
