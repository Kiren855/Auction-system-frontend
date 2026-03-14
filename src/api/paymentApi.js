import axiosClient from './axiosClient';

export const paymentApi = {
  getMyWallet: () => {
    return axiosClient.get('/payment/api/v1/wallets/me');
  },

  getTopupPackages: () => {
    return axiosClient.get('/payment/api/v1/topup-packages');
  },

  createTopupOrder: (packageId) => {
    return axiosClient.post('/payment/api/v1/payment-orders/topup', {
      packageId,
    });
  },
};
