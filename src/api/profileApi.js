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

  // API: PUT /identity/api/v1/profile
  // Sử dụng FormData vì backend dùng @ModelAttribute và consumes multipart/form-data
  updateProfile: (formData) => {
    return axiosClient.patch('/identity/api/v1/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getAddresses: () => {
    return axiosClient.get('/identity/api/v1/profile/address');
  },

  // Thêm địa chỉ mới
  addAddress: (data) => {
    return axiosClient.post('/identity/api/v1/profile/address', data);
  },

  // Set địa chỉ mặc định
  setDefaultAddress: (addressId) => {
    return axiosClient.post(
      `/identity/api/v1/profile/address/${addressId}/default`,
    );
  },

  // Xoá địa chỉ
  deleteAddress: (addressId) => {
    return axiosClient.delete(`/identity/api/v1/profile/address/${addressId}`);
  },
};
