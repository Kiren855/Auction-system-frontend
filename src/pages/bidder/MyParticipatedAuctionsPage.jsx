import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Rows3,
  Gavel,
  Clock3,
  CalendarDays,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { auctionApi } from '../../api/auctionApi';
import { useServerCountdown } from '../../hooks/useServerTimeCountdown';
import Pagination from '../../components/common/Pagination';
import { toast, Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Sắp diễn ra', value: 'PENDING' },
  { label: 'Đang diễn ra', value: 'ONGOING' },
  { label: 'Đã kết thúc', value: 'FINISHED' },
  { label: 'Đã huỷ', value: 'CANCELLED' },
];

function formatDateTime(value) {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes) {
  const total = Number(minutes || 0);
  if (total <= 0) return '0 phút';

  const day = Math.floor(total / 1440);
  const hour = Math.floor((total % 1440) / 60);
  const min = total % 60;

  const parts = [];
  if (day > 0) parts.push(`${day} ngày`);
  if (hour > 0) parts.push(`${hour} giờ`);
  if (min > 0) parts.push(`${min} phút`);

  return parts.join(' ');
}

function normalizeStatus(value) {
  return String(value || '').toUpperCase();
}

function getAuctionStatusConfig(status) {
  switch (normalizeStatus(status)) {
    case 'CREATED':
      return {
        label: 'Đã tạo',
        className: 'border-sky-200 bg-sky-50 text-sky-700',
      };
    case 'PENDING':
      return {
        label: 'Sắp diễn ra',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      };
    case 'ONGOING':
      return {
        label: 'Đang diễn ra',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
      };
    case 'FINISHED':
      return {
        label: 'Đã kết thúc',
        className: 'border-slate-200 bg-slate-100 text-slate-700',
      };
    case 'COMPLETED':
      return {
        label: 'Đã hoàn thành',
        className: 'border-slate-200 bg-slate-100 text-slate-700',
      };
    case 'CANCELLED':
      return {
        label: 'Đã huỷ',
        className: 'border-rose-200 bg-rose-50 text-rose-700',
      };
    default:
      return {
        label: status || 'Không xác định',
        className: 'border-slate-200 bg-slate-100 text-slate-600',
      };
  }
}

function getDepositStatusConfig(status) {
  switch (normalizeStatus(status)) {
    case 'REQUIRED':
      return {
        label: 'Cần đặt cọc',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
      };
    case 'PAID':
      return {
        label: 'Đã đặt cọc',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      };
    case 'REFUNDED':
      return {
        label: 'Đã hoàn cọc',
        className: 'border-sky-200 bg-sky-50 text-sky-700',
      };
    case 'FORFEITED':
      return {
        label: 'Mất cọc',
        className: 'border-rose-200 bg-rose-50 text-rose-700',
      };
    default:
      return {
        label: status || '--',
        className: 'border-slate-200 bg-slate-100 text-slate-600',
      };
  }
}

function getParticipationStatusConfig(status) {
  switch (normalizeStatus(status)) {
    case 'JOINED':
      return {
        label: 'Đã tham gia',
        className: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      };
    case 'LEFT':
      return {
        label: 'Đã rời',
        className: 'border-slate-200 bg-slate-100 text-slate-600',
      };
    case 'BANNED':
      return {
        label: 'Bị chặn',
        className: 'border-rose-200 bg-rose-50 text-rose-700',
      };
    default:
      return {
        label: status || '--',
        className: 'border-slate-200 bg-slate-100 text-slate-600',
      };
  }
}

function getCountdownBadgeClass(status, isUrgent) {
  const s = normalizeStatus(status);

  if (s === 'PENDING') {
    return isUrgent
      ? 'animate-pulse border-emerald-300 bg-emerald-600 text-white'
      : 'border-emerald-200 bg-white text-emerald-700';
  }

  return isUrgent
    ? 'animate-pulse border-rose-300 bg-rose-600 text-white'
    : 'border-rose-200 bg-white text-rose-700';
}

function getCountdownLabel(status) {
  const s = normalizeStatus(status);
  if (s === 'PENDING') return 'Bắt đầu sau';
  if (s === 'ONGOING') return 'Còn lại';
  return '';
}

function getTitleInitial(title) {
  const text = String(title || '').trim();
  return text ? text.charAt(0).toUpperCase() : '?';
}

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

