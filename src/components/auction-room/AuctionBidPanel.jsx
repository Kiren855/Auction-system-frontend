import React, { useMemo, useState } from 'react';
import InfoTooltip from './InfoTooltip';
import { AlertCircle, CheckCircle2, Trophy, BellRing, Ban } from 'lucide-react';

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ';
}

function LeadingStatusBadge({ autoBidStatus }) {
  if (!autoBidStatus) return null;

  if (autoBidStatus.currentlyLeading) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <Trophy size={12} />
        Đang dẫn đầu
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
      <Ban size={12} />
      Chưa dẫn đầu
    </span>
  );
}

function AutoBidEnabledBadge({ autoBidStatus }) {
  if (!autoBidStatus?.enabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
        <Ban size={12} />
        Đã tắt
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
      <CheckCircle2 size={12} />
      Đang bật
    </span>
  );
}

export default function AuctionBidPanel({
  auction,
  remaining,
  bidAmount,
  setBidAmount,
  placingBid,
  autoBidAmount,
  setAutoBidAmount,
  autoBidStatus,
  savingAutoBid,
  disablingAutoBid,
  canBid,
  onOpenManualBidConfirm,
  onOpenAutoBidConfirm,
  onDisableAutoBidConfirm,
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

  const autoBidEnabled = !!autoBidStatus?.enabled;

  return (
    <div className="shrink-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">Thời gian còn lại</div>
          <div
            className={`mt-1 text-3xl font-mono font-bold tracking-wide ${
              remaining.startsWith('00:00:')
                ? 'animate-pulse text-red-600'
                : 'text-slate-900'
            }`}
          >
            {remaining}
          </div>
        </div>

        {autoBidStatus ? (
          <LeadingStatusBadge autoBidStatus={autoBidStatus} />
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Giá hiện tại</div>
          <div className="mt-1 text-xl font-bold leading-tight text-slate-900">
            {formatCurrency(auction.currentPrice)}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs text-amber-700">Giá tối thiểu</div>
          <div className="mt-1 text-xl font-bold leading-tight text-amber-800">
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
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="Nhập số tiền"
          />
        </div>

        {manualBidError && bidAmount ? (
          <div className="mt-2 text-xs text-rose-600">{manualBidError}</div>
        ) : null}

        {!manualBidError && bidAmount && canBid ? (
          <div className="mt-2 text-xs text-emerald-600">
            Mức giá hợp lệ để tham gia đấu giá.
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {quickBidOptions.map((value) => (
            <button
              key={value}
              onClick={() => setBidAmount(String(value))}
              disabled={!canBid}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              {formatCurrency(value)}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenManualBidConfirm}
          disabled={placingBid || !bidAmount || !canBid || !!manualBidError}
          className="mt-4 w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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

          <AutoBidEnabledBadge autoBidStatus={autoBidStatus} />
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Hệ thống sẽ tự tăng giá giúp bạn cho đến mức tối đa đã thiết lập.
          {autoBidStatus?.enabled && autoBidStatus?.maxBidAmount != null
            ? ` Mức tối đa hiện tại: ${formatCurrency(autoBidStatus.maxBidAmount)}.`
            : ''}
        </p>

        {autoBidStatus?.enabled && autoBidStatus?.currentlyOutbid ? (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Auto bid của bạn vẫn đang bật, nhưng hiện đang bị người khác vượt.
            Bạn có thể tăng mức tối đa để tiếp tục cạnh tranh.
          </div>
        ) : null}

        <div className="mt-3">
          <input
            type="number"
            value={autoBidAmount}
            onChange={(e) => setAutoBidAmount(e.target.value)}
            disabled={!canBid}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-emerald-300 disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="Nhập mức tối đa"
          />
        </div>

        {autoBidError && autoBidAmount ? (
          <div className="mt-2 text-xs text-rose-600">{autoBidError}</div>
        ) : null}

        {!autoBidError && autoBidAmount && canBid ? (
          <div className="mt-2 text-xs text-emerald-600">
            Mức tối đa hợp lệ cho auto bid.
          </div>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              setAutoBidAmount(
                String(auction.minNextPrice + auction.stepPrice * 3),
              )
            }
            disabled={!canBid}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
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
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Gợi ý: +5 bước
          </button>
        </div>

        <button
          onClick={onOpenAutoBidConfirm}
          disabled={
            savingAutoBid || !autoBidAmount || !canBid || !!autoBidError
          }
          className="mt-4 w-full rounded-2xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingAutoBid
            ? 'Đang xử lý...'
            : autoBidEnabled
              ? 'Cập nhật auto bid'
              : 'Bật auto bid'}
        </button>

        {autoBidEnabled ? (
          <button
            onClick={onDisableAutoBidConfirm}
            disabled={disablingAutoBid}
            className="mt-3 w-full rounded-2xl border border-rose-200 bg-white py-3 font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disablingAutoBid ? 'Đang tắt...' : 'Tắt auto bid'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
