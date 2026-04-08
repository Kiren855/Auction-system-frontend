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

  getAddresses() {
    return axiosClient.get('/identity/api/v1/addresses/me');
  },

  createAddress(payload) {
    return axiosClient.post('/identity/api/v1/addresses', payload);
  },

  updateAddress(id, payload) {
    return axiosClient.put(`/identity/api/v1/addresses/${id}`, payload);
  },

  deleteAddress(id) {
    return axiosClient.delete(`/identity/api/v1/addresses/${id}`);
  },

  setDefaultAddress(id) {
    return axiosClient.put(`/identity/api/v1/addresses/${id}/default`);
  },

  getAdministrativeProvinces() {
    return axiosClient.get('/identity/api/v1/administrative/provinces');
  },

  getAdministrativeWards(provinceCode) {
    return axiosClient.get('/identity/api/v1/administrative/wards', {
      params: { provinceCode },
    });
  },
};
