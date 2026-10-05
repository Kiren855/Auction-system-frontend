// components/StatusBadge.jsx
const normalizeStatus = (s) => String(s || '').toUpperCase();

const getVietnameseStatus = (status) => {
  const map = {
    CREATED: 'Đã tạo',
    PENDING: 'Sắp diễn ra',
    ONGOING: 'Đang diễn ra',
    FINISHED: 'Đã kết thúc',
    CANCELLED: 'Đã huỷ',
  };
  return map[normalizeStatus(status)] || status;
};

const getStatusStyle = (status) => {
  switch (normalizeStatus(status)) {
    case 'CREATED':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'PENDING':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'ONGOING':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'FINISHED':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'APPROVED':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export default function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyle(
        status,
      )} ${className}`}
    >
      {getVietnameseStatus(status)}
    </span>
  );
}
