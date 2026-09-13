const express = require('express');
const {
  getOverview,
  getSales,
  getTopProducts,
  getCategoryBreakdown,
  getPaymentMethodBreakdown,
  exportReport,
} = require('../controllers/analyticsController');
const { authClientUser, requireRole } = require('../middleware/auth');

const router = express.Router();
const requireStaff = requireRole('staff');

router.get('/admin/analytics/overview',        authClientUser, requireStaff, getOverview);
router.get('/admin/analytics/sales',           authClientUser, requireStaff, getSales);
router.get('/admin/analytics/top-products',    authClientUser, requireStaff, getTopProducts);
router.get('/admin/analytics/categories',      authClientUser, requireStaff, getCategoryBreakdown);
router.get('/admin/analytics/payment-methods', authClientUser, requireStaff, getPaymentMethodBreakdown);
router.get('/admin/analytics/export',          authClientUser, requireStaff, exportReport);

module.exports = router;
