import axiosClient from './axiosClient';

export const biddingApi = {
  getParticipants: (auctionId, page = 0, size = 10, status) => {
    return axiosClient.get(
      `/bidding/api/v1/participants/auctions/${auctionId}`,
      {
        params: { page, size, status },
      },
    );
  },

  joinAuction: (auctionId) => {
    return axiosClient.post(
      `/bidding/api/v1/participants/auctions/${auctionId}/join`,
    );
  },

  getHistoryLatestBids: (auctionId) => {
    return axiosClient.get(`/bidding/api/v1/auctions/${auctionId}/latest-bids`);
  },

  getAuctionMessages: (auctionId) => {
    return axiosClient.get(`/bidding/api/v1/auctions/${auctionId}/messages`);
  },

  sendAuctionMessage: (auctionId, data) => {
    return axiosClient.post(
      `/bidding/api/v1/auctions/${auctionId}/messages`,
      data,
    );
  },
};
