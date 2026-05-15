import api from './api';


// SUPER ADMIN LOGIN
export const superAdminLogin =
  async (data) => {

    const response =
      await api.post(

        '/auth/super-admin/login',

        data

      );

    return response.data;

  };


// ADMIN LOGIN
export const adminLogin =
  async (data) => {

    const response =
      await api.post(

        '/auth/admin/login',

        data

      );

    return response.data;

  };