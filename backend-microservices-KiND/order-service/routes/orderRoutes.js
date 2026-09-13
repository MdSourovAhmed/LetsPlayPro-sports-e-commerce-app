const express = require('express');
const {
  createOrder,
  getAllOrders,
  getOrderById,
  getMyOrderById,
  getUserOrders,
  getOrdersByUserId,
  updateOrderInfo,
  updateOrderStatus,
  updatePaymentStatus,
  addAdminNote,
  downloadInvoice,
  cancelOrder,
} = require('../controllers/orderController');
const { authClientUser, requireRole } = require('../middleware/auth');

const router = express.Router();
const requireStaff = requireRole('staff');

// ─── User-facing routes ────────────────────────────────────────────────────────
router.post('/place-order',          authClientUser, createOrder);
router.get('/orders/my',             authClientUser, getUserOrders);
// Registered AFTER /orders/my — Express tries routes in registration order,
// so the literal "/orders/my" path always wins that match before this
// param route gets a chance to swallow it as orderId="my".
router.get('/orders/:orderId',       authClientUser, getMyOrderById);
router.put('/update-order/:orderId', authClientUser, updateOrderInfo);
router.put('/cancel-order/:orderId', authClientUser, cancelOrder);

// ─── Dashboard-facing admin routes ──────────────────────────────────────────────
router.get('/admin/orders',                authClientUser, requireStaff, getAllOrders);
router.get('/admin/orders/:id',            authClientUser, requireStaff, getOrderById);
router.patch('/admin/orders/:id/status',   authClientUser, requireStaff, updateOrderStatus);
router.patch('/admin/orders/:id/payment',  authClientUser, requireStaff, updatePaymentStatus);
router.post('/admin/orders/:id/notes',     authClientUser, requireStaff, addAdminNote);
router.get('/admin/orders/:id/invoice',    authClientUser, requireStaff, downloadInvoice);
router.get('/admin/users/:userId/orders',  authClientUser, requireStaff, getOrdersByUserId);

// ─── Legacy admin routes — kept working for anything still calling them ──────────
router.get('/orders', authClientUser, requireStaff, getAllOrders);
router.patch('/update-order-status/:orderId', authClientUser, requireStaff, updateOrderStatus);

module.exports = router;
