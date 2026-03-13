const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', requireAdmin, adminController.getAdminDashboard);
router.get('/finance', requireAdmin, adminController.getFinance);
router.get('/overview', requireAdmin, adminController.overview);

module.exports = router;
