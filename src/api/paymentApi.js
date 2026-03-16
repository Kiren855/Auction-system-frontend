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

  getMyWinningAuctions: ({ status, page = 0, size = 10 } = {}) => {
    const params = { page, size };

    if (status) params.status = status;

    return axiosClient.get(
      '/payment/api/v1/auction-settlements/my-winning-auctions',
      {
        params,
      },
    );
  },

  getAuctionPaymentSummary: (auctionId) => {
    return axiosClient.get(
      `/payment/api/v1/auction-settlements/${auctionId}/payment-summary`,
    );
  },

  payAuctionByWallet: (auctionId) => {
    return axiosClient.post(
      `/payment/api/v1/auction-settlements/${auctionId}/pay-by-wallet`,
    );
  },

  createAuctionPaymentOrder: (auctionId) => {
    return axiosClient.post(
      `/payment/api/v1/auction-settlements/${auctionId}/create-payment-order`,
    );
  },
};
