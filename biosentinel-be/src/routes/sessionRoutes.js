const express = require('express');

const router = express.Router();

const {
  authMiddleware
} = require('../middleware/authMiddleware');

const roleMiddleware =
  require('../middleware/roleMiddleware');

const {
  createAttendanceSession,
  getActiveSession,
  getSessionList
} = require(
  '../controllers/attendance/sessionController'
);


// BUAT SESI PRESENSI (SUPER ADMIN)
router.post(
  '/create',
  authMiddleware,
  roleMiddleware('SUPER_ADMIN'),
  createAttendanceSession
);


// SESI AKTIF (PUBLIK — dipakai halaman presensi)
router.get(
  '/active',
  getActiveSession
);


// DAFTAR SEMUA SESI (ADMIN & SUPER ADMIN)
// Dipakai halaman "Riwayat Session".
router.get(
  '/list',
  authMiddleware,
  roleMiddleware('SUPER_ADMIN', 'ADMIN'),
  getSessionList
);


module.exports = router;