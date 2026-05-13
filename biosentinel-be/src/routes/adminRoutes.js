const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const {
  createAdmin
} = require('../controllers/admin/adminController');

router.post(
  '/create',
  authMiddleware,
  roleMiddleware('SUPER_ADMIN'),
  createAdmin
);

module.exports = router; 