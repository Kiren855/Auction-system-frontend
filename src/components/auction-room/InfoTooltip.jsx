import React from 'react';

export default function InfoTooltip({ open, onToggle }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-5 h-5 rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 transition flex items-center justify-center text-xs font-semibold"
      >
        i
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-20 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl p-3">
          <div className="text-sm font-semibold text-slate-800 mb-1">
            Đấu giá tự động
          </div>
          <div className="space-y-1 text-xs text-slate-600 leading-5">
            <p>Hệ thống sẽ tự tăng giá giúp bạn theo bước giá.</p>
            <p>Không vượt quá mức tối đa bạn đã thiết lập.</p>
            <p>
              Nếu người khác vượt giá hiện tại, hệ thống sẽ tự phản hồi cho bạn.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
