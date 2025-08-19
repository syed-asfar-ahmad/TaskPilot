const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Only Admin and Manager can view dashboard
router.get('/stats', verifyToken, checkRole('Admin', 'Manager'), getDashboardStats);

module.exports = router;
