export const TRANSACTION_TYPE_MAP = {
  REFUND: 'Hoàn tiền',
  TOPUP: 'Nạp tiền',
  WITHDRAW: 'Rút tiền',
  AUCTION_DEPOSIT_LOCK: 'Khóa tiền đặt cọc',
  AUCTION_DEPOSIT_RELEASE: 'Hoàn cọc đấu giá',
  PLATFORM_FEE: 'Phí nền tảng',
  AUCTION_SETTLEMENT: 'Thanh toán đấu giá',
};

export const TRANSACTION_DIRECTION_MAP = {
  IN: 'Tiền vào',
  OUT: 'Tiền ra',
};

export function getTransactionTypeLabel(type) {
  return TRANSACTION_TYPE_MAP[type] || type || '--';
}

export function getTransactionDirectionLabel(direction) {
  return TRANSACTION_DIRECTION_MAP[direction] || direction || '--';
}

export function getDirectionBadgeClass(direction) {
  if (direction === 'IN') {
    return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (direction === 'OUT') {
    return 'border border-rose-200 bg-rose-50 text-rose-700';
  }

  return 'border border-slate-200 bg-slate-100 text-slate-600';
}

export function getTypeBadgeClass(type) {
  switch (type) {
    case 'TOPUP':
      return 'border border-sky-200 bg-sky-50 text-sky-700';
    case 'REFUND':
    case 'AUCTION_DEPOSIT_RELEASE':
      return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'WITHDRAW':
    case 'AUCTION_DEPOSIT_LOCK':
    case 'AUCTION_SETTLEMENT':
    case 'PLATFORM_FEE':
      return 'border border-amber-200 bg-amber-50 text-amber-700';
    default:
      return 'border border-slate-200 bg-slate-100 text-slate-600';
  }
}
