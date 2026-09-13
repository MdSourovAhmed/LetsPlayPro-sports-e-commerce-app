import axiosInstance from './axiosInstance';

// Backend integration contract (built out fully in the analytics module pass):
// GET /admin/analytics/overview      ?range=daily|weekly|monthly|yearly|custom&from&to
// GET /admin/analytics/sales         ?range&from&to
// GET /admin/analytics/top-products  ?range&from&to&limit
// GET /admin/analytics/categories    ?range&from&to
// GET /admin/analytics/payment-methods
// GET /admin/analytics/export        ?format=csv|pdf&range&from&to -> blob

export const analyticsApi = {
  getOverview: (params) => axiosInstance.get('/admin/analytics/overview', { params }),
  getSales: (params) => axiosInstance.get('/admin/analytics/sales', { params }),
  getTopProducts: (params) => axiosInstance.get('/admin/analytics/top-products', { params }),
  getCategoryBreakdown: (params) => axiosInstance.get('/admin/analytics/categories', { params }),
  getPaymentMethodBreakdown: () => axiosInstance.get('/admin/analytics/payment-methods'),
  exportReport: (params) =>
    axiosInstance.get('/admin/analytics/export', { params, responseType: 'blob' }),
};
