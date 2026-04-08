import { useEffect, useState } from 'react';
import { auctionApi } from '../../api/auctionApi';
import { useServerCountdown } from '../../hooks/useServerTimeCountdown';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'CREATED', label: 'Đã tạo' },
  { value: 'PENDING', label: 'Sắp diễn ra' },
  { value: 'ONGOING', label: 'Đang diễn ra' },
  { value: 'FINISHED', label: 'Đã kết thúc' },
  { value: 'CANCELLED', label: 'Đã huỷ' },
];

export default function AuctionList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = Math.max(Number(searchParams.get('page') || 1) - 1, 0);
  const initialKeyword = searchParams.get('keyword') || '';
  const initialStatus = searchParams.get('status') || '';

  const [auctions, setAuctions] = useState([]);
  const [serverTime, setServerTime] = useState(null);

  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [status, setStatus] = useState(initialStatus);
  const [searchInput, setSearchInput] = useState(initialKeyword);
  const [keyword, setKeyword] = useState(initialKeyword);

  useEffect(() => {
    const params = {};

    if (page > 0) params.page = String(page + 1);
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;

    setSearchParams(params, { replace: true });
  }, [page, keyword, status, setSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      setKeyword(trimmed);
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, keyword]);

  const fetchAuctions = async () => {
    try {
      const res = await auctionApi.getAllSellerAuctions({
        status: status || undefined,
        keyword: keyword || undefined,
        page,
        size: 10,
        sortBy: 'creationTimestamp',
        sortDir: 'desc',
      });

      const data = res?.data || {};
      const result = data?.result || {};

      setAuctions(result?.content || []);
      setTotalPages(Number(result?.totalPages ?? 1));
      setTotalElements(Number(result?.totalElements ?? 0));
      setServerTime(data?.server_time || null);
    } catch (error) {
      console.error('Fetch seller auctions failed:', error);
      setAuctions([]);
      setTotalPages(1);
      setTotalElements(0);
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

  const getStatusStyle = (status) => {
    switch (normalizeStatus(status)) {
      case 'CREATED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'PENDING':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ONGOING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'FINISHED':
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
      CANCELLED: 'Đã huỷ',
      APPROVED: 'Được chấp nhận',
      REJECTED: 'Bị từ chối',
    };

    return map[normalizeStatus(status)] || status;
  };

  const shouldShowCountdown = (status) => {
    const s = normalizeStatus(status);
    return s === 'PENDING' || s === 'ONGOING';
  };

  const getCountdownLabel = (status) => {
    const s = normalizeStatus(status);
    if (s === 'PENDING') return 'Bắt đầu sau';
    if (s === 'ONGOING') return 'Còn lại';
    return '';
  };

  const getCountdownBadgeClass = (status, isUrgent) => {
    const s = normalizeStatus(status);

    if (s === 'PENDING') {
      return isUrgent
        ? 'animate-pulse border-emerald-300 bg-emerald-600 text-white'
        : 'border-emerald-200 bg-white text-emerald-700';
    }

    return isUrgent
      ? 'animate-pulse border-rose-300 bg-rose-600 text-white'
      : 'border-rose-200 bg-white text-rose-700';
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

  const handlePageChange = (nextPage) => {
    if (nextPage < 0 || nextPage >= totalPages) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">
              Danh sách phiên đấu giá
            </h2>

            <button
              onClick={() => navigate('/seller/auctions/create/product')}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + Tạo phiên đấu giá
            </button>
          </div>

          <div className="my-6 border-t" />

          <div className="mb-6 flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 transition-all focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-200">
                <Search size={16} className="shrink-0 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm theo tên phiên đấu giá..."
                  className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="md:w-56">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {auctions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
              <div className="mb-3 text-3xl">📭</div>
              <div className="font-semibold text-gray-800">
                Chưa có phiên đấu giá nào
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Hãy tạo phiên đấu giá mới để bắt đầu.
              </div>
              <button
                onClick={() => navigate('/seller/auctions/create/product')}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                + Tạo phiên đấu giá
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {auctions.map((auction) => {
                const auctionStatus = normalizeStatus(auction.status);
                const showCountdown = shouldShowCountdown(auctionStatus);
                const remaining = showCountdown
                  ? calculateRemaining(auction)
                  : null;

                const targetTime =
                  auctionStatus === 'PENDING'
                    ? auction.start_at
                    : auction.end_at;

                const nowMs = new Date(serverTime).getTime();
                const targetMs = new Date(targetTime).getTime();
                const diffMs = targetMs - nowMs;

                const isUrgent =
                  Number.isFinite(nowMs) &&
                  Number.isFinite(targetMs) &&
                  diffMs > 0 &&
                  diffMs <= 5 * 60 * 1000;

                const countdownBadgeClass = getCountdownBadgeClass(
                  auctionStatus,
                  isUrgent,
                );

                return (
                  <div
                    key={auction.id}
                    onClick={() => navigate(`/seller/auctions/${auction.id}`)}
                    className="group cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-lg"
                  >
                    <div className="flex gap-5">
                      <div className="flex min-w-0 flex-1 gap-4">
                        <div className="shrink-0">
                          {auction.thumbnail_url ? (
                            <img
                              src={auction.thumbnail_url}
                              alt={auction.title}
                              className="h-24 w-24 rounded-2xl border border-gray-200 bg-gray-100 object-cover"
                            />
                          ) : (
                            <div
                              className={`flex h-24 w-24 items-center justify-center rounded-2xl border border-gray-200 text-3xl font-bold ${getFallbackThumbnailClass(
                                auction.title,
                              )}`}
                            >
                              {getTitleInitial(auction.title)}
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-lg font-semibold text-gray-800">
                              {auction?.title || '—'}
                            </h3>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                                auction.status,
                              )}`}
                            >
                              {getVietnameseStatus(auction.status)}
                            </span>

                            {showCountdown && (
                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${countdownBadgeClass}`}
                              >
                                {getCountdownLabel(auction.status)} {remaining}
                              </span>
                            )}
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
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/seller/auctions/${auction.id}`);
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={handlePageChange}
            className="mt-10"
            siblingCount={1}
          />
        </div>
      </div>
    </div>
  );
}
