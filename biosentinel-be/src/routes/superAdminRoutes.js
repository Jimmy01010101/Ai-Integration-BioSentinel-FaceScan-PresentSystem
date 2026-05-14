const express =
  require('express');

const router =
  express.Router();

const {
  authMiddleware,
  superAdminOnly
} = require('../middleware/authMiddleware');

const {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin
} = require(
  '../controllers/superadmin/adminManagementController'
);

const {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
  reEnrollFace
} = require(
  '../controllers/superadmin/userManagementController'
);

const upload =
  require('../middleware/uploadFace');

const {
  getDashboardStats,
  getTodayAttendance,
  getActiveSession,
  getRealtimeFeed
} = require(
  '../controllers/superadmin/dashboardController'
);

const {
  getAuditLogs,
  getLoginLogs
} = require(
  '../controllers/superadmin/auditController'
);

// CREATE ADMIN
router.post(
  '/admin/create',
  authMiddleware,
  superAdminOnly,
  createAdmin
);

// GET ALL ADMINS
router.get(
  '/admin/list',
  authMiddleware,
  superAdminOnly,
  getAllAdmins
);

// GET ADMIN DETAIL
router.get(
  '/admin/:id',
  authMiddleware,
  superAdminOnly,
  getAdminById
);

// UPDATE ADMIN
router.put(
  '/admin/:id/update',
  authMiddleware,
  superAdminOnly,
  updateAdmin
);

// TOGGLE STATUS
router.patch(
  '/admin/:id/toggle-status',
  authMiddleware,
  superAdminOnly,
  toggleAdminStatus
);

// DELETE ADMIN
router.delete(
  '/admin/:id/delete',
  authMiddleware,
  superAdminOnly,
  deleteAdmin
);

// GET ALL USERS
router.get(
  '/user/list',
  authMiddleware,
  superAdminOnly,
  getAllUsers
);

// GET USER DETAIL
router.get(
  '/user/:id',
  authMiddleware,
  superAdminOnly,
  getUserById
);

// UPDATE USER
router.put(
  '/user/:id/update',
  authMiddleware,
  superAdminOnly,
  updateUser
);

// TOGGLE USER STATUS
router.patch(
  '/user/:id/toggle-status',
  authMiddleware,
  superAdminOnly,
  toggleUserStatus
);

// DELETE USER
router.delete(
  '/user/:id/delete',
  authMiddleware,
  superAdminOnly,
  deleteUser
);

// RE-ENROLL FACE
router.post(
  '/user/:id/re-enroll-face',
  authMiddleware,
  superAdminOnly,
  upload.single('faceImage'),
  reEnrollFace
);

// DASHBOARD STATS
router.get(
  '/dashboard/stats',
  authMiddleware,
  superAdminOnly,
  getDashboardStats
);

// TODAY ATTENDANCE
router.get(
  '/dashboard/today',
  authMiddleware,
  superAdminOnly,
  getTodayAttendance
);

// ACTIVE SESSION
router.get(
  '/dashboard/session',
  authMiddleware,
  superAdminOnly,
  getActiveSession
);

// REALTIME FEED BASE
router.get(
  '/dashboard/realtime',
  authMiddleware,
  superAdminOnly,
  getRealtimeFeed
); 

// AUDIT LOGS
router.get(
  '/audit/logs',
  authMiddleware,
  superAdminOnly,
  getAuditLogs
);

// LOGIN LOGS
router.get(
  '/audit/login-logs',
  authMiddleware,
  superAdminOnly,
  getLoginLogs
);

module.exports = router; 