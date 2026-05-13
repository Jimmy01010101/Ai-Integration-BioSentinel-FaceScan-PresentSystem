const express = require('express');

const router = express.Router();

const authMiddleware =
  require('../middleware/authMiddleware');

const roleMiddleware =
  require('../middleware/roleMiddleware');

const {
  validateAttendanceCode,
  checkInAttendance,
  getAttendanceHistory
} = require(
  '../controllers/attendance/attendanceController'
);

router.post(
  '/validate-code',
  validateAttendanceCode
);

router.post(
  '/check-in',
  checkInAttendance
);

router.get(
  '/history',
  authMiddleware,
  roleMiddleware('SUPER_ADMIN', 'ADMIN'),
  getAttendanceHistory
);

module.exports = router; 