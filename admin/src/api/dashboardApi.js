import axiosInstance from './axiosInstance';

// GET /admin/dashboard/summary -> {
//   totalProducts, totalUsers, totalOrders, pendingOrders,
//   completedOrders, cancelledOrders, totalRevenue,
//   recentOrders: [...], recentUsers: [...], lowStockProducts: [...]
// }
export const dashboardApi = {
  getSummary: () => axiosInstance.get('/admin/dashboard/summary'),
};
