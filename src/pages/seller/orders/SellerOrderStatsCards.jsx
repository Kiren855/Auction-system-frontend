import {
  Package,
  Wallet,
  ClipboardCheck,
  PackageCheck,
  Truck,
  CircleCheckBig,
} from 'lucide-react';

const CARD_CONFIG = [
  {
    key: 'totalOrders',
    label: 'Tổng đơn',
    icon: Package,
    className: 'bg-slate-900 text-white',
  },
  {
    key: 'waitingForPayment',
    label: 'Chờ thanh toán',
    icon: Wallet,
    className: 'border border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    key: 'waitingForSellerConfirm',
    label: 'Chờ xác nhận',
    icon: ClipboardCheck,
    className: 'border border-sky-200 bg-sky-50 text-sky-700',
  },
  {
    key: 'preparing',
    label: 'Đang chuẩn bị',
    icon: PackageCheck,
    className: 'border border-violet-200 bg-violet-50 text-violet-700',
  },
  {
    key: 'shipping',
    label: 'Đang giao',
    icon: Truck,
    className: 'border border-cyan-200 bg-cyan-50 text-cyan-700',
  },
  {
    key: 'completed',
    label: 'Hoàn tất',
    icon: CircleCheckBig,
    className: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  },
];

export default function SellerOrderStatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CARD_CONFIG.map((item) => {
        const Icon = item.icon;
        const value = stats?.[item.key] ?? 0;

        return (
          <div
            key={item.key}
            className={`rounded-3xl p-5 shadow-sm ${item.className}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold opacity-90">
                  {item.label}
                </div>
                <div className="mt-3 text-3xl font-extrabold tracking-tight">
                  {value}
                </div>
              </div>

              <div className="rounded-2xl bg-white/20 p-3">
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
