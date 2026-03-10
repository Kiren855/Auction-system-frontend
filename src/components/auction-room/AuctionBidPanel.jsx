import React, { useMemo, useState } from 'react';
import InfoTooltip from './InfoTooltip';

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ';
}

export default function AuctionBidPanel({
  auction,
  remaining,
  bidAmount,
  setBidAmount,
  placingBid,
  autoBidAmount,
  setAutoBidAmount,
  autoBidEnabled,
  savingAutoBid,
  canBid,
  onOpenManualBidConfirm,
  onOpenAutoBidConfirm,
}) {
  const [showAutoBidInfo, setShowAutoBidInfo] = useState(false);

  const quickBidOptions = useMemo(() => {
    if (!auction) return [];
    return [
      auction.minNextPrice,
      auction.minNextPrice + auction.stepPrice,
      auction.minNextPrice + auction.stepPrice * 2,
    ];
  }, [auction]);

  const manualBidError = useMemo(() => {
    if (!auction || !bidAmount) return '';

    const amount = Number(bidAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      return 'Vui lòng nhập số tiền hợp lệ.';
    }

    if (amount < auction.minNextPrice) {
      return `Giá đặt phải từ ${formatCurrency(auction.minNextPrice)} trở lên.`;
    }

    return '';
  }, [auction, bidAmount]);

  const autoBidError = useMemo(() => {
    if (!auction || !autoBidAmount) return '';

    const amount = Number(autoBidAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      return 'Vui lòng nhập mức auto bid hợp lệ.';
    }

    if (amount < auction.minNextPrice) {
      return `Mức tối đa phải từ ${formatCurrency(auction.minNextPrice)} trở lên.`;
    }

    return '';
  }, [auction, autoBidAmount]);

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-4 lg:p-5 shrink-0">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">Thời gian còn lại</div>
          <div
            className={`mt-1 text-3xl font-mono font-bold tracking-wide ${
              remaining.startsWith('00:00:')
                ? 'text-red-600 animate-pulse'
                : 'text-slate-900'
            }`}
          >
            {remaining}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Giá hiện tại</div>
          <div className="mt-1 text-xl font-bold text-slate-900 leading-tight">
            {formatCurrency(auction.currentPrice)}
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <div className="text-xs text-amber-700">Giá tối thiểu</div>
          <div className="mt-1 text-xl font-bold text-amber-800 leading-tight">
            {formatCurrency(auction.minNextPrice)}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Đặt giá thủ công
          </h3>
          <span className="text-xs text-slate-500">
            Bước: {formatCurrency(auction.stepPrice)}
          </span>
        </div>

        <div className="mt-3">
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            disabled={!canBid}
            className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 bg-white text-base text-slate-800 outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="Nhập số tiền"
          />
        </div>

        {manualBidError && bidAmount && (
          <div className="mt-2 text-xs text-rose-600">{manualBidError}</div>
        )}

        {!manualBidError && bidAmount && canBid && (
          <div className="mt-2 text-xs text-emerald-600">
            Mức giá hợp lệ để tham gia đấu giá.
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {quickBidOptions.map((value) => (
            <button
              key={value}
              onClick={() => setBidAmount(String(value))}
              disabled={!canBid}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
            >
              {formatCurrency(value)}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenManualBidConfirm}
          disabled={placingBid || !bidAmount || !canBid || !!manualBidError}
          className="mt-4 w-full rounded-2xl bg-slate-900 text-white py-3 font-semibold hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {placingBid ? 'Đang xử lý...' : 'Đặt giá ngay'}
        </button>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              Đấu giá tự động
            </h3>
            <InfoTooltip
              open={showAutoBidInfo}
              onToggle={() => setShowAutoBidInfo((prev) => !prev)}
            />
          </div>

          {autoBidEnabled && (
            <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              Đang bật
            </span>
          )}
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Hệ thống sẽ tự tăng giá giúp bạn cho đến mức tối đa đã thiết lập.
        </p>

        <div className="mt-3">
          <input
            type="number"
            value={autoBidAmount}
            onChange={(e) => setAutoBidAmount(e.target.value)}
            disabled={!canBid}
            className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 bg-white text-base text-slate-800 outline-none focus:ring-2 focus:ring-emerald-300 disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="Nhập mức tối đa"
          />
        </div>

        {autoBidError && autoBidAmount && (
          <div className="mt-2 text-xs text-rose-600">{autoBidError}</div>
        )}

        {!autoBidError && autoBidAmount && canBid && (
          <div className="mt-2 text-xs text-emerald-600">
            Mức tối đa hợp lệ cho auto bid.
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              setAutoBidAmount(
                String(auction.minNextPrice + auction.stepPrice * 3),
              )
            }
            disabled={!canBid}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
          >
            Gợi ý: +3 bước
          </button>

          <button
            type="button"
            onClick={() =>
              setAutoBidAmount(
                String(auction.minNextPrice + auction.stepPrice * 5),
              )
            }
            disabled={!canBid}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
          >
            Gợi ý: +5 bước
          </button>
        </div>

        <button
          onClick={onOpenAutoBidConfirm}
          disabled={
            savingAutoBid || !autoBidAmount || !canBid || !!autoBidError
          }
          className="mt-4 w-full rounded-2xl bg-emerald-600 text-white py-3 font-semibold hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {savingAutoBid
            ? 'Đang xử lý...'
            : autoBidEnabled
              ? 'Cập nhật auto bid'
              : 'Bật auto bid'}
        </button>
      </div>
    </div>
  );
}
