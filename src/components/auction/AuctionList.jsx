import { useEffect, useState } from 'react';
import { auctionApi } from '../../api/auctionApi';
import { useServerCountdown } from '../../hooks/useServerTimeCountdown';
import { useNavigate } from 'react-router-dom';

export default function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [serverTime, setServerTime] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchAuctions = async () => {
    try {
      const res = await auctionApi.getAllSellerAuctions(page, 10);
      const data = res.data;

      setAuctions(data?.result?.content || []);
      setTotalPages(data?.result?.totalPages ?? 1);
      setServerTime(data?.server_time || null);
    } catch (error) {
      console.error('Fetch seller auctions failed:', error);
      setAuctions([]);
      setTotalPages(1);
    }
  };

  const { calculateRemaining } = useServerCountdown(auctions, serverTime);

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const formatDuration = (minutes) => {
    const total = Number(minutes || 0);
    if (total <= 0) return '0 phút';

    const day = Math.floor(total / 1440);
    const hour = Math.floor((total % 1440) / 60);
    const min = total % 60;

    const parts = [];
    if (day > 0) parts.push(`${day} ngày`);
    if (hour > 0) parts.push(`${hour} tiếng`);
    if (min > 0) parts.push(`${min} phút`);

    return parts.join(' ');
  };

  const normalizeStatus = (status) => String(status || '').toUpperCase();

  const isEndedStatus = (status) => {
    const s = normalizeStatus(status);
    return s === 'FINISHED' || s === 'COMPLETED' || s === 'CANCELLED';
  };

  const getStatusStyle = (status) => {
    switch (normalizeStatus(status)) {
      case 'CREATED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'PENDING':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ONGOING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'FINISHED':
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getVietnameseStatus = (status) => {
    const map = {
      CREATED: 'Đã tạo',
      PENDING: 'Sắp diễn ra',
      ONGOING: 'Đang diễn ra',
      FINISHED: 'Đã kết thúc',
      COMPLETED: 'Đã hoàn thành',
      CANCELLED: 'Đã huỷ',
      APPROVED: 'Được chấp nhận',
      REJECTED: 'Bị từ chối',
    };

    return map[normalizeStatus(status)] || status;
  };

  const getCountdownLabel = (status) => {
    const s = normalizeStatus(status);
    if (s === 'PENDING') return 'Bắt đầu sau';
    if (s === 'ONGOING') return 'Còn lại';
    return '';
  };

  const getCountdownBoxClasses = (status) => {
    const s = normalizeStatus(status);

    if (s === 'PENDING') {
      return {
        box: 'bg-emerald-50 border-emerald-100',
        label: 'text-emerald-500',
        time: 'text-emerald-700',
      };
    }

    return {
      box: 'bg-red-50 border-red-100',
      label: 'text-red-400',
      time: 'text-red-600',
    };
  };

  const getTitleInitial = (title) => {
    const text = String(title || '').trim();
    return text ? text.charAt(0).toUpperCase() : '?';
  };

  const thumbnailPalette = [
    'bg-rose-100 text-rose-700',
    'bg-pink-100 text-pink-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-yellow-100 text-yellow-700',
    'bg-lime-100 text-lime-700',
    'bg-green-100 text-green-700',
    'bg-emerald-100 text-emerald-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700',
    'bg-sky-100 text-sky-700',
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-purple-100 text-purple-700',
  ];

  const getFallbackThumbnailClass = (title) => {
    const text = String(title || '');
    const hash = [...text].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return thumbnailPalette[hash % thumbnailPalette.length];
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Danh sách phiên đấu giá
            </h2>

            <button
              onClick={() => navigate('/seller/auctions/create/product')}
              className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
            >
              + Tạo phiên đấu giá
            </button>
          </div>

          <div className="border-t my-6"></div>

          {auctions.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
              <div className="text-3xl mb-3">📭</div>
              <div className="text-gray-800 font-semibold">
                Chưa có phiên đấu giá nào
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Hãy tạo phiên đấu giá mới để bắt đầu.
              </div>
              <button
                onClick={() => navigate('/seller/auctions/create/product')}
                className="mt-5 inline-flex items-center justify-center bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
              >
                + Tạo phiên đấu giá
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {auctions.map((auction) => {
                const remaining = calculateRemaining(auction);
                const ended = isEndedStatus(auction.status);
                const countdownCls = getCountdownBoxClasses(auction.status);

                return (
                  <div
                    key={auction.id}
                    onClick={() => navigate(`/seller/auctions/${auction.id}`)}
                    className="group bg-gray-50 border border-gray-200 rounded-xl p-5 hover:bg-white hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-5">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <div className="shrink-0">
                          {auction.thumbnail_url ? (
                            <img
                              src={auction.thumbnail_url}
                              alt={auction.title}
                              className="w-24 h-24 rounded-2xl object-cover border border-gray-200 bg-gray-100"
                            />
                          ) : (
                            <div
                              className={`w-24 h-24 rounded-2xl border border-gray-200 flex items-center justify-center text-3xl font-bold ${getFallbackThumbnailClass(
                                auction.title,
                              )}`}
                            >
                              {getTitleInitial(auction.title)}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                              {auction?.title || '—'}
                            </h3>

                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyle(
                                auction.status,
                              )}`}
                            >
                              {getVietnameseStatus(auction.status)}
                            </span>
                          </div>

                          <div className="text-sm text-gray-500">
                            Sản phẩm:{' '}
                            <span className="font-medium text-gray-700">
                              {auction?.item?.itemName || '--'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span>🕒</span>
                              <span className="text-gray-500">Bắt đầu:</span>
                              <span className="font-medium text-gray-800">
                                {formatDate(auction.start_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span>⏳</span>
                              <span className="text-gray-500">Diễn ra:</span>
                              <span className="font-medium text-gray-800">
                                {formatDuration(auction.duration_minutes)}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-400 break-all">
                            Auction ID: {auction.id}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {ended ? (
                          <div className="min-w-45 px-6 py-3" />
                        ) : (
                          <div
                            className={`px-6 py-3 rounded-xl text-center min-w-45 border ${countdownCls.box}`}
                          >
                            <div
                              className={`text-xs mb-1 ${countdownCls.label}`}
                            >
                              {getCountdownLabel(auction.status)}
                            </div>

                            <div
                              className={`text-xl font-mono font-semibold tracking-wide ${countdownCls.time}`}
                            >
                              {remaining}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-center items-center gap-6 mt-10">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Prev
            </button>

            <span className="text-sm text-gray-600">
              Trang {page + 1} / {totalPages}
            </span>

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
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
