import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Clock3,
  Gavel,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import { auctionApi } from '../../api/auctionApi';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'PENDING', label: 'Sắp bắt đầu' },
  { key: 'ONGOING', label: 'Đang diễn ra' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Mặc định' },
  { value: 'endAt-asc', label: 'Kết thúc sớm nhất' },
  { value: 'startAt-asc', label: 'Bắt đầu sớm nhất' },
  { value: 'currentPrice-asc', label: 'Giá thấp đến cao' },
  { value: 'currentPrice-desc', label: 'Giá cao đến thấp' },
  { value: 'createdAt-desc', label: 'Mới nhất' },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ';
}

function formatDateTime(value) {
  if (!value) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function formatRelativeTimeFromSeconds(seconds) {
  const total = Number(seconds || 0);
  if (total <= 0) return 'Sắp kết thúc';

  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (days > 0) return `Còn ${days} ngày ${hours} giờ`;

  return `Còn ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getStatusMeta(status) {
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
    default:
      return {
        label: status || 'Không xác định',
        badge: 'bg-slate-100 text-slate-600 border border-slate-200',
      };
  }
}

function getAuctionTimeText(auction) {
  if (!auction) return '--';

  if (auction.status === 'ONGOING') {
    return formatRelativeTimeFromSeconds(auction.remainingSeconds);
  }

  if (auction.status === 'PENDING') {
    return `Bắt đầu lúc ${formatDateTime(auction.startAt)}`;
  }

  return '--';
}

function parseSortValue(sortValue) {
  if (!sortValue || sortValue === 'default') {
    return { sortBy: undefined, sortDir: 'asc' };
  }

  const [sortBy, sortDir] = sortValue.split('-');
  return { sortBy, sortDir: sortDir || 'asc' };
}

function AuctionCard({ auction, onViewDetail }) {
  const statusMeta = getStatusMeta(auction.status);

  return (
    <div className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:shadow-slate-200/70 transition-all duration-300">
      <div className="relative h-52 overflow-hidden">
        <img
          src={
            auction.thumbnailUrl ||
            'https://via.placeholder.com/1200x800?text=Auction+Image'
          }
          alt={auction.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute left-4 top-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusMeta.badge}`}
          >
            {statusMeta.label}
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/85 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            <Clock3 size={13} />
            {getAuctionTimeText(auction)}
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

        <h3 className="min-h-12 text-base font-bold leading-snug text-slate-900 line-clamp-2">
          {auction.title}
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Giá hiện tại</p>
            <p className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
              {formatCurrency(auction.currentPrice)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Bước giá</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">
              {formatCurrency(auction.stepPrice)}
            </p>
          </div>
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
          <button
            onClick={() => onViewDetail(auction.id)}
            className="flex-1 h-11 rounded-2xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
          >
            {auction.status === 'ONGOING' ? 'Tham gia đấu giá' : 'Xem chi tiết'}
          </button>

          <button
            onClick={() => onViewDetail(auction.id)}
            className="h-11 px-4 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ pageNumber, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const current = pageNumber + 1;
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, current + 2);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-slate-500">
        Trang <span className="font-semibold text-slate-900">{current}</span> /{' '}
        {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 0}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          Trước
        </button>

        {pages.map((page) => {
          const active = page === current;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page - 1)}
              className={`h-11 min-w-11 rounded-2xl px-4 text-sm font-bold transition-colors ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages - 1}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sau
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function BidderSearchResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const keyword = (searchParams.get('keyword') || '').trim();

  const [categories, setCategories] = useState([]);
  const [auctionsPage, setAuctionsPage] = useState({
    content: [],
    pageNumber: 0,
    pageSize: 12,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  const [category, setCategory] = useState('all');
  const [tab, setTab] = useState('all');
  const [sortValue, setSortValue] = useState('default');
  const [page, setPage] = useState(0);

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [auctionsLoading, setAuctionsLoading] = useState(true);
  const [error, setError] = useState('');

  const categoryOptions = useMemo(
    () => [{ id: 'all', name: 'Tất cả' }, ...categories],
    [categories],
  );

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await auctionApi.getAllCategories();
      const result = response?.result || response?.data?.result || [];
      setCategories(Array.isArray(result) ? result : []);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchAuctions = useCallback(async () => {
    if (!keyword) {
      setAuctionsPage({
        content: [],
        pageNumber: 0,
        pageSize: 12,
        totalElements: 0,
        totalPages: 0,
        last: true,
      });
      return;
    }

    try {
      setAuctionsLoading(true);
      setError('');

      const { sortBy, sortDir } = parseSortValue(sortValue);

      const params = {
        keyword,
        page,
        size: 12,
      };

      if (tab !== 'all') params.status = tab;
      if (category !== 'all') params.categoryId = category;
      if (sortBy) params.sortBy = sortBy;
      if (sortDir) params.sortDir = sortDir;

      const response = await auctionApi.getAuctions(params);
      const result = response?.result || response?.data?.result || {};

      setAuctionsPage({
        content: Array.isArray(result?.content) ? result.content : [],
        pageNumber: result?.pageNumber || 0,
        pageSize: result?.pageSize || 12,
        totalElements: result?.totalElements || 0,
        totalPages: result?.totalPages || 0,
        last: !!result?.last,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Không thể tải kết quả tìm kiếm.',
      );
      setAuctionsPage({
        content: [],
        pageNumber: 0,
        pageSize: 12,
        totalElements: 0,
        totalPages: 0,
        last: true,
      });
    } finally {
      setAuctionsLoading(false);
    }
  }, [keyword, page, tab, category, sortValue]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setPage(0);
  }, [keyword, tab, category, sortValue]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const handleViewDetail = (auctionId) => {
    navigate(`/auctions/${auctionId}`);
  };

  const handleChangePage = (nextPage) => {
    if (nextPage < 0 || nextPage >= auctionsPage.totalPages) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-4xl bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-8 md:px-10 md:py-10 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Search size={22} />
          </div>
          <div>
            <p className="text-sm text-amber-300">Kết quả tìm kiếm</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              {keyword ? `“${keyword}”` : 'Chưa có từ khóa'}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              {keyword
                ? 'Duyệt các phiên đấu giá phù hợp với từ khóa bạn vừa tìm kiếm.'
                : 'Nhập từ khóa ở thanh tìm kiếm để bắt đầu.'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Danh mục
            </p>
            <div className="flex flex-wrap gap-3">
              {categoryOptions.map((item) => {
                const active = String(category) === String(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => setCategory(item.id)}
                    className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Trạng thái
              </p>
              <div className="flex flex-wrap gap-2">
                {TABS.map((item) => {
                  const active = tab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setTab(item.key)}
                      className={`h-11 rounded-2xl px-4 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="shrink-0 text-sm font-semibold text-slate-700">
                Sắp xếp
              </label>
              <select
                value={sortValue}
                onChange={(e) => setSortValue(e.target.value)}
                className="h-11 min-w-55 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-4xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Kết quả
            </h2>
            <p className="mt-1 text-slate-500">
              {auctionsLoading
                ? 'Đang tải dữ liệu...'
                : `Hiển thị ${auctionsPage.content.length} phiên trên tổng ${auctionsPage.totalElements} phiên`}
            </p>
          </div>

          <button
            onClick={fetchAuctions}
            className="inline-flex h-11 items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>

        {!keyword ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <h3 className="text-lg font-bold text-slate-900">
              Chưa có từ khóa tìm kiếm
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Hãy nhập từ khóa ở thanh tìm kiếm phía trên để xem kết quả.
            </p>
          </div>
        ) : auctionsLoading ? (
          <div className="py-14 text-center text-slate-500">
            Đang tải kết quả...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50 px-6 py-14 text-center">
            <h3 className="text-lg font-bold text-rose-700">
              Không thể tải kết quả tìm kiếm
            </h3>
            <p className="mt-2 text-sm text-rose-600">{error}</p>
          </div>
        ) : auctionsPage.content.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <h3 className="text-lg font-bold text-slate-900">
              Không tìm thấy kết quả phù hợp
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Hãy thử từ khóa khác hoặc đổi bộ lọc để mở rộng kết quả.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {auctionsPage.content.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>

            <Pagination
              pageNumber={auctionsPage.pageNumber}
              totalPages={auctionsPage.totalPages}
              onPageChange={handleChangePage}
            />
          </>
        )}
      </section>
    </div>
  );
}
