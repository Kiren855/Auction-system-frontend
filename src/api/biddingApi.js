import axiosClient from './axiosClient';

export const biddingApi = {
  getParticipants: (auctionId, page = 0, size = 10, status) => {
    return axiosClient.get(
      `/auction/api/v1/auctions/${auctionId}/participants`,
      {
        params: { page, size, status },
      },
    );
  },

  joinAuction: (auctionId) => {
    return axiosClient.post(
      `/auction/api/v1/auctions/${auctionId}/participants/join`,
    );
  },
  //////////////////////////////////////////////////
  getHistoryLatestBids: (auctionId) => {
    return axiosClient.get(`/auction/api/v1/auctions/${auctionId}/latest-bids`);
  },

  getAuctionMessages: (auctionId) => {
    return axiosClient.get(`/auction/api/v1/auctions/${auctionId}/messages`);
  },

  sendAuctionMessage: (auctionId, data) => {
    return axiosClient.post(
      `/auction/api/v1/auctions/${auctionId}/messages`,
      data,
    );
  },

  placeBid: (auctionId, amount) => {
    return axiosClient.post(`/auction/api/v1/auctions/${auctionId}/place-bid`, {
      amount,
    });
  },
};
