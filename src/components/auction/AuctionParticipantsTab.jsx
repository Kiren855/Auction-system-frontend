import { useEffect, useMemo, useState } from 'react';
import { Search, Users, ShieldBan, RefreshCcw } from 'lucide-react';
import { biddingApi } from '../../api/biddingApi';

const PARTICIPATION_STATUS_LABELS = {
  JOINED: 'Đã tham gia',
  BLOCKED: 'Bị cấm',
};

const DEPOSIT_STATUS_LABELS = {
  REQUIRED: 'Cần đặt cọc',
  PENDING: 'Đang chờ thanh toán',
  PAID: 'Đã thanh toán',
};

const PARTICIPATION_STATUS_STYLES = {
  JOINED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  BLOCKED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const DEPOSIT_STATUS_STYLES = {
  REQUIRED: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING: 'bg-sky-50 text-sky-700 border-sky-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function getInitial(name) {
  return String(name || '?')
    .trim()
    .charAt(0)
    .toUpperCase();
}

function formatDateTime(dateString) {
  if (!dateString) return '--';
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function StatusBadge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export default function AuctionParticipantsTab({ auctionId }) {
  const [participantsPage, setParticipantsPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [statusFilter, setStatusFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchParticipants = async (targetPage = 0, currentStatus = '') => {
    try {
      if (targetPage === 0) {
        setLoading(true);
      } else {
        setLoadingPage(true);
      }

      setError('');

      const response = await biddingApi.getParticipants(
        auctionId,
        targetPage,
        size,
        currentStatus || undefined,
      );
      console.log(response.data.result.totalElements);
      setParticipantsPage(response.data?.result || null);
      setPage(targetPage);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Không thể tải danh sách người tham gia.',
      );
    } finally {
      setLoading(false);
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    if (!auctionId) return;
    fetchParticipants(0, statusFilter);
  }, [auctionId, statusFilter]);

  const participants = participantsPage?.content || [];

  const filteredParticipants = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) return participants;

    return participants.filter((item) =>
      String(item.participant_name || '')
        .toLowerCase()
        .includes(keyword),
    );
  }, [participants, searchKeyword]);

  const totalElements = participantsPage?.totalElements || 0;
  const totalPages = participantsPage?.totalPages || 0;
  const isLast = participantsPage?.last ?? true;
  const pageNumber = participantsPage?.pageNumber ?? 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Người tham gia</h3>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý danh sách người dùng đã tham gia phiên đấu giá.
            </p>
          </div>

          <button
            onClick={() => fetchParticipants(page, statusFilter)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCcw size={16} />
            Tải lại
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng người tham gia</p>
                <p className="text-xl font-bold text-slate-800">
                  {totalElements}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Trạng thái lọc</p>
            <p className="mt-1 text-base font-semibold text-slate-800">
              {statusFilter
                ? PARTICIPATION_STATUS_LABELS[statusFilter]
                : 'Tất cả'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Kết quả hiển thị</p>
            <p className="mt-1 text-base font-semibold text-slate-800">
              {filteredParticipants.length} người dùng
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tìm kiếm theo username
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Nhập username..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Lọc trạng thái tham gia
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option value="">Tất cả</option>
              <option value="JOINED">Đã tham gia</option>
              <option value="BLOCKED">Bị cấm</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="text-sm text-slate-500">
              Đang tải danh sách người tham gia...
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-rose-100 p-3 text-rose-600">
              <ShieldBan size={20} />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-800">
              Không thể tải dữ liệu
            </p>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
            <button
              onClick={() => fetchParticipants(page, statusFilter)}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Thử lại
            </button>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-slate-100 p-3 text-slate-500">
              <Users size={20} />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-800">
              Không có người tham gia phù hợp
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Hãy thử đổi từ khoá tìm kiếm hoặc bộ lọc trạng thái.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-6 py-4 font-semibold">Người dùng</th>
                    <th className="px-6 py-4 font-semibold">Tham gia lúc</th>
                    <th className="px-6 py-4 font-semibold">
                      Trạng thái tham gia
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Trạng thái đặt cọc
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredParticipants.map((participant) => {
                    const participationStatus =
                      participant.participation_status;
                    const depositStatus = participant.deposit_status;

                    return (
                      <tr
                        key={participant.participant_id}
                        className="border-t border-slate-100 text-sm text-slate-700"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {participant.profile_image_url ? (
                              <img
                                src={participant.profile_image_url}
                                alt={participant.participant_name}
                                className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                                {getInitial(participant.participant_name)}
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-slate-800">
                                {participant.participant_name}
                              </p>
                              <p className="text-xs text-slate-400">
                                ID: {participant.participant_id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {formatDateTime(participant.joined_at)}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            className={
                              PARTICIPATION_STATUS_STYLES[
                                participationStatus
                              ] || 'bg-slate-50 text-slate-700 border-slate-200'
                            }
                          >
                            {PARTICIPATION_STATUS_LABELS[participationStatus] ||
                              participationStatus}
                          </StatusBadge>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            className={
                              DEPOSIT_STATUS_STYLES[depositStatus] ||
                              'bg-slate-50 text-slate-700 border-slate-200'
                            }
                          >
                            {DEPOSIT_STATUS_LABELS[depositStatus] ||
                              depositStatus}
                          </StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">
                Trang <span className="font-semibold">{pageNumber + 1}</span> /{' '}
                <span className="font-semibold">{Math.max(totalPages, 1)}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchParticipants(page - 1, statusFilter)}
                  disabled={page <= 0 || loadingPage}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Trước
                </button>

                <button
                  onClick={() => fetchParticipants(page + 1, statusFilter)}
                  disabled={isLast || loadingPage}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
