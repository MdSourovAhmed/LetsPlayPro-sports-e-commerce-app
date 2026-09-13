const express = require('express');
const { getSummary } = require('../controllers/dashboardController');
const { authClientUser, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/admin/dashboard/summary', authClientUser, requireRole('staff'), getSummary);

module.exports = router;
