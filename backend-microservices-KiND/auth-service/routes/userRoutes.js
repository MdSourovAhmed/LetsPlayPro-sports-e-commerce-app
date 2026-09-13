const express = require('express');
const {
  getProfile,
  updateProfile,
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/user/profile', authMiddleware, getProfile);
router.put('/user/profile', authMiddleware, updateProfile);

router.get('/user/addresses', authMiddleware, listAddresses);
router.post('/user/addresses', authMiddleware, addAddress);
router.put('/user/addresses/:addressId', authMiddleware, updateAddress);
router.delete('/user/addresses/:addressId', authMiddleware, deleteAddress);
router.patch('/user/addresses/:addressId/default', authMiddleware, setDefaultAddress);

module.exports = router;
