export function formatRelativeTimeFromSeconds(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds || 0)));

  if (total <= 0) return 'Sắp kết thúc';

  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (days > 0) return `Còn ${days} ngày ${hours} giờ`;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  return `Còn ${hh}:${mm}:${ss}`;
}

export function formatDateTime(value) {
  if (!value) return '--';

  const date = new Date(value);

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function getStatusMeta(status) {
  switch (String(status || '').toUpperCase()) {
    case 'ONGOING':
      return {
        label: 'Đang diễn ra',
        badge: 'bg-rose-50 text-rose-600 border border-rose-100',
      };
    case 'PENDING':
      return {
        label: 'Sắp bắt đầu',
        badge: 'bg-amber-50 text-amber-700 border border-amber-100',
      };
    case 'COMPLETED':
      return {
        label: 'Đã hoàn thành',
        badge: 'bg-slate-100 text-slate-600 border border-slate-200',
      };
    case 'CANCELLED':
      return {
        label: 'Đã huỷ',
        badge: 'bg-red-50 text-red-600 border border-red-100',
      };
    default:
      return {
        label: status || 'Không xác định',
        badge: 'bg-slate-100 text-slate-600 border border-slate-200',
      };
  }
}
