import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Truck,
  PackageCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { sellerOrderApi } from '../../../api/sellerOrderApi';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import SellerOrderStatsCards from './SellerOrderStatsCards';
import SellerOrderDetailModal from './SellerOrderDetailModal';
import SellerShippingModal from './SellerShippingModal';
import {
  formatCurrency,
  formatDateTime,
  getSettlementBadge,
  getFulfillmentBadge,
  canConfirmOrder,
  canUpdateShipping,
  canMarkShipped,
  canMarkDelivered,
} from '../../../utils/sellerOrderUtils';

const SETTLEMENT_OPTIONS = [
  { value: '', label: 'Tất cả thanh toán' },
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'PAYMENT_EXPIRED', label: 'Hết hạn thanh toán' },
];

const FULFILLMENT_OPTIONS = [
  { value: '', label: 'Tất cả xử lý đơn' },
  { value: 'WAITING_FOR_SELLER_CONFIRM', label: 'Chờ xác nhận' },
  { value: 'PREPARING', label: 'Đang chuẩn bị' },
  { value: 'READY_TO_SHIP', label: 'Sẵn sàng giao' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'COMPLETED', label: 'Hoàn tất' },
];

function ActionButton({
  icon,
  children,
  className = '',
  onClick,
  type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-xs font-semibold transition ${className}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
    >
      {options.map((option) => (
        <option key={option.value || 'all'} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default function SellerOrderManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = Math.max(Number(searchParams.get('page') || 1) - 1, 0);
  const initialKeyword = searchParams.get('keyword') || '';
  const initialSettlementStatus = searchParams.get('settlementStatus') || '';
  const initialFulfillmentStatus = searchParams.get('fulfillmentStatus') || '';

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keywordInput, setKeywordInput] = useState(initialKeyword);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [settlementStatus, setSettlementStatus] = useState(
    initialSettlementStatus,
  );
  const [fulfillmentStatus, setFulfillmentStatus] = useState(
    initialFulfillmentStatus,
  );
  const [page, setPage] = useState(initialPage);
  const [size] = useState(10);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingSubmitting, setShippingSubmitting] = useState(false);

  const [confirmState, setConfirmState] = useState({
    open: false,
    type: '',
    order: null,
    loading: false,
  });

  useEffect(() => {
    const params = {};

    if (page > 0) params.page = String(page + 1);
    if (keyword) params.keyword = keyword;
    if (settlementStatus) params.settlementStatus = settlementStatus;
    if (fulfillmentStatus) params.fulfillmentStatus = fulfillmentStatus;

    setSearchParams(params, { replace: true });
  }, [page, keyword, settlementStatus, fulfillmentStatus, setSearchParams]);

  const fetchStats = async () => {
    try {
      const res = await sellerOrderApi.getStatistics();
      setStats(res?.data?.result || null);
    } catch (error) {
      console.error('Không thể tải thống kê đơn hàng:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await sellerOrderApi.getOrders({
        keyword,
        settlementStatus,
        fulfillmentStatus,
        page,
        size,
      });

      const result = res?.data?.result;
      setOrders(Array.isArray(result?.content) ? result.content : []);
      setTotalPages(result?.totalPages ?? 0);
      setTotalElements(result?.totalElements ?? 0);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || 'Không thể tải danh sách đơn hàng',
      );
      setOrders([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [page, keyword, settlementStatus, fulfillmentStatus]);

  const handleSearch = () => {
    setPage(0);
    setKeyword(keywordInput.trim());
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleReset = () => {
    setKeywordInput('');
    setKeyword('');
    setSettlementStatus('');
    setFulfillmentStatus('');
    setPage(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleChangePage = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const openDetail = async (fulfillmentId) => {
    try {
      setDetailModalOpen(true);
      setDetailLoading(true);

      const res = await sellerOrderApi.getOrderDetail(fulfillmentId);
      setSelectedOrder(res?.data?.result || null);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || 'Không thể tải chi tiết đơn hàng',
      );
      setDetailModalOpen(false);
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const openShippingModal = () => {
    setShippingModalOpen(true);
  };

  const closeShippingModal = () => {
    if (shippingSubmitting) return;
    setShippingModalOpen(false);
  };

  const openConfirmModal = (type, order) => {
    setConfirmState({
      open: true,
      type,
      order,
      loading: false,
    });
  };

  const closeConfirmModal = () => {
    if (confirmState.loading) return;
    setConfirmState({
      open: false,
      type: '',
      order: null,
      loading: false,
    });
  };

  const confirmTitle = useMemo(() => {
    switch (confirmState.type) {
      case 'confirm':
        return 'Xác nhận xử lý đơn';
      case 'shipped':
        return 'Đánh dấu đã gửi hàng';
      case 'delivered':
        return 'Đánh dấu đã giao hàng';
      default:
        return 'Xác nhận thao tác';
    }
  }, [confirmState.type]);

  const confirmMessage = useMemo(() => {
    switch (confirmState.type) {
      case 'confirm':
        return 'Seller sẽ bắt đầu xử lý đơn hàng này. Bạn có chắc muốn tiếp tục?';
      case 'shipped':
        return 'Đơn hàng sẽ được chuyển sang trạng thái đang giao. Bạn có chắc muốn tiếp tục?';
      case 'delivered':
        return 'Đơn hàng sẽ được đánh dấu là đã giao thành công. Bạn có chắc muốn tiếp tục?';
      default:
        return '';
    }
  }, [confirmState.type]);

  const confirmText = useMemo(() => {
    switch (confirmState.type) {
      case 'confirm':
        return 'Xác nhận đơn';
      case 'shipped':
        return 'Đã gửi hàng';
      case 'delivered':
        return 'Đã giao hàng';
      default:
        return 'Xác nhận';
    }
  }, [confirmState.type]);

  const handleConfirmAction = async () => {
    const order = confirmState.order;
    if (!order?.fulfillmentId) return;

    try {
      setConfirmState((prev) => ({ ...prev, loading: true }));

      if (confirmState.type === 'confirm') {
        await sellerOrderApi.confirmOrder(order.fulfillmentId, {});
        toast.success('Xác nhận đơn thành công');
      }

      if (confirmState.type === 'shipped') {
        await sellerOrderApi.markShipped(order.fulfillmentId);
        toast.success('Đã cập nhật trạng thái gửi hàng');
      }

      if (confirmState.type === 'delivered') {
        await sellerOrderApi.markDelivered(order.fulfillmentId, {});
        toast.success('Đã cập nhật trạng thái giao thành công');
      }

      closeConfirmModal();
      await Promise.all([fetchOrders(), fetchStats()]);

      if (
        detailModalOpen &&
        selectedOrder?.fulfillmentId === order.fulfillmentId
      ) {
        const res = await sellerOrderApi.getOrderDetail(order.fulfillmentId);
        setSelectedOrder(res?.data?.result || null);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || 'Không thể thực hiện thao tác',
      );
      setConfirmState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSubmitShipping = async (payload) => {
    if (!selectedOrder?.fulfillmentId) return;

    try {
      setShippingSubmitting(true);
      await sellerOrderApi.updateShipping(selectedOrder.fulfillmentId, payload);
      toast.success('Cập nhật vận chuyển thành công');
      closeShippingModal();
      await Promise.all([fetchOrders(), fetchStats()]);

      const res = await sellerOrderApi.getOrderDetail(
        selectedOrder.fulfillmentId,
      );
      setSelectedOrder(res?.data?.result || null);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          'Không thể cập nhật thông tin vận chuyển',
      );
    } finally {
      setShippingSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Đơn hàng đấu giá
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Theo dõi thanh toán, xác nhận đơn và tiến độ giao hàng sau đấu
                giá.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                fetchStats();
                fetchOrders();
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          </div>
        </div>

        <SellerOrderStatsCards stats={stats} />

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex h-11 items-center gap-2 rounded-2xl border border-slate-300 px-3 transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100">
                <Search size={16} className="shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Tìm phiên đấu giá, người mua, email..."
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:items-center">
              <div className="min-w-55">
                <FilterSelect
                  value={settlementStatus}
                  onChange={(e) => {
                    setSettlementStatus(e.target.value);
                    setPage(0);
                  }}
                  options={SETTLEMENT_OPTIONS}
                />
              </div>

              <div className="min-w-55">
                <FilterSelect
                  value={fulfillmentStatus}
                  onChange={(e) => {
                    setFulfillmentStatus(e.target.value);
                    setPage(0);
                  }}
                  options={FULFILLMENT_OPTIONS}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Search size={15} />
                  Tìm kiếm
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex h-11 items-center whitespace-nowrap rounded-2xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Đặt lại
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="px-6 py-16 text-center text-slate-500">
              Đang tải danh sách đơn hàng...
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-8">
                <div className="text-lg font-bold text-slate-900">
                  Không có đơn hàng nào
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-390 w-full table-fixed">
                  <thead className="bg-slate-950">
                    <tr className="border-b border-slate-800">
                      <th className="w-[320px] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                        Phiên đấu giá
                      </th>
                      <th className="w-60 px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                        Người mua
                      </th>
                      <th className="w-35 px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-widest text-white">
                        Giá thắng
                      </th>
                      <th className="w-35 px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-widest text-white">
                        Còn lại
                      </th>
                      <th className="w-37.5 px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-widest text-white">
                        Seller nhận
                      </th>
                      <th className="w-42.5 px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                        Thanh toán
                      </th>
                      <th className="w-42.5 px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                        Xử lý đơn
                      </th>
                      <th className="w-57.5 px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-widest text-white">
                        Thao tác nhanh
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {orders.map((order) => {
                      const settlementBadge = getSettlementBadge(
                        order.settlementStatus,
                      );
                      const fulfillmentBadge = getFulfillmentBadge(
                        order.fulfillmentStatus,
                      );

                      return (
                        <tr
                          key={order.fulfillmentId}
                          className="align-top transition hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <div
                                  className="truncate text-sm font-bold text-slate-900"
                                  title={order.auctionTitle || '--'}
                                >
                                  {order.auctionTitle || '--'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="min-w-0">
                              <div
                                className="truncate text-sm font-semibold text-slate-900"
                                title={order.winnerEmail || '--'}
                              >
                                {order.winnerEmail || '--'}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <div className="whitespace-nowrap text-sm font-semibold text-slate-900">
                              {formatCurrency(order.winningAmount)}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <div className="whitespace-nowrap text-sm font-semibold text-amber-700">
                              {formatCurrency(order.remainingAmount)}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <div className="whitespace-nowrap text-sm font-bold text-emerald-700">
                              {formatCurrency(order.sellerReceiveAmount)}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${settlementBadge.className}`}
                            >
                              {settlementBadge.label}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${fulfillmentBadge.className}`}
                            >
                              {fulfillmentBadge.label}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2 whitespace-nowrap">
                              <ActionButton
                                icon={<Eye size={14} />}
                                onClick={() => openDetail(order.fulfillmentId)}
                                className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                              >
                                Chi tiết
                              </ActionButton>

                              {canConfirmOrder(order) && (
                                <ActionButton
                                  icon={<CheckCircle2 size={14} />}
                                  onClick={() =>
                                    openConfirmModal('confirm', order)
                                  }
                                  className="border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                                >
                                  Xác nhận
                                </ActionButton>
                              )}

                              {canUpdateShipping(order) && (
                                <ActionButton
                                  icon={<PackageCheck size={14} />}
                                  onClick={async () => {
                                    await openDetail(order.fulfillmentId);
                                    setShippingModalOpen(true);
                                  }}
                                  className="border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                                >
                                  Vận chuyển
                                </ActionButton>
                              )}

                              {canMarkShipped(order) && (
                                <ActionButton
                                  icon={<Truck size={14} />}
                                  onClick={() =>
                                    openConfirmModal('shipped', order)
                                  }
                                  className="border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                                >
                                  Đã gửi
                                </ActionButton>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 pb-6">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  onPageChange={handleChangePage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <SellerOrderDetailModal
        open={detailModalOpen}
        order={selectedOrder}
        onClose={closeDetail}
      >
        {detailLoading ? (
          <div className="rounded-3xl border border-slate-200 p-5 text-sm text-slate-500">
            Đang tải chi tiết đơn...
          </div>
        ) : selectedOrder ? (
          <div className="space-y-3">
            {canUpdateShipping(selectedOrder) && (
              <button
                type="button"
                onClick={openShippingModal}
                className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                Cập nhật vận chuyển
              </button>
            )}

            {canConfirmOrder(selectedOrder) && (
              <button
                type="button"
                onClick={() => openConfirmModal('confirm', selectedOrder)}
                className="w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                Xác nhận bắt đầu xử lý
              </button>
            )}

            {canMarkShipped(selectedOrder) && (
              <button
                type="button"
                onClick={() => openConfirmModal('shipped', selectedOrder)}
                className="w-full rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
              >
                Đánh dấu đã gửi hàng
              </button>
            )}

            {canMarkDelivered(selectedOrder) && (
              <button
                type="button"
                onClick={() => openConfirmModal('delivered', selectedOrder)}
                className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                Đánh dấu đã giao thành công
              </button>
            )}
          </div>
        ) : null}
      </SellerOrderDetailModal>

      <SellerShippingModal
        open={shippingModalOpen}
        order={selectedOrder}
        submitting={shippingSubmitting}
        onClose={closeShippingModal}
        onSubmit={handleSubmitShipping}
      />

      <ConfirmModal
        isOpen={confirmState.open}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        loading={confirmState.loading}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmText}
        cancelText="Hủy"
        variant="default"
      />
    </>
  );
}
