const express = require('express');
const {
  listUsers,
  getUserById,
  setUserActiveStatus,
  deleteUser,
} = require('../controllers/adminUserController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const requireStaff = requireRole('staff');

router.get('/admin/users',           authMiddleware, requireStaff, listUsers);
router.get('/admin/users/:id',       authMiddleware, requireStaff, getUserById);
router.patch('/admin/users/:id/status', authMiddleware, requireStaff, setUserActiveStatus);
router.delete('/admin/users/:id',    authMiddleware, requireRole('admin'), deleteUser); // deletion needs admin, not just staff

module.exports = router;
