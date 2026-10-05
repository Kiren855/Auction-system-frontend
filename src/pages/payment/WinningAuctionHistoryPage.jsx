import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Wallet,
  Clock3,
  Gavel,
  CircleDollarSign,
  LayoutGrid,
  Rows3,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import { paymentApi } from '../../api/paymentApi';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import { usePaymentCountdown } from '../../hooks/usePaymentCountdown';

const PAGE_SIZE = 8;

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ thanh toán' },
  { key: 'PAID', label: 'Đã thanh toán' },
  { key: 'PAYMENT_EXPIRED', label: 'Hết hạn thanh toán' },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

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

function getSettlementStatusConfig(status) {
  switch (String(status || '').toUpperCase()) {
    case 'PENDING':
      return {
        label: 'Chờ thanh toán',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
      };
    case 'PAID':
      return {
        label: 'Đã thanh toán',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      };
    case 'PAYMENT_EXPIRED':
      return {
        label: 'Hết hạn thanh toán',
        className: 'border-rose-200 bg-rose-50 text-rose-700',
      };
    default:
      return {
        label: status || 'Không xác định',
        className: 'border-slate-200 bg-slate-100 text-slate-600',
      };
  }
}

function NotificationToast({ toast, onClose }) {
  if (!toast?.show) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  const icon = isSuccess ? (
    <CheckCircle2 size={18} />
  ) : isError ? (
    <AlertCircle size={18} />
  ) : (
    <Info size={18} />
  );

  const className = isSuccess
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : isError
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-sky-200 bg-sky-50 text-sky-700';

  return (
    <div className="fixed right-4 top-4 z-100">
      <div
        className={`flex min-w-[320px] max-w-105 items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${className}`}
      >
        <div className="mt-0.5 shrink-0">{icon}</div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{toast.title}</div>
          {toast.message ? (
            <div className="mt-1 text-sm opacity-90">{toast.message}</div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full p-1 transition hover:bg-black/5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function WinningAuctionCard({
  item,
  onPay,
  onViewDetail,
  canPay,
  countdownText,
  showCountdown,
  isUrgent,
}) {
  const settlementStatus = getSettlementStatusConfig(item?.settlementStatus);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        {item?.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item?.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Gavel size={36} />
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${settlementStatus.className}`}
          >
            {settlementStatus.label}
          </span>
        </div>

        {showCountdown && (
          <div className="absolute right-4 top-4">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                isUrgent
                  ? 'animate-pulse border-rose-300 bg-rose-600 text-white'
                  : 'border-rose-200 bg-white text-rose-700'
              }`}
            >
              Còn lại {countdownText}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
          {item?.title}
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Trophy size={14} />
              Giá thắng
            </div>
            <div className="mt-2 font-black text-slate-900">
              {formatCurrency(item?.winningAmount)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Wallet size={14} />
              Đã đặt cọc
            </div>
            <div className="mt-2 font-black text-slate-900">
              {formatCurrency(item?.depositAmount)}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
            <CircleDollarSign size={14} />
            Cần thanh toán
          </div>
          <div className="mt-2 text-xl font-black text-amber-800">
            {formatCurrency(item?.remainingAmount)}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Clock3 size={16} />
          Hạn thanh toán:
          <span className="font-semibold text-slate-700">
            {formatDateTime(item?.expireAt)}
          </span>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => onViewDetail(item)}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50"
          >
            Xem chi tiết
          </button>

          <button
            onClick={() => onPay(item)}
            disabled={!canPay}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${
              canPay
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'cursor-not-allowed bg-slate-200 text-slate-500'
            }`}
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}

function WinningAuctionRow({
  item,
  onPay,
  onViewDetail,
  canPay,
  countdownText,
  showCountdown,
  isUrgent,
}) {
  const settlementStatus = getSettlementStatusConfig(item?.settlementStatus);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 md:flex-row">
        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-3xl bg-slate-100 md:w-44">
          {item?.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item?.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              <Gavel size={30} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="line-clamp-2 flex items-center gap-3 text-lg font-bold text-slate-900">
                  {item?.title}
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${settlementStatus.className}`}
                  >
                    {settlementStatus.label}
                  </span>
                </h3>

                {showCountdown && (
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      isUrgent
                        ? 'animate-pulse border-rose-300 bg-rose-600 text-white'
                        : 'border-rose-200 bg-white text-rose-700'
                    }`}
                  >
                    Còn lại {countdownText}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold text-slate-500">
                    Giá thắng
                  </div>
                  <div className="mt-1 font-bold text-slate-900">
                    {formatCurrency(item?.winningAmount)}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold text-slate-500">
                    Đã đặt cọc
                  </div>
                  <div className="mt-1 font-bold text-slate-900">
                    {formatCurrency(item?.depositAmount)}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <div className="text-xs font-semibold text-amber-700">
                    Còn lại cần thanh toán
                  </div>
                  <div className="mt-1 font-bold text-amber-800">
                    {formatCurrency(item?.remainingAmount)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <Clock3 size={16} />
                Hạn thanh toán:
                <span className="font-semibold text-slate-700">
                  {formatDateTime(item?.expireAt)}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3 md:pb-1">
              <button
                onClick={() => onViewDetail(item)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold transition-colors hover:bg-slate-50 md:flex-none"
              >
                Xem chi tiết
              </button>

              <button
                onClick={() => onPay(item)}
                disabled={!canPay}
                className={`flex-1 rounded-2xl px-6 py-3 text-sm font-semibold transition-colors md:flex-none ${
                  canPay
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'cursor-not-allowed bg-slate-200 text-slate-500'
                }`}
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WinningAuctionHistoryPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [serverTime, setServerTime] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });

  const [activeFilter, setActiveFilter] = useState('all');

  const [payModal, setPayModal] = useState({
    isOpen: false,
    loading: false,
    auctionId: null,
    auctionTitle: '',
    remainingAmount: 0,
  });

  const [insufficientModal, setInsufficientModal] = useState({
    isOpen: false,
    loading: false,
    auctionId: null,
    auctionTitle: '',
    remainingAmount: 0,
  });

  const [toast, setToast] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
  });

  const { getRemaining, isExpired } = usePaymentCountdown(serverTime);

  const showToast = useCallback((type, title, message = '') => {
    setToast({
      show: true,
      type,
      title,
      message,
    });
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    if (!toast.show) return undefined;

    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast.show]);

  const fetchWinningAuctions = useCallback(
    async (page = 0) => {
      try {
        setLoading(true);

        const res = await paymentApi.getMyWinningAuctions({
          page,
          size: PAGE_SIZE,
          status: activeFilter === 'all' ? undefined : activeFilter,
        });

        const data = res?.data || res;
        const result = data?.result || {};

        setItems(result?.content || []);
        setServerTime(data?.server_time || new Date().toISOString());

        setPageInfo({
          pageNumber: Number(result?.pageNumber ?? 0),
          totalPages: Number(result?.totalPages ?? 0),
          totalElements: Number(result?.totalElements ?? 0),
        });
      } catch (error) {
        console.error('Fetch winning auctions failed:', error);
        setItems([]);
        setPageInfo({
          pageNumber: 0,
          totalPages: 0,
          totalElements: 0,
        });
        showToast('error', 'Không thể tải danh sách', 'Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    },
    [activeFilter, showToast],
  );

  useEffect(() => {
    fetchWinningAuctions(0);
  }, [fetchWinningAuctions]);

  const openPayModal = (auction) => {
    setPayModal({
      isOpen: true,
      loading: false,
      auctionId: auction.auctionId,
      auctionTitle: auction.title,
      remainingAmount: auction.remainingAmount,
    });
  };

  const closePayModal = () =>
    setPayModal((prev) => ({
      ...prev,
      isOpen: false,
      loading: false,
    }));

  const openInsufficientModal = (auctionInfo) => {
    setInsufficientModal({
      isOpen: true,
      loading: false,
      auctionId: auctionInfo.auctionId,
      auctionTitle: auctionInfo.auctionTitle,
      remainingAmount: auctionInfo.remainingAmount,
    });
  };

  const closeInsufficientModal = () =>
    setInsufficientModal((prev) => ({
      ...prev,
      isOpen: false,
      loading: false,
    }));

  const handleViewDetail = (auction) => {
    navigate(`/auctions/${auction.auctionId}`);
  };

  const handleChangePage = (nextPage) => {
    if (nextPage < 0 || nextPage >= pageInfo.totalPages) return;
    fetchWinningAuctions(nextPage);
  };

  const handleConfirmPayment = async () => {
    const currentAuctionId = payModal.auctionId;

    if (!currentAuctionId) return;

    try {
      setPayModal((prev) => ({ ...prev, loading: true }));

      const summaryRes =
        await paymentApi.getAuctionPaymentSummary(currentAuctionId);
      const summaryData = summaryRes?.data || summaryRes;
      const summary = summaryData?.result || {};

      const walletSufficient =
        summary?.walletSufficient === true ||
        summary?.sufficient === true ||
        Number(summary?.walletAvailableBalance || 0) >=
          Number(summary?.remainingAmount || payModal.remainingAmount || 0);

      if (walletSufficient) {
        await paymentApi.payAuctionByWallet(currentAuctionId);

        closePayModal();
        showToast(
          'success',
          'Thanh toán thành công',
          `Bạn đã thanh toán ${formatCurrency(
            payModal.remainingAmount,
          )} cho "${payModal.auctionTitle}".`,
        );

        await fetchWinningAuctions(pageInfo.pageNumber);
        return;
      }

      const nextModalData = {
        auctionId: payModal.auctionId,
        auctionTitle: payModal.auctionTitle,
        remainingAmount: payModal.remainingAmount,
      };

      closePayModal();
      openInsufficientModal(nextModalData);
    } catch (error) {
      console.error('Check or pay auction failed:', error);

      const message =
        error?.response?.data?.message ||
        'Có lỗi xảy ra trong quá trình thanh toán.';

      setPayModal((prev) => ({ ...prev, loading: false }));
      showToast('error', 'Thanh toán thất bại', message);
    }
  };

  const handleConfirmOnlinePayment = async () => {
    const currentAuctionId = insufficientModal.auctionId;

    if (!currentAuctionId) return;

    try {
      setInsufficientModal((prev) => ({ ...prev, loading: true }));

      const orderRes =
        await paymentApi.createAuctionPaymentOrder(currentAuctionId);
      const orderData = orderRes?.data || orderRes;
      const paymentUrl = orderData?.result?.paymentUrl;

      if (!paymentUrl) {
        throw new Error('Không nhận được đường dẫn thanh toán.');
      }

      showToast(
        'info',
        'Đang chuyển sang cổng thanh toán',
        'Vui lòng hoàn tất thanh toán trực tuyến để xác nhận đơn hàng.',
      );

      closeInsufficientModal();
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Create online payment order failed:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tạo đơn thanh toán trực tuyến.';

      setInsufficientModal((prev) => ({ ...prev, loading: false }));
      showToast('error', 'Không thể tạo thanh toán trực tuyến', message);
    }
  };

  const renderedItems = useMemo(() => {
    return items.map((item) => {
      const pending =
        String(item?.settlementStatus || '').toUpperCase() === 'PENDING';
      const expired = isExpired(item?.expireAt);
      const canPay = pending && !expired;
      const showCountdown = pending && !expired && item?.expireAt;
      const countdownText = getRemaining(item?.expireAt);

      const expireMs = new Date(item?.expireAt).getTime();
      const nowMs = new Date(serverTime).getTime();

      const isUrgent =
        Number.isFinite(expireMs) &&
        Number.isFinite(nowMs) &&
        expireMs - nowMs <= 5 * 60 * 1000 &&
        expireMs - nowMs > 0;

      return {
        item,
        canPay,
        showCountdown,
        countdownText,
        isUrgent,
      };
    });
  }, [items, getRemaining, isExpired, serverTime]);

  return (
    <div className="min-h-screen bg-slate-50">
      <NotificationToast toast={toast} onClose={closeToast} />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === f.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

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

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
            Đang tải dữ liệu...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <div className="text-lg font-semibold text-slate-800">
              Chưa có phiên thắng nào
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Hãy thử thay đổi bộ lọc để xem thêm kết quả.
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {renderedItems.map(
                  ({
                    item,
                    canPay,
                    showCountdown,
                    countdownText,
                    isUrgent,
                  }) => (
                    <WinningAuctionCard
                      key={item.auctionId}
                      item={item}
                      onPay={openPayModal}
                      onViewDetail={handleViewDetail}
                      canPay={canPay}
                      showCountdown={showCountdown}
                      countdownText={countdownText}
                      isUrgent={isUrgent}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {renderedItems.map(
                  ({
                    item,
                    canPay,
                    showCountdown,
                    countdownText,
                    isUrgent,
                  }) => (
                    <WinningAuctionRow
                      key={item.auctionId}
                      item={item}
                      onPay={openPayModal}
                      onViewDetail={handleViewDetail}
                      canPay={canPay}
                      showCountdown={showCountdown}
                      countdownText={countdownText}
                      isUrgent={isUrgent}
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

      <ConfirmModal
        isOpen={payModal.isOpen}
        onClose={closePayModal}
        onConfirm={handleConfirmPayment}
        loading={payModal.loading}
        title="Xác nhận thanh toán"
        message={`Bạn có muốn thanh toán ${formatCurrency(
          payModal.remainingAmount,
        )} cho "${payModal.auctionTitle}" không?`}
        confirmText="Thanh toán"
        cancelText="Hủy"
        variant="payment"
      />

      <ConfirmModal
        isOpen={insufficientModal.isOpen}
        onClose={closeInsufficientModal}
        onConfirm={handleConfirmOnlinePayment}
        loading={insufficientModal.loading}
        title="Số dư ví không đủ"
        message={`Số dư ví của bạn hiện không đủ để thanh toán ${formatCurrency(
          insufficientModal.remainingAmount,
        )} cho "${insufficientModal.auctionTitle}". Bạn có muốn chuyển sang thanh toán trực tuyến không?`}
        confirmText="Thanh toán trực tuyến"
        cancelText="Hủy"
        variant="payment"
      />
    </div>
  );
}
