import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get(
    '/super-admin/dashboard/stats'
  );

  return response.data;
};

export const getTodayAttendance = async () => {
  const response = await api.get(
    '/super-admin/dashboard/today'
  );

  return response.data;
};

export const getActiveSession = async () => {
  const response = await api.get(
    '/super-admin/dashboard/session'
  );

  return response.data;
};

export const getRealtimeFeed = async () => {
  const response = await api.get(
    '/super-admin/dashboard/realtime'
  );

  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get(
    '/super-admin/user/list'
  );

  return response.data;
};

export const getUserDetail = async (id) => {
  const response = await api.get(
    `/super-admin/user/${id}`
  );

  return response.data;
};

export const createUser = async (payload) => {
  const response = await api.post(
    '/user/create',
    payload
  );

  return response.data;
};

export const updateUser = async (
  id,
  payload
) => {

  const response = await api.put(
    `/super-admin/user/${id}/update`,
    payload
  );

  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await api.patch(
    `/super-admin/user/${id}/toggle-status`
  );

  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(
    `/super-admin/user/${id}/delete`
  );

  return response.data;
};

export const reEnrollFace = async (
  id,
  payload
) => {

  const response = await api.post(
    `/super-admin/user/${id}/re-enroll-face`,
    payload
  );

  return response.data;
};

export const getAllAdmins = async () => {
  const response = await api.get(
    '/super-admin/admin/list'
  );

  return response.data;
};

export const getSecurityLogs = async () => {
  const response = await api.get(
    '/super-admin/audit/security-events'
  );

  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get(
    '/super-admin/audit/logs'
  );

  return response.data;
}; 

export const getActiveSessionData =
async () => {

  const response =
    await api.get(
      "/session/active"
    );

  return response.data;
};

export const createAttendanceSession =
async (payload) => {

  const response =
    await api.post(
      "/session/create",
      payload
    );

  return response.data;
};