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

// VERIFY USER
router.post(
  '/verify-user',
  verifyUserAttendance
);

// CHECK-IN
router.post(
  '/check-in',

  upload.single(
    'faceImage'
  ),

  checkInAttendance
);

// REALTIME FEED
router.get(
  '/realtime-feed',

  authMiddleware,

  roleMiddleware(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  getRealtimeAttendanceFeed
);

// HISTORY
router.get(
  '/history',

  authMiddleware,

  roleMiddleware(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  getAttendanceHistory
);

// UPDATE STATUS
router.patch(
  '/:id/status',

  authMiddleware,

  roleMiddleware(
    'ADMIN',
    'SUPER_ADMIN'
  ),

  updateAttendanceStatus
);

module.exports = router; 