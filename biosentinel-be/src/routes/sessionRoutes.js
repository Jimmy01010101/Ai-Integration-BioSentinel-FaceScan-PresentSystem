const express = require('express');

const router = express.Router();

const authMiddleware =
  require('../middleware/authMiddleware');

const roleMiddleware =
  require('../middleware/roleMiddleware');

const {
  createAttendanceSession,
  getActiveSession
} = require(
  '../controllers/attendance/sessionController'
);

router.post(
  '/create',
  authMiddleware,
  roleMiddleware('SUPER_ADMIN'),
  createAttendanceSession
);

router.get(
  '/active',
  getActiveSession
);

module.exports = router; 