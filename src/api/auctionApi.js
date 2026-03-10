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
    return axiosClient.get('/auction/api/v1/auctions/seller/me', {
      params: { page, size },
    });
  },

  getAllCategories: () => {
    return axiosClient.get('/auction/api/v1/categories');
  },

  getHomeStats: () => {
    return axiosClient.get('/auction/api/v1/home/stats');
  },

  getHomeStats: () => {
    return axiosClient.get('/auction/api/v1/home/stats');
  },

  getAuctions: ({
    status,
    categoryId,
    keyword,
    page = 0,
    size = 12,
    sortBy,
    sortDir = 'asc',
  } = {}) => {
    const params = {
      page,
      size,
    };

    if (status) params.status = status;
    if (categoryId) params.categoryId = categoryId;
    if (keyword?.trim()) params.keyword = keyword.trim();
    if (sortBy) params.sortBy = sortBy;
    if (sortDir) params.sortDir = sortDir;

    return axiosClient.get('/auction/api/v1/auctions', { params });
  },

  /////////////////////////// PRODUCT
  getAllProducts: () => {
    return axiosClient.get('/auction/api/v1/products');
  },

  getAllProductPage: (page = 0, size = 10) => {
    return axiosClient.get('/auction/api/v1/products/list', {
      params: { page, size },
    });
  },

  getDetailProduct: (productId) => {
    return axiosClient.get(`/auction/api/v1/products/${productId}`);
  },

  deleteProduct: (productId) => {
    return axiosClient.delete(`/auction/api/v1/products/${productId}`);
  },

  /////////////////

  startAuction: (auctionId) => {
    return axiosClient.post(`/auction/api/v1/auctions/${auctionId}/start`);
  },

  cancelAuction: (auctionId) => {
    return axiosClient.post(`/auction/api/v1/auctions/${auctionId}/cancel`);
  },

  getMyParticipatedAuctions: (status, page = 0, size = 10) => {
    return axiosClient.get('/auction/api/v1/auctions/me/participated', {
      params: {
        status,
        page,
        size,
      },
    });
  },

  placeBid: (auctionId, amount) => {
    return axiosClient.post(`/auction/api/v1/auctions/${auctionId}/bids`, {
      amount,
      bidType: 'manual',
    });
  },
};
