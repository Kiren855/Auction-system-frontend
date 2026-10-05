import {
  Wallet,
  CreditCard,
  AlertTriangle,
  Loader2,
  X,
  Info,
} from 'lucide-react';

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
}) {
  if (!isOpen) return null;

  const iconMap = {
    wallet: {
      wrap: 'bg-emerald-50 text-emerald-600',
      icon: <Wallet size={22} />,
    },
    payment: {
      wrap: 'bg-amber-50 text-amber-600',
      icon: <CreditCard size={22} />,
    },
    warning: {
      wrap: 'bg-rose-50 text-rose-600',
      icon: <AlertTriangle size={22} />,
    },
    default: {
      wrap: 'bg-slate-100 text-slate-600',
      icon: <Info size={22} />,
    },
  };

  const selected = iconMap[variant] || iconMap.default;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-950/55 px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${selected.wrap}`}
            >
              {selected.icon}
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
