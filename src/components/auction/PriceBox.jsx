import React from 'react';

const formatMoneyValue = (value) =>
  new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function PriceBox({ label, value, highlight = false, icon = null }) {
  return (
    <div
      className={`min-w-0 rounded-2xl p-3 ${
        highlight ? 'bg-amber-50 ring-1 ring-amber-100' : 'bg-slate-50'
      }`}
    >
      {icon ? (
        <div
          className={`flex items-center gap-1.5 text-xs ${
            highlight ? 'text-amber-700' : 'text-slate-500'
          }`}
        >
          {icon}
          <span className="truncate">{label}</span>
        </div>
      ) : (
        <p className="truncate text-xs text-slate-500">{label}</p>
      )}

      <p
        className={`mt-1 truncate text-xs font-bold tabular-nums ${
          highlight ? 'text-amber-900' : 'text-slate-900'
        }`}
        title={`${formatMoneyValue(value)} đ`}
      >
        {formatMoneyValue(value)}{' '}
        <span
          className={`text-[11px] font-semibold ${
            highlight ? 'text-amber-800' : 'text-slate-700'
          }`}
        >
          đ
        </span>
      </p>
    </div>
  );
}

export default PriceBox;
