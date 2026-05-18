import api from './api';

// ===========================
// DASHBOARD
// ===========================

export const getDashboardStats =
  async () => {

    const response =
      await api.get(
        '/super-admin/dashboard/stats'
      );

    return response.data;
};

export const getTodayAttendance =
  async () => {

    const response =
      await api.get(
        '/super-admin/dashboard/today'
      );

    return response.data;
};

// ===========================
// SESSION
// ===========================

export const getActiveSession =
  async () => {

    try {

      const response =
        await api.get(
          '/session/active'
        );

      return response.data;

    } catch (error) {

      // 404 = tidak ada sesi aktif (kondisi normal)
      if (error.response?.status === 404) {
        return { success: true, data: null };
      }

      throw error;

    }
};

// SUPPORT OLD COMPONENT
export const getActiveSessionData =
  getActiveSession;

export const createAttendanceSession =
  async (payload) => {

    const response =
      await api.post(
        '/session/create',
        payload
      );

    return response.data;
};

export const getAttendanceHistory =
  async () => {

    const response =
      await api.get(
        '/attendance/history'
      );

    return response.data;
};

// ===========================
// REALTIME
// ===========================

export const getRealtimeAttendance =
  async () => {

    const response =
      await api.get(
        '/attendance/realtime-feed'
      );

    return response.data;
};

// SUPPORT OLD COMPONENT
export const getRealtimeFeed =
  getRealtimeAttendance;

// ===========================
// USERS
// ===========================

export const getAllUsers =
  async () => {

    const response =
      await api.get(
        '/super-admin/user/list'
      );

    return response.data;
};

export const getUserDetail =
  async (id) => {

    const response =
      await api.get(
        `/super-admin/user/${id}`
      );

    return response.data;
};

export const createUser =
  async (payload) => {

    const response =
      await api.post(
        '/user/create',
        payload
      );

    return response.data;
};

export const updateUser =
  async (id, payload) => {

    const response =
      await api.put(
        `/super-admin/user/${id}/update`,
        payload
      );

    return response.data;
};

export const toggleUserStatus =
  async (id) => {

    const response =
      await api.patch(
        `/super-admin/user/${id}/toggle-status`
      );

    return response.data;
};

export const deleteUser =
  async (id) => {

    const response =
      await api.delete(
        `/super-admin/user/${id}/delete`
      );

    return response.data;
};

export const reEnrollFace =
  async (id, payload) => {

    const response =
      await api.post(
        `/super-admin/user/${id}/re-enroll-face`,
        payload
      );

    return response.data;
};

// ===========================
// ADMINS
// ===========================

export const getAllAdmins =
  async () => {

    const response =
      await api.get(
        '/super-admin/admin/list'
      );

    return response.data;
};

export const getAdminDetail =
  async (id) => {

    const response =
      await api.get(
        `/super-admin/admin/${id}`
      );

    return response.data;
};

export const createAdmin =
  async (payload) => {

    const response =
      await api.post(
        '/super-admin/admin/create',
        payload
      );

    return response.data;
};

export const updateAdmin =
  async (id, payload) => {

    const response =
      await api.put(
        `/super-admin/admin/${id}/update`,
        payload
      );

    return response.data;
};

export const toggleAdminStatus =
  async (id) => {

    const response =
      await api.patch(
        `/super-admin/admin/${id}/toggle-status`
      );

    return response.data;
};

export const deleteAdmin =
  async (id) => {

    const response =
      await api.delete(
        `/super-admin/admin/${id}/delete`
      );

    return response.data;
};

// ===========================
// DASHBOARD (REALTIME + SESSION)
// ===========================

export const getDashboardSession =
  async () => {

    const response =
      await api.get(
        '/super-admin/dashboard/session'
      );

    return response.data;
};

export const getDashboardRealtime =
  async () => {

    const response =
      await api.get(
        '/super-admin/dashboard/realtime'
      );

    return response.data;
};

// ===========================
// AUDIT
// ===========================

export const getSecurityLogs =
  async () => {

    const response =
      await api.get(
        '/super-admin/audit/security-events'
      );

    return response.data;
};

export const getAuditLogs =
  async () => {

    const response =
      await api.get(
        '/super-admin/audit/logs'
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
