import axiosClient from './axiosClient';

export const sellerOrderApi = {
  getOrders(params) {
    return axiosClient.get('/payment/api/v1/seller/orders', { params });
  },

  getStatistics() {
    return axiosClient.get('/payment/api/v1/seller/orders/statistics');
  },

  getOrderDetail(fulfillmentId) {
    return axiosClient.get(`/payment/api/v1/seller/orders/${fulfillmentId}`);
  },

  confirmOrder(fulfillmentId, payload = {}) {
    return axiosClient.post(
      `/payment/api/v1/seller/orders/${fulfillmentId}/confirm`,
      payload,
    );
  },

  updateShipping(fulfillmentId, payload) {
    return axiosClient.post(
      `/payment/api/v1/seller/orders/${fulfillmentId}/shipping`,
      payload,
    );
  },

  markShipped(fulfillmentId) {
    return axiosClient.post(
      `/payment/api/v1/seller/orders/${fulfillmentId}/mark-shipped`,
    );
  },

  markDelivered(fulfillmentId, payload = {}) {
    return axiosClient.post(
      `/payment/api/v1/seller/orders/${fulfillmentId}/mark-delivered`,
      payload,
    );
  },
};
