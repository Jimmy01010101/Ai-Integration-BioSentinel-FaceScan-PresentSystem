const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const upload = require('../config/multer');

const {
  createUser
} = require('../controllers/user/userController');

router.post(
  '/create',
  authMiddleware,
  roleMiddleware('SUPER_ADMIN'),
  upload.single('faceImage'),
  createUser
);

module.exports = router; 