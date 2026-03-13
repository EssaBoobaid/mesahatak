const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.getLogin);
router.post('/login', authController.handleLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.handleRegister);

router.get('/profile', authController.getProfile);
router.post('/profile', authController.updateProfile);
router.get('/logout', authController.handleLogout);

module.exports = router;
