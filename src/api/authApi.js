import axiosClient from './axiosClient';

const authApi = {
  register: (data) => {
    return axiosClient.post('/identity/api/v1/auth/register', data);
  },

  login: async (credentials) => {
    const response = await axiosClient.post(
      '/identity/api/v1/auth/login',
      credentials,
    );
    if (response.data?.result?.access_token) {
      localStorage.setItem('access_token', response.data.result.access_token);
    }
    return response.data;
  },

  getProfile: () => {
    return axiosClient.get('/identity/api/v1/me');
  },
  logout: () => {
    localStorage.removeItem('access_token');
    return axiosClient.post('/identity/api/v1/auth/logout');
  },
  register: (data) => {
    return axiosClient.post('/identity/api/v1/auth/register', data);
  },
};

export default authApi;
