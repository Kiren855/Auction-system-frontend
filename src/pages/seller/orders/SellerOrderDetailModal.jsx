import { X, MapPin, Phone, User, Package, Wallet } from 'lucide-react';
import {
  formatCurrency,
  formatDateTime,
  getSettlementBadge,
  getFulfillmentBadge,
} from '../../../utils/sellerOrderUtils';

export default function SellerOrderDetailModal({
  open,
  order,
  onClose,
  children,
}) {
  if (!open || !order) return null;

  const settlementBadge = getSettlementBadge(order.settlementStatus);
  const fulfillmentBadge = getFulfillmentBadge(order.fulfillmentStatus);

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Chi tiết đơn hàng
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Theo dõi thanh toán, người nhận và trạng thái giao hàng
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-84px)] overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-6">
              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                    {order.auctionThumbnailUrl ? (
                      <img
                        src={order.auctionThumbnailUrl}
                        alt={order.auctionTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Package size={22} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-lg font-bold text-slate-900">
                      {order.auctionTitle || '--'}
                    </h4>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${settlementBadge.className}`}
                      >
                        {settlementBadge.label}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${fulfillmentBadge.className}`}
                      >
                        {fulfillmentBadge.label}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <span className="font-semibold text-slate-800">
                          Giá thắng:
                        </span>{' '}
                        {formatCurrency(order.winningAmount)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">
                          Còn phải thanh toán:
                        </span>{' '}
                        {formatCurrency(order.remainingAmount)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">
                          Seller nhận:
                        </span>{' '}
                        {formatCurrency(order.sellerReceiveAmount)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">
                          Đã thanh toán lúc:
                        </span>{' '}
                        {formatDateTime(order.paidAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <h4 className="text-base font-bold text-slate-900">
                  Thông tin người mua
                </h4>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-slate-400" />
                    <span>{order.winnerName || '--'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-slate-400" />
                    <span>{order.winnerPhone || '--'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 text-slate-400" />
                    <span>{order.receiverAddress || '--'}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <h4 className="text-base font-bold text-slate-900">
                  Trạng thái xử lý
                </h4>

                <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <span className="font-semibold text-slate-800">
                      Xác nhận đơn:
                    </span>{' '}
                    {formatDateTime(order.confirmedAt)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">
                      Sẵn sàng giao:
                    </span>{' '}
                    {formatDateTime(order.readyToShipAt)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">
                      Đã gửi hàng:
                    </span>{' '}
                    {formatDateTime(order.shippedAt)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">
                      Đã giao:
                    </span>{' '}
                    {formatDateTime(order.deliveredAt)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">
                      Đơn vị vận chuyển:
                    </span>{' '}
                    {order.shippingProvider || '--'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">
                      Mã vận đơn:
                    </span>{' '}
                    {order.trackingCode || '--'}
                  </div>
                </div>

                {order.sellerNote ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">
                      Ghi chú:
                    </span>{' '}
                    {order.sellerNote}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Wallet size={18} />
                  Tóm tắt thanh toán
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Giá thắng</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(order.winningAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tiền cọc</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(order.depositAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Còn phải thanh toán</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(order.remainingAmount)}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                    <span>Seller nhận</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(order.sellerReceiveAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