function getFallbackThumbnailClass(title) {
  const text = String(title || '');
  const hash = [...text].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return thumbnailPalette[hash % thumbnailPalette.length];
}

function ParticipatedAuctionCard({
  item,
  onViewDetail,
  showCountdown,
  countdownLabel,
  countdownText,
  countdownClassName,
}) {
  const auctionStatus = getAuctionStatusConfig(item?.status);
  const depositStatus = getDepositStatusConfig(item?.deposit_status);
  const participationStatus = getParticipationStatusConfig(
    item?.participation_status,
  );

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        {item?.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item?.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center text-4xl font-bold ${getFallbackThumbnailClass(
              item?.title,
            )}`}
          >
            {getTitleInitial(item?.title)}
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${auctionStatus.className}`}
          >
            {auctionStatus.label}
          </span>
        </div>

        {showCountdown && (
          <div className="absolute right-4 top-4">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${countdownClassName}`}
            >
              {countdownLabel} {countdownText}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
          {item?.title || '—'}
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CalendarDays size={14} />
              Bắt đầu
            </div>
            <div className="mt-1 font-bold text-slate-900">
              {formatDateTime(item?.start_at)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clock3 size={14} />
              Thời lượng
            </div>
            <div className="mt-1 font-bold text-slate-900">
              {formatDuration(item?.duration_minutes)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <UserCheck size={14} />
              Tham gia lúc
            </div>
            <div className="mt-1 font-bold text-slate-900">
              {formatDateTime(item?.joined_at)}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => onViewDetail(item)}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Vào phiên đấu giá
          </button>
        </div>
      </div>
    </div>
  );
}

function ParticipatedAuctionRow({
  item,
  onViewDetail,
  showCountdown,
  countdownLabel,
  countdownText,
  countdownClassName,
}) {
  const auctionStatus = getAuctionStatusConfig(item?.status);
  const depositStatus = getDepositStatusConfig(item?.deposit_status);
  const participationStatus = getParticipationStatusConfig(
    item?.participation_status,
  );

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 md:flex-row">
        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-3xl bg-slate-100 md:w-44">
          {item?.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item?.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center text-3xl font-bold ${getFallbackThumbnailClass(
                item?.title,
              )}`}
            >
              {getTitleInitial(item?.title)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Hàng trên: Title và Countdown */}
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="line-clamp-2 text-lg font-bold text-slate-900 flex items-center gap-3">
              {item?.title || '—'}
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${auctionStatus.className}`}
              >
                {auctionStatus.label}
              </span>

              {showCountdown && (
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${countdownClassName}`}
                >
                  {countdownLabel} {countdownText}
                </span>
              )}
            </h3>
          </div>

          {/* Hàng dưới: 3 thẻ thông tin + 1 Button cùng 1 hàng */}
          <div className="mt-4 flex flex-wrap items-end gap-3">
            {/* Bắt đầu */}
            <div className="min-w-37.5 flex-1 rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CalendarDays size={14} />
                Bắt đầu
              </div>
              <div className="mt-1 font-bold text-slate-900">
                {formatDateTime(item?.start_at)}
              </div>
            </div>

            {/* Thời lượng */}
            <div className="min-w-30 flex-1 rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Clock3 size={14} />
                Thời lượng
              </div>
              <div className="mt-1 font-bold text-slate-900">
                {formatDuration(item?.duration_minutes)}
              </div>
            </div>

            {/* Tham gia lúc */}
            <div className="min-w-37.5 flex-1 rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <ShieldCheck size={14} />
                Tham gia lúc
              </div>
              <div className="mt-1 font-bold text-slate-900">
                {formatDateTime(item?.joined_at)}
              </div>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => onViewDetail(item)}
                className="h-full rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Vào phiên đấu giá
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyParticipatedAuctionsPage() {
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState([]);
  const [serverTime, setServerTime] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);

  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });

  const [status, setStatus] = useState('');

  const fetchParticipatedAuctions = useCallback(
    async (page = 0) => {
      try {
        setLoading(true);

        const res = await auctionApi.getMyParticipatedAuctions(
          status || null,
          page,
          PAGE_SIZE,
        );

        const data = res?.data || res;
        const result = data?.result || {};

        setAuctions(result?.content || []);
        setServerTime(data?.server_time || new Date().toISOString());

        setPageInfo({
          pageNumber: Number(result?.pageNumber ?? page ?? 0),
          totalPages: Number(result?.totalPages ?? 0),
          totalElements: Number(result?.totalElements ?? 0),
        });
      } catch (error) {
        console.error('Fetch participated auctions failed:', error);
        setAuctions([]);
        setPageInfo({
          pageNumber: 0,
          totalPages: 0,
          totalElements: 0,
        });
      } finally {
        setLoading(false);
      }
    },
    [status],
  );
  const location = useLocation();
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    if (location.state?.showSuccessToast && !hasShownToastRef.current) {
      hasShownToastRef.current = true;

      toast.success(location.state.message || 'Thành công');

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location, navigate]);

  useEffect(() => {
    fetchParticipatedAuctions(0);
  }, [fetchParticipatedAuctions]);

  const { calculateRemaining } = useServerCountdown(auctions, serverTime);

  const handleChangePage = (nextPage) => {
    if (nextPage < 0 || nextPage >= pageInfo.totalPages) return;
    fetchParticipatedAuctions(nextPage);
  };

  const handleViewDetail = (auction) => {
    const auctionId = auction?.auction_id;
    if (!auctionId) return;
    navigate(`/bidder/auctions/${auctionId}`);
  };

  const renderedItems = useMemo(() => {
    const nowMs = new Date(serverTime).getTime();

    return auctions.map((auction) => {
      const auctionStatus = normalizeStatus(auction?.status);
      const showCountdown =
        auctionStatus === 'PENDING' || auctionStatus === 'ONGOING';

      const countdownText = showCountdown ? calculateRemaining(auction) : null;

      const targetTime =
        auctionStatus === 'PENDING' ? auction?.start_at : auction?.end_at;

      const targetMs = new Date(targetTime).getTime();
      const diffMs = targetMs - nowMs;

      const isUrgent =
        Number.isFinite(targetMs) &&
        Number.isFinite(nowMs) &&
        diffMs > 0 &&
        diffMs <= 5 * 60 * 1000;

      return {
        item: auction,
        showCountdown,
        countdownLabel: getCountdownLabel(auctionStatus),
        countdownText,
        countdownClassName: getCountdownBadgeClass(auctionStatus, isUrgent),
      };
    });
  }, [auctions, calculateRemaining, serverTime]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Đấu giá đã tham gia
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Danh sách các phiên đấu giá bạn đã tham gia
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value || 'all'} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <div className="inline-flex w-fit items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutGrid size={16} />
                Dạng thẻ
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  viewMode === 'list'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Rows3 size={16} />
                Dạng danh sách
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
            Đang tải dữ liệu...
          </div>
        ) : auctions.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <div className="mb-3 text-3xl">🔎</div>
            <div className="text-lg font-semibold text-slate-800">
              Bạn chưa tham gia phiên đấu giá nào
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Hãy tham gia một phiên đấu giá để theo dõi tại đây.
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {renderedItems.map(
                  ({
                    item,
                    showCountdown,
                    countdownLabel,
                    countdownText,
                    countdownClassName,
                  }) => (
                    <ParticipatedAuctionCard
                      key={item.auction_id}
                      item={item}
                      onViewDetail={handleViewDetail}
                      showCountdown={showCountdown}
                      countdownLabel={countdownLabel}
                      countdownText={countdownText}
                      countdownClassName={countdownClassName}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {renderedItems.map(
                  ({
                    item,
                    showCountdown,
                    countdownLabel,
                    countdownText,
                    countdownClassName,
                  }) => (
                    <ParticipatedAuctionRow
                      key={item.auction_id}
                      item={item}
                      onViewDetail={handleViewDetail}
                      showCountdown={showCountdown}
                      countdownLabel={countdownLabel}
                      countdownText={countdownText}
                      countdownClassName={countdownClassName}
                    />
                  ),
                )}
              </div>
            )}

            <Pagination
              page={pageInfo.pageNumber}
              totalPages={pageInfo.totalPages}
              totalElements={pageInfo.totalElements}
              onPageChange={handleChangePage}
              className="mt-8"
              siblingCount={1}
            />
          </>
        )}
      </section>
    </div>
  );
}
