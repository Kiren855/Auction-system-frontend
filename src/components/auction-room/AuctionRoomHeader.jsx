import React from 'react';

function getStatusStyle(status) {
  switch (String(status || '').toUpperCase()) {
    case 'PENDING':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'ONGOING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'FINISHED':
    case 'COMPLETED':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-sky-50 text-sky-700 border-sky-200';
  }
}

function getVietnameseStatus(status) {
  const map = {
    CREATED: 'Đã tạo',
    PENDING: 'Sắp diễn ra',
    ONGOING: 'Đang diễn ra',
    FINISHED: 'Đã kết thúc',
    COMPLETED: 'Đã kết thúc',
    CANCELLED: 'Đã huỷ',
  };
  return map[String(status || '').toUpperCase()] || status;
}

function formatUtcToLocalDateTime(utcString) {
  if (!utcString) return '--';
  const date = new Date(utcString);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default function AuctionRoomHeader({
  title,
  status,
  sellerName,
  participantCount,
  startAt,
}) {
  return (
    <div className="mb-4 lg:mb-6">
      <div className="text-sm text-slate-500 mb-2">
        Đấu giá trực tiếp / Phòng đấu giá
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 wrap-break-word">
            {title}
          </h1>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span
              className={`px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusStyle(
                status,
              )}`}
            >
              {getVietnameseStatus(status)}
            </span>

            <span className="text-sm text-slate-500">
              Người bán:{' '}
              <span className="font-semibold text-slate-700">{sellerName}</span>
            </span>

            <span className="text-sm text-slate-500">
              {participantCount} người tham gia
            </span>

            <span className="text-sm text-slate-500">
              Bắt đầu: {formatUtcToLocalDateTime(startAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
