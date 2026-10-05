import { CalendarDays, ReceiptText } from 'lucide-react';
import Pagination from '../common/Pagination';

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ';
}

function formatDateTime(value) {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getStatusBadge(status) {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
}

export default function RevenueDetailsTable({
  loading,
  data = [],
  page = 0,
  totalPages = 0,
  totalElements = 0,
  onPageChange,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <div className="text-lg font-bold text-slate-900">
            Danh sách các đơn đã thanh toán
          </div>
        </div>

        <div className="hidden md:flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
          <ReceiptText size={20} />
        </div>
      </div>

      {loading ? (
        <div className="px-6 py-16 text-center text-slate-500">
          Đang tải dữ liệu doanh thu...
        </div>
      ) : data.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto max-w-md rounded-md border border-slate-200 bg-slate-50 px-6 py-8">
            <div className="text-lg font-semibold text-slate-900">
              Chưa có doanh thu
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Hiện chưa có đơn nào ở trạng thái đã thanh toán.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-245 w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                    tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                    Giá thắng
                  </th>

                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                    Phí nền tảng
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                    Số tiền nhận
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr
                    key={item.settlementId}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        {formatDateTime(item.createdAt)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div
                        className="max-w-55 truncate text-sm font-medium text-slate-800"
                        title={item.auctionId}
                      >
                        {item.title}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {formatCurrency(item.winningAmount)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700 font-semibold">
                      {formatCurrency(item.platformFee)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-700">
                      {formatCurrency(item.sellerReceiveAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 pb-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={onPageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
