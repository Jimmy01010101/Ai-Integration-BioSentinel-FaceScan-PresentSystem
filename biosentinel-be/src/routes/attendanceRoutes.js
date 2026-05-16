const express =
  require('express');

const router =
  express.Router();

const {
  authMiddleware
} = require('../middleware/authMiddleware');

const roleMiddleware =
  require('../middleware/roleMiddleware');

const upload =
  require('../middleware/uploadFace');

const {
  verifyUserAttendance,
  checkInAttendance,
  getAttendanceHistory,
  updateAttendanceStatus,
  getRealtimeAttendanceFeed
} = require(
  '../controllers/attendance/attendanceController'
);

router.post(
  '/verify-user',
  verifyUserAttendance
);

router.post(
  '/check-in',

  upload.single(
    'faceImage'
  ),

  checkInAttendance
);

router.get(
  '/history',

  authMiddleware,

  roleMiddleware(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  getAttendanceHistory
);

router.patch(
  '/:id/status',

  authMiddleware,

  roleMiddleware(
    'ADMIN'
  ),

  updateAttendanceStatus
);

router.get(
  '/realtime-feed',
  getRealtimeAttendanceFeed
);

module.exports = router; 