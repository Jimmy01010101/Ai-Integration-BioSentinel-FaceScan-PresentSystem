const express =
  require('express');

const router =
  express.Router();

const {
  authMiddleware,
  adminOnly
} = require('../middleware/authMiddleware');

const {

  getTodayAttendance,
  getAttendanceDetail,
  getPresenceBoard,
  getAttendanceStatistics,
  getSpoofLogs,
  getActiveSession

} = require(
  '../controllers/admin/adminAttendanceController'
);


// TODAY ATTENDANCE
router.get(
  '/attendance/today',
  authMiddleware,
  adminOnly,
  getTodayAttendance
);


// PRESENCE BOARD
router.get(
  '/attendance/presence-board',
  authMiddleware,
  adminOnly,
  getPresenceBoard
);


// ATTENDANCE STATISTICS
router.get(
  '/attendance/statistics',
  authMiddleware,
  adminOnly,
  getAttendanceStatistics
);


// SPOOF LOGS
router.get(
  '/attendance/spoof-logs',
  authMiddleware,
  adminOnly,
  getSpoofLogs
);


// ACTIVE SESSION
router.get(
  '/attendance/active-session',
  authMiddleware,
  adminOnly,
  getActiveSession
);


// ATTENDANCE DETAIL
// TARUH PALING BAWAH
router.get(
  '/attendance/:id',
  authMiddleware,
  adminOnly,
  getAttendanceDetail
);


module.exports = router; 