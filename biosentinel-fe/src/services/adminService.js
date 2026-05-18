import api from './api';

// =====================================================
// ADMIN SERVICE
// Semua endpoint sesuai backend (LOCKED):
//   /api/admin/attendance/*  (adminMonitoringRoutes)
//   /api/admin/report/*      (adminReportRoutes)
//   /api/attendance/:id/status (attendanceRoutes)
// =====================================================


// ===========================
// MONITORING / PRESENSI
// ===========================

// Presensi hari ini
export const getTodayAttendance =
  async () => {

    const response =
      await api.get('/admin/attendance/today');

    return response.data;
};

// Papan kehadiran (daftar user + presensi terbaru)
export const getPresenceBoard =
  async () => {

    const response =
      await api.get('/admin/attendance/presence-board');

    return response.data;
};

// Statistik presensi
export const getAttendanceStatistics =
  async () => {

    const response =
      await api.get('/admin/attendance/statistics');

    return response.data;
};

// Log spoof
export const getSpoofLogs =
  async () => {

    const response =
      await api.get('/admin/attendance/spoof-logs');

    return response.data;
};

// Sesi presensi aktif
// Catatan: backend mengembalikan 404 bila tidak ada sesi
// aktif — itu kondisi normal, bukan error. Maka 404
// ditangani sebagai "tidak ada sesi" (mengembalikan null).
export const getActiveSession =
  async () => {

    try {

      const response =
        await api.get('/admin/attendance/active-session');

      return response.data;

    } catch (error) {

      if (error.response?.status === 404) {
        return { success: true, data: null };
      }

      throw error;

    }

};


// ===========================
// LAPORAN PRESENSI
// ===========================

// Rekap harian
export const getDailyRecap =
  async () => {

    const response =
      await api.get('/admin/report/daily');

    return response.data;
};

// Riwayat presensi dengan filter (status, division)
export const filterAttendance =
  async (params) => {

    const response =
      await api.get('/admin/report/filter', {
        params
      });

    return response.data;
};

// Ringkasan presensi
export const getAttendanceSummary =
  async () => {

    const response =
      await api.get('/admin/report/summary');

    return response.data;
};

// Rekap per sesi
export const getSessionRecap =
  async (sessionId) => {

    const response =
      await api.get(
        `/admin/report/session/${sessionId}`
      );

    return response.data;
};

// Riwayat presensi per user
export const getUserReport =
  async (userId) => {

    const response =
      await api.get(
        `/admin/report/user/${userId}`
      );

    return response.data;
};


// ===========================
// KELOLA STATUS
// ===========================

// Ubah status presensi (hanya ABSEN -> IZIN/CUTI/SAKIT)
export const manageAttendanceStatus =
  async (id, payload) => {

    const response =
      await api.patch(
        `/attendance/${id}/status`,
        payload
      );

    return response.data;
};


// ===========================
// RIWAYAT SESSION
// ===========================

// Daftar semua sesi presensi
export const getSessionList =
  async () => {

    const response =
      await api.get('/session/list');

    return response.data;
};

// Rekap presensi untuk satu sesi
export const getSessionAttendance =
  async (sessionId) => {

    const response =
      await api.get(
        `/admin/report/session/${sessionId}`
      );

    return response.data;
};