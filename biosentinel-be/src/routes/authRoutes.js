const express = require('express');

const router = express.Router();

const {
  loginSuperAdmin,
  loginAdmin
} = require('../controllers/auth/authController');

router.post('/super-admin/login', loginSuperAdmin);
router.post('/admin/login', loginAdmin);

module.exports = router; 