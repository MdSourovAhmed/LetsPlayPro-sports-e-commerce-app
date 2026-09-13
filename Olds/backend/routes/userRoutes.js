const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/userController');

// 🧩 Routes for user profile
router.get('/user/profile', authMiddleware, getProfile);
router.put('/user/profile', authMiddleware, updateProfile);

module.exports = router;
// 