import { Wallet, Gavel, BadgeDollarSign, PercentCircle } from 'lucide-react';

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ';
}

const CARD_CONFIG = [
  {
    key: 'totalRevenue',
    label: 'Tổng doanh thu',
    icon: Wallet,
    valueClassName: 'text-emerald-600',
    iconClassName: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'totalPaidSettlements',
    label: 'Phiên đã thanh toán',
    icon: Gavel,
    valueClassName: 'text-slate-900',
    iconClassName: 'bg-sky-50 text-sky-600',
    isCount: true,
  },
  {
    key: 'averageRevenuePerAuction',
    label: 'Doanh thu trung bình / phiên',
    icon: BadgeDollarSign,
    valueClassName: 'text-violet-600',
    iconClassName: 'bg-violet-50 text-violet-600',
  },
  {
    key: 'totalPlatformFee',
    label: 'Tổng phí nền tảng',
    icon: PercentCircle,
    valueClassName: 'text-amber-600',
    iconClassName: 'bg-amber-50 text-amber-600',
  },
];

export default function RevenueSummaryCards({ summary, loading }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon;
        const rawValue = summary?.[card.key];

        return (
          <div
            key={card.key}
            className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-500">
                  {card.label}
                </div>

                <div
                  className={`mt-3 wrap-break-word text-2xl font-bold tracking-tight ${card.valueClassName}`}
                >
                  {loading
                    ? '...'
                    : card.isCount
                      ? Number(rawValue || 0)
                      : formatCurrency(rawValue)}
                </div>
              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconClassName}`}
              >
                <Icon size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
