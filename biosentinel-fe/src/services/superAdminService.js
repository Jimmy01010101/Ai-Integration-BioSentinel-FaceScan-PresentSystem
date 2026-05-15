import api from './api';


// DASHBOARD STATS
export const getDashboardStats =
  async () => {

    const response =
      await api.get(

        '/super-admin/dashboard/stats'

      );

    return response.data;

  };


// ATTENDANCE TODAY
export const getAttendanceToday =
  async () => {

    const response =
      await api.get(

        '/super-admin/dashboard/today'

      );

    return response.data;

  };


// ACTIVE SESSION
export const getActiveSession =
  async () => {

    const response =
      await api.get(

        '/super-admin/dashboard/session'

      );

    return response.data;

  };


// REALTIME FEED
export const getRealtimeFeed =
  async () => {

    const response =
      await api.get(

        '/super-admin/dashboard/realtime'

      );

    return response.data;

  }; 