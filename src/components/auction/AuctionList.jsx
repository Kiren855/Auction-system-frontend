import { useEffect, useState } from 'react';
import { auctionApi } from '../../api/auctionApi';
import { useServerCountdown } from '../../hooks/useServerTimeCountdown';

export default function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [serverTime, setServerTime] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAuctions();
  }, [page]);

  const fetchAuctions = async () => {
    const res = await auctionApi.getAllSellerAuctions(page, 10);
    const data = res.data;

    setAuctions(data.result.content);
    setTotalPages(data.result.totalPages);
    setServerTime(data.server_time);
  };

  const { calculateRemaining } = useServerCountdown(auctions, serverTime);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ENDED':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return '';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Danh sách phiên đấu giá
            </h2>
            <span className="text-sm text-gray-500">
              Tổng: {auctions.length} phiên
            </span>
          </div>

          <div className="border-t my-6"></div>

          {/* Body */}
          <div className="space-y-5">
            {auctions.map((auction) => {
              const remaining = calculateRemaining(auction);

              return (
                <div
                  key={auction.id}
                  className="group bg-gray-50 border border-gray-200 rounded-xl p-6
           hover:bg-white hover:shadow-lg hover:border-gray-300
           transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    {/* LEFT: Title + Time */}
                    <div className="flex flex-col gap-3 flex-1">
                      {/* Title + Status */}
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {auction.item.title}
                        </h3>

                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyle(
                            auction.status,
                          )}`}
                        >
                          {auction.status}
                        </span>
                      </div>

                      {/* Time Range - nằm ngang */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>🕒</span>
                          <span>{formatDate(auction.start_at)}</span>
                        </div>

                        <span className="text-gray-400">→</span>

                        <div className="flex items-center gap-2">
                          <span>{formatDate(auction.end_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Countdown Block */}
                    <div className="ml-6">
                      {auction.status !== 'ENDED' ? (
                        <div className="bg-red-50 border border-red-100 px-6 py-3 rounded-xl text-center">
                          <div className="text-xs text-red-400 mb-1">
                            Thời gian còn lại
                          </div>
                          <div className="text-xl font-mono font-semibold text-red-600 tracking-wide">
                            {remaining}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 font-medium">
                          Đã kết thúc
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-6 mt-10">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Prev
            </button>

            <span className="text-sm text-gray-600">
              Trang {page + 1} / {totalPages}
            </span>

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
