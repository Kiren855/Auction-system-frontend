export function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ';
}

export function formatDateTime(value) {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getSettlementBadge(status) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Chờ thanh toán',
        className: 'border border-amber-200 bg-amber-50 text-amber-700',
      };
    case 'PAID':
      return {
        label: 'Đã thanh toán',
        className: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
      };
    case 'PAYMENT_EXPIRED':
      return {
        label: 'Hết hạn thanh toán',
        className: 'border border-rose-200 bg-rose-50 text-rose-700',
      };
    case 'CANCELLED':
      return {
        label: 'Đã huỷ',
        className: 'border border-slate-200 bg-slate-100 text-slate-600',
      };
    default:
      return {
        label: status || '--',
        className: 'border border-slate-200 bg-slate-100 text-slate-600',
      };
  }
}

export function getFulfillmentBadge(status) {
  switch (status) {
    case 'WAITING_FOR_SELLER_CONFIRM':
      return {
        label: 'Chờ xác nhận',
        className: 'border border-sky-200 bg-sky-50 text-sky-700',
      };
    case 'PREPARING':
      return {
        label: 'Đang chuẩn bị',
        className: 'border border-violet-200 bg-violet-50 text-violet-700',
      };
    case 'READY_TO_SHIP':
      return {
        label: 'Sẵn sàng giao',
        className: 'border border-indigo-200 bg-indigo-50 text-indigo-700',
      };
    case 'SHIPPING':
      return {
        label: 'Đang giao',
        className: 'border border-cyan-200 bg-cyan-50 text-cyan-700',
      };
    case 'DELIVERED':
      return {
        label: 'Đã giao',
        className: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
      };
    case 'COMPLETED':
      return {
        label: 'Hoàn tất',
        className: 'border border-slate-200 bg-slate-900 text-white',
      };
    default:
      return {
        label: status || '--',
        className: 'border border-slate-200 bg-slate-100 text-slate-600',
      };
  }
}

export function canConfirmOrder(order) {
  return (
    order?.settlementStatus === 'PAID' &&
    order?.fulfillmentStatus === 'WAITING_FOR_SELLER_CONFIRM'
  );
}

export function canUpdateShipping(order) {
  return (
    order?.settlementStatus === 'PAID' &&
    ['PREPARING', 'READY_TO_SHIP', 'SHIPPING'].includes(
      order?.fulfillmentStatus,
    )
  );
}

export function canMarkShipped(order) {
  return (
    order?.settlementStatus === 'PAID' &&
    order?.fulfillmentStatus === 'READY_TO_SHIP'
  );
}

export function canMarkDelivered(order) {
  return (
    order?.settlementStatus === 'PAID' &&
    order?.fulfillmentStatus === 'SHIPPING'
  );
}
