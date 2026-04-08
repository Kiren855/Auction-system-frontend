import React, { useMemo, useState, useEffect, useRef } from 'react';
import InfoTooltip from './InfoTooltip';
import {
  CheckCircle2,
  Trophy,
  Ban,
  Radio,
  TrendingUp,
  Bot,
} from 'lucide-react';

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

function LivePriceCard({ label, value, accent = 'slate' }) {
  const previousValueRef = useRef(Number(value || 0));
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const current = Number(value || 0);
    const previous = previousValueRef.current;

    if (current > previous) {
      setFlash(true);
      const timer = window.setTimeout(() => setFlash(false), 1200);
      previousValueRef.current = current;
      return () => window.clearTimeout(timer);
    }

    previousValueRef.current = current;
  }, [value]);

  const toneClass =
    accent === 'amber'
      ? flash
        ? 'border-amber-300 bg-amber-100 ring-2 ring-amber-200'
        : 'border-amber-200 bg-amber-50'
      : flash
        ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200'
        : 'border-slate-200 bg-slate-50';

  const textClass = accent === 'amber' ? 'text-amber-800' : 'text-slate-900';
  const subTextClass = accent === 'amber' ? 'text-amber-700' : 'text-slate-500';

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-300 ${toneClass}`}
    >
      <div className={`text-xs ${subTextClass}`}>{label}</div>
      <div className={`mt-1 text-xl font-bold leading-tight ${textClass}`}>
        {formatCurrency(value)}
      </div>

      {flash ? (
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
          <TrendingUp size={12} />
          Vừa được cập nhật realtime
        </div>
      ) : null}
    </div>
  );
}

export default function AuctionBidPanel({
  auction,
  remaining,
  bidAmount,
  onBidAmountChange,
  placingBid,
  autoBidAmount,
  onAutoBidAmountChange,
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
    const min = Number(auction.minNextPrice || 0);
    const step = Number(auction.stepPrice || 0);

    return [min, min + step, min + step * 2];
  }, [auction]);

  const manualBidError = useMemo(() => {
    if (!auction || bidAmount === '' || bidAmount == null) return '';

    const amount = Number(bidAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      return 'Vui lòng nhập số tiền hợp lệ.';
    }

    if (amount < Number(auction.minNextPrice || 0)) {
      return `Giá đặt phải từ ${formatCurrency(auction.minNextPrice)} trở lên.`;
    }

    return '';
  }, [auction, bidAmount]);

  const autoBidError = useMemo(() => {
    if (!auction || autoBidAmount === '' || autoBidAmount == null) return '';

    const amount = Number(autoBidAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      return 'Vui lòng nhập mức auto bid hợp lệ.';
    }

    if (amount < Number(auction.minNextPrice || 0)) {
      return `Mức tối đa phải từ ${formatCurrency(auction.minNextPrice)} trở lên.`;
    }

    return '';
  }, [auction, autoBidAmount]);

  const autoBidEnabled = !!autoBidStatus?.enabled;
  const isLastMinute = String(remaining || '').startsWith('00:00:');

  if (!auction) return null;

  return (
    <div className="shrink-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">Thời gian còn lại</div>
          <div
            className={`mt-1 text-3xl font-mono font-bold tracking-wide ${
              isLastMinute ? 'animate-pulse text-red-600' : 'text-slate-900'
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
        <LivePriceCard label="Giá hiện tại" value={auction.currentPrice} />
        <LivePriceCard
          label="Giá tối thiểu"
          value={auction.minNextPrice}
          accent="amber"
        />
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Bước giá:{' '}
        <span className="font-semibold">
          {formatCurrency(auction.stepPrice)}
        </span>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Đặt giá thủ công
          </h3>
          <span className="text-xs text-slate-500">
            Tối thiểu: {formatCurrency(auction.minNextPrice)}
          </span>
        </div>

        <div className="mt-3">
          <input
            type="number"
            min={auction.minNextPrice}
            step="1"
            value={bidAmount}
            onChange={(e) => onBidAmountChange(e.target.value)}
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
              type="button"
              onClick={() => onBidAmountChange(String(value))}
              disabled={!canBid}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              {formatCurrency(value)}
            </button>
          ))}
        </div>

        <button
          type="button"
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

        <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-700">
          <div className="flex items-start gap-2">
            <Bot size={14} className="mt-0.5 shrink-0" />
            <div>
              Auto bid sẽ tự tăng giá thay bạn cho đến mức tối đa đã đặt. Trạng
              thái dẫn đầu sẽ cập nhật realtime theo người đang giữ giá cao
              nhất.
            </div>
          </div>
        </div>

        {autoBidStatus?.enabled ? (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
              <div className="text-[11px] text-slate-500">
                Mức tối đa hiện tại
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {autoBidStatus.maxBidAmount != null
                  ? formatCurrency(autoBidStatus.maxBidAmount)
                  : '--'}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
              <div className="text-[11px] text-slate-500">Trạng thái</div>
              <div className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                <Radio size={13} />
                {autoBidStatus.currentlyLeading
                  ? 'Bạn đang dẫn đầu'
                  : autoBidStatus.currentlyOutbid
                    ? 'Đã bị vượt giá'
                    : 'Đang theo dõi'}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Mức tối đa auto bid
          </label>
          <input
            type="number"
            min={auction.minNextPrice}
            step="1"
            value={autoBidAmount}
            onChange={(e) => onAutoBidAmountChange(e.target.value)}
            disabled={!canBid}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
            placeholder="Nhập mức tối đa"
          />
        </div>

        {autoBidError && autoBidAmount ? (
          <div className="mt-2 text-xs text-rose-600">{autoBidError}</div>
        ) : null}

        {!autoBidError && autoBidAmount && canBid ? (
          <div className="mt-2 text-xs text-sky-700">
            Hệ thống sẽ tự động đặt giá cho bạn đến tối đa{' '}
            <span className="font-semibold">
              {formatCurrency(autoBidAmount)}
            </span>
            .
          </div>
        ) : null}

        {autoBidStatus?.currentlyOutbid ? (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Auto bid hiện không còn dẫn đầu. Bạn có thể tăng mức tối đa để tiếp
            tục cạnh tranh.
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onOpenAutoBidConfirm}
            disabled={
              savingAutoBid || !autoBidAmount || !canBid || !!autoBidError
            }
            className="flex-1 rounded-2xl bg-sky-600 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingAutoBid
              ? 'Đang xử lý...'
              : autoBidEnabled
                ? 'Cập nhật auto bid'
                : 'Bật auto bid'}
          </button>

          {autoBidEnabled ? (
            <button
              type="button"
              onClick={onDisableAutoBidConfirm}
              disabled={disablingAutoBid}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {disablingAutoBid ? 'Đang xử lý...' : 'Tắt'}
            </button>
          ) : null}
        </div>
      </div>

      {!canBid ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Phiên đấu giá hiện chưa ở trạng thái cho phép đặt giá.
        </div>
      ) : null}
    </div>
  );
}
