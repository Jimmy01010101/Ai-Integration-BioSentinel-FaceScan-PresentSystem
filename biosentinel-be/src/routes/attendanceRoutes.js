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
  getUserPublicHistory,
  updateAttendanceStatus,
  getRealtimeAttendanceFeed

} = require(
  '../controllers/attendance/attendanceController'
);


// =====================================================
// VERIFY USER (PUBLIK)
// =====================================================
router.post(
  '/verify-user',
  verifyUserAttendance
);


// =====================================================
// CHECK-IN (PUBLIK)
// Menerima FormData: faceImage (file) + field liveness
// =====================================================
router.post(
  '/check-in',

  upload.single('faceImage'),

  checkInAttendance
);


// =====================================================
// RIWAYAT PRESENSI USER (PUBLIK - tanpa login)
// =====================================================
router.get(
  '/user-history',
  getUserPublicHistory
);


// =====================================================
// REALTIME FEED (ADMIN / SUPER ADMIN)
// =====================================================
router.get(
  '/realtime-feed',

  authMiddleware,

  roleMiddleware(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  getRealtimeAttendanceFeed
);


// =====================================================
// HISTORY (ADMIN / SUPER ADMIN)
// =====================================================
router.get(
  '/history',

  authMiddleware,

  roleMiddleware(
    'SUPER_ADMIN',
    'ADMIN'
  ),

  getAttendanceHistory
);


// =====================================================
// UPDATE STATUS (KELOLA STATUS - ADMIN / SUPER ADMIN)
// =====================================================
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