const express = require('express');
const {
  createProduct,
  listProducts,
  listProductsAdmin,
  getProductByIdAdmin,
  deleteProduct,
  updateProduct,
  bulkAction,
} = require('../controllers/productController');
const { authClientUser, requireRole } = require('../middleware/auth');

const router = express.Router();
const requireStaff = requireRole('staff'); // dashboard's lowest admin-side role can manage products

// ─── Dashboard-facing REST routes ──────────────────────────────────────────────
router.get('/admin/products',        authClientUser, requireStaff, listProductsAdmin);
router.get('/admin/products/:id',    authClientUser, requireStaff, getProductByIdAdmin);
router.post('/admin/products',       authClientUser, requireStaff, createProduct);
router.put('/admin/products/:id',    authClientUser, requireStaff, updateProduct);
router.delete('/admin/products/:id', authClientUser, requireStaff, deleteProduct);
router.patch('/admin/products/bulk', authClientUser, requireStaff, bulkAction);

// ─── Legacy routes — kept working for anything still calling them ────────────────
router.post('/product/create', authClientUser, requireStaff, createProduct);
router.get('/product/list',    authClientUser, requireStaff, listProducts);
router.delete('/product/:id',  authClientUser, requireStaff, deleteProduct);
router.put('/product/:id',     authClientUser, requireStaff, updateProduct);

module.exports = router;
