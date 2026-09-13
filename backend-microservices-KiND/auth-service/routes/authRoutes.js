const express = require('express');
const {
  signup,
  login,
  googleLogin,
  adminRegister,
  refreshTokenHandler,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/auth/login', login);
router.post('/auth/google', googleLogin);
// Dev/test-only — see adminRegister's own comment in authController.js. Always 403s unless
// ADMIN_REGISTRATION_CODE is explicitly set, so leaving that env var unset is how you turn
// this off entirely (the default in every .env.example in this repo).
router.post('/auth/admin-register', adminRegister);
router.post('/auth/refresh-token', refreshTokenHandler);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

router.get('/auth/me', authMiddleware, getMe);
router.post('/auth/logout', logout);
router.post('/auth/change-password', authMiddleware, changePassword);

module.exports = router;
