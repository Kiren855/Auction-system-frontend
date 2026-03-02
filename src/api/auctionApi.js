import axiosClient from './axiosClient';

export const auctionApi = {
  // API: POST /auction/api/v1/auctions
  // Sử dụng FormData vì Controller của bạn dùng @ModelAttribute và nhận file
  createAuction: (formData) => {
    return axiosClient.post('/auction/api/v1/auctions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // API: GET /auction/api/v1/auctions/{auctionId}
  getAuctionDetail: (auctionId) => {
    return axiosClient.get(`/auction/api/v1/auctions/${auctionId}`);
  },

  // API: GET /auction/api/v1/auctions/seller/{sellerId}
  getAuctionsBySeller: (sellerId, page = 0, size = 10) => {
    return axiosClient.get(`/auction/api/v1/auctions/seller/${sellerId}`, {
      params: { page, size },
    });
  },

  getAllSellerAuctions: (page = 0, size = 10) => {
    return axiosClient.get('/auction/api/v1/auctions', {
      params: { page, size },
    });
  },

  getAllCategories: () => {
    return axiosClient.get('/auction/api/v1/categories');
  },

  getAllProducts: () => {
    return axiosClient.get('/auction/api/v1/products');
  },
};
