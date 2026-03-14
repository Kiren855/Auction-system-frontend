import React, { useMemo } from 'react';
import { Clock3, Gavel, Users, ShieldCheck } from 'lucide-react';
import PriceBox from './PriceBox';
import {
  getStatusMeta,
  formatDateTime,
  formatRelativeTimeFromSeconds,
} from '../../utils/auctionUtils';

function AuctionCard({
  auction,
  now,
  onViewDetail,
  onJoinAuction,
  showJoinButton = true,
  showDepositPrice = true,
}) {
  const statusMeta = getStatusMeta(auction.status);

  const remainingSeconds = useMemo(() => {
    if (String(auction.status).toUpperCase() !== 'ONGOING') {
      return Number(auction.remainingSeconds || 0);
    }

    if (auction.endAt) {
      const diff = Math.floor((new Date(auction.endAt).getTime() - now) / 1000);
      return Math.max(0, diff);
    }

    return Math.max(0, Number(auction.remainingSeconds || 0));
  }, [auction, now]);

  const timeText =
    String(auction.status).toUpperCase() === 'ONGOING'
      ? remainingSeconds > 0
        ? formatRelativeTimeFromSeconds(remainingSeconds)
        : 'Đã kết thúc'
      : String(auction.status).toUpperCase() === 'PENDING'
        ? `Bắt đầu lúc ${formatDateTime(auction.startAt)}`
        : '--';

  return (
    <div className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
      <div className="relative h-52 overflow-hidden">
        <img
          src={
            auction.thumbnailUrl ||
            'https://via.placeholder.com/1200x800?text=Auction+Image'
          }
          alt={auction.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusMeta.badge}`}
          >
            {statusMeta.label}
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg ${
              String(auction.status).toUpperCase() === 'ONGOING'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-950/85 text-white'
            }`}
          >
            <Clock3 size={13} />
            {timeText}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-slate-950/60 to-transparent" />
      </div>

      <div className="p-5">
        <div className="mb-3">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {auction.categoryName || 'Chưa có danh mục'}
          </span>
        </div>

        <h3 className="min-h-12 line-clamp-2 text-base font-bold leading-snug text-slate-900">
          {auction.title}
        </h3>

        <div
          className={`mt-4 grid gap-3 ${showDepositPrice ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2'}`}
        >
          <PriceBox label="Giá hiện tại" value={auction.currentPrice} />
          <PriceBox label="Bước giá" value={auction.stepPrice} />

          {showDepositPrice ? (
            <PriceBox
              label="Giá cọc"
              value={auction.depositPrice}
              highlight
              icon={<ShieldCheck size={14} />}
            />
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Gavel size={15} />
            {auction.bidCount || 0} lượt bid
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Users size={15} />
            {auction.participantCount || 0} tham gia
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          {showJoinButton ? (
            <button
              onClick={() => onJoinAuction?.(auction)}
              className="h-11 flex-1 rounded-2xl bg-slate-900 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              {auction.status === 'ONGOING'
                ? 'Tham gia đấu giá'
                : 'Tham gia phiên'}
            </button>
          ) : (
            <button
              onClick={() => onViewDetail?.(auction.id)}
              className="h-11 flex-1 rounded-2xl bg-slate-900 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              Xem chi tiết
            </button>
          )}

          <button
            onClick={() => onViewDetail?.(auction.id)}
            className="h-11 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuctionCard;
