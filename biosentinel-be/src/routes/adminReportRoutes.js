const express =
  require('express');

const router =
  express.Router();

const {
  authMiddleware,
  adminOnly
} = require('../middleware/authMiddleware');

const {

  getDailyRecap,
  getSessionRecap,
  getUserAttendanceHistory,
  filterAttendance,
  getAttendanceSummary

} = require(
  '../controllers/admin/adminReportController'
);


// DAILY RECAP
router.get(
  '/report/daily',
  authMiddleware,
  adminOnly,
  getDailyRecap
);


// SESSION RECAP
router.get(
  '/report/session/:sessionId',
  authMiddleware,
  adminOnly,
  getSessionRecap
);


// USER HISTORY
router.get(
  '/report/user/:userId',
  authMiddleware,
  adminOnly,
  getUserAttendanceHistory
);


// FILTER
router.get(
  '/report/filter',
  authMiddleware,
  adminOnly,
  filterAttendance
);


// SUMMARY
router.get(
  '/report/summary',
  authMiddleware,
  adminOnly,
  getAttendanceSummary
);


module.exports = router; 