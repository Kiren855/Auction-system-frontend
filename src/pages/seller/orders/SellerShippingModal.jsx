import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  shippingProvider: '',
  trackingCode: '',
  sellerNote: '',
};

export default function SellerShippingModal({
  open,
  order,
  submitting,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;

    setForm({
      shippingProvider: order?.shippingProvider || '',
      trackingCode: order?.trackingCode || '',
      sellerNote: order?.sellerNote || '',
    });
  }, [open, order]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.shippingProvider.trim()) {
      toast.error('Vui lòng nhập đơn vị vận chuyển');
      return;
    }
    if (!form.trackingCode.trim()) {
      toast.error('Vui lòng nhập mã vận đơn');
      return;
    }

    onSubmit?.({
      shippingProvider: form.shippingProvider.trim(),
      trackingCode: form.trackingCode.trim(),
      sellerNote: form.sellerNote.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-1100 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-xl rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Cập nhật vận chuyển
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Nhập thông tin giao hàng cho đơn đấu giá
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

        <div className="space-y-4 px-6 py-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Đơn vị vận chuyển
            </span>
            <input
              type="text"
              value={form.shippingProvider}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  shippingProvider: e.target.value,
                }))
              }
              placeholder="Ví dụ: GHTK, GHN, Viettel Post..."
              className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Mã vận đơn
            </span>
            <input
              type="text"
              value={form.trackingCode}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  trackingCode: e.target.value,
                }))
              }
              placeholder="Nhập mã vận đơn"
              className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Ghi chú
            </span>
            <textarea
              rows={3}
              value={form.sellerNote}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  sellerNote: e.target.value,
                }))
              }
              placeholder="Ghi chú thêm nếu cần"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-11 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </div>
    </div>
  );
}
