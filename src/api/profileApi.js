import axiosClient from './axiosClient';

export const profileApi = {
  // API: GET /identity/api/v1/me
  getMe: () => {
    return axiosClient.get('/identity/api/v1/me');
  },

  // API: GET /identity/api/v1/profile
  getProfile: () => {
    return axiosClient.get('/identity/api/v1/profile');
  },

  // API: PATCH /identity/api/v1/profile
  updateProfile: (data) => {
    return axiosClient.patch('/identity/api/v1/profile', data);
  },

  // API: PUT /identity/api/v1/profile/avatar
  // Sử dụng FormData vì backend dùng @ModelAttribute và consumes multipart/form-data
  updateAvatar: (formData) => {
    return axiosClient.put('/identity/api/v1/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
