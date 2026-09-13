const express = require('express');
const { signup, login } = require('../controllers/authController');
const {authClientUser}=require('../middleware/auth');

const router = express.Router();

router.get('/auth/me', authClientUser);
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;