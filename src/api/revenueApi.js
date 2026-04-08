import api from './axiosClient';

export const revenueApi = {
  getSummary: async () => {
    const response = await api.get('/payment/api/v1/seller/revenue/summary');
    return response.data;
  },

  getDetails: async ({ page = 0, size = 10, from, to } = {}) => {
    const params = {
      page,
      size,
    };

    if (from) params.from = from;
    if (to) params.to = to;

    const response = await api.get('/payment/api/v1/seller/revenue/details', {
      params,
    });
    return response.data;
  },

  getChart: async ({ type = 'month', from, to } = {}) => {
    const params = { type };

    if (from) params.from = from;
    if (to) params.to = to;

    const response = await api.get('/payment/api/v1/seller/revenue/chart', {
      params,
    });
    return response.data;
  },
};
