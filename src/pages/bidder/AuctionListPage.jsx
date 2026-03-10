import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock3,
  Gavel,
  Users,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
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
  const total = Math.max(0, Number(seconds || 0));

  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (days > 0) {
    return `Còn ${days} ngày ${hours} giờ`;
  }

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  return `Còn ${hh}:${mm}:${ss}`;
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

function parseSortValue(sortValue) {
  if (!sortValue || sortValue === 'default') {
    return { sortBy: undefined, sortDir: 'asc' };
  }

  const [sortBy, sortDir] = sortValue.split('-');
  return {
    sortBy,
    sortDir: sortDir || 'asc',
  };
}

function CategorySkeleton() {
  return <div className="h-11 w-28 rounded-2xl bg-slate-100 animate-pulse" />;
}

function AuctionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="h-52 bg-slate-100 animate-pulse" />
      <div className="p-5">
        <div className="h-6 w-24 rounded-full bg-slate-100 animate-pulse" />
        <div className="mt-4 h-5 w-3/4 rounded bg-slate-100 animate-pulse" />
        <div className="mt-2 h-5 w-1/2 rounded bg-slate-100 animate-pulse" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
        <div className="mt-4 h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
        <div className="mt-5 h-11 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

function AuctionCard({ auction, onViewDetail, now }) {
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
    <div className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 transition-all duration-300">
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
        <div className="mb-3 flex items-center justify-between gap-3">
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

function Pagination({
  pageNumber,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const current = pageNumber + 1;
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, current + 2);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  const from = totalElements === 0 ? 0 : pageNumber * pageSize + 1;
  const to = Math.min((pageNumber + 1) * pageSize, totalElements);

  return (
    <div className="mt-10 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-slate-600">
          Hiển thị <span className="font-bold text-slate-900">{from}</span> -{' '}
          <span className="font-bold text-slate-900">{to}</span> trong tổng{' '}
          <span className="font-bold text-slate-900">{totalElements}</span>{' '}
          phiên
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 0}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Trước
          </button>

          {start > 1 && (
            <>
              <button
                onClick={() => onPageChange(0)}
                className="h-11 min-w-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                1
              </button>
              {start > 2 && <span className="px-1 text-slate-400">...</span>}
            </>
          )}

          {pages.map((page) => {
            const active = page === current;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page - 1)}
                className={`h-11 min-w-11 rounded-2xl px-4 text-sm font-bold transition-colors ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            );
          })}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && (
                <span className="px-1 text-slate-400">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages - 1)}
                className="h-11 min-w-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages - 1}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuctionListPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [auctionsPage, setAuctionsPage] = useState({
    content: [],
    pageNumber: 0,
    pageSize: 12,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  const [draftCategory, setDraftCategory] = useState('all');
  const [draftTab, setDraftTab] = useState('all');
  const [draftSortValue, setDraftSortValue] = useState('default');

  const [appliedFilters, setAppliedFilters] = useState({
    category: 'all',
    tab: 'all',
    sortValue: 'default',
  });

  const [page, setPage] = useState(0);

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [auctionsLoading, setAuctionsLoading] = useState(true);

  const [categoriesError, setCategoriesError] = useState('');
  const [auctionsError, setAuctionsError] = useState('');

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError('');

      const response = await auctionApi.getAllCategories();
      const result = response?.result || response?.data?.result || [];

      setCategories(Array.isArray(result) ? result : []);
    } catch (error) {
      setCategories([]);
      setCategoriesError('Không thể tải danh mục.');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchAuctions = useCallback(async () => {
    try {
      setAuctionsLoading(true);
      setAuctionsError('');

      const { sortBy, sortDir } = parseSortValue(appliedFilters.sortValue);

      const params = {
        page,
        size: 12,
        sortBy,
        sortDir,
      };

      if (appliedFilters.tab !== 'all') {
        params.status = appliedFilters.tab;
      }

      if (appliedFilters.category !== 'all') {
        params.categoryId = appliedFilters.category;
      }

      const response = await auctionApi.getAuctions(params);
      const result = response?.result || response?.data?.result || {};

      setAuctionsPage({
        content: Array.isArray(result?.content) ? result.content : [],
        pageNumber: result?.pageNumber ?? 0,
        pageSize: result?.pageSize ?? 12,
        totalElements: result?.totalElements ?? 0,
        totalPages: result?.totalPages ?? 0,
        last: !!result?.last,
      });
    } catch (error) {
      setAuctionsError('Không thể tải danh sách phiên đấu giá.');
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
  }, [appliedFilters, page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const categoryOptions = useMemo(() => {
    return [{ id: 'all', name: 'Tất cả' }, ...categories];
  }, [categories]);

  const handleApplyFilters = () => {
    setPage(0);
    setAppliedFilters({
      category: draftCategory,
      tab: draftTab,
      sortValue: draftSortValue,
    });
  };

  const handleResetFilters = () => {
    setDraftCategory('all');
    setDraftTab('all');
    setDraftSortValue('default');
    setPage(0);
    setAppliedFilters({
      category: 'all',
      tab: 'all',
      sortValue: 'default',
    });
  };

  const handleViewDetail = (auctionId) => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    navigate(`/home/auctions/${auctionId}`);
  };

  const handleChangePage = (nextPage) => {
    if (nextPage < 0 || nextPage >= auctionsPage.totalPages) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    fetchAuctions();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 space-y-8">
        <section className="relative overflow-hidden rounded-4xl bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-8 md:px-10 md:py-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-16 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-amber-300">
                Danh sách phiên đấu giá
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl leading-tight">
                Khám phá toàn bộ
                <br />
                phiên đấu giá đang mở
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Lọc theo danh mục, trạng thái và sắp xếp để nhanh chóng tìm ra
                phiên đấu giá phù hợp với bạn.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <p className="text-sm text-slate-300">
                    Tổng số phiên hiển thị
                  </p>
                  <p className="text-2xl font-black text-white">
                    {auctionsLoading ? '--' : auctionsPage.totalElements}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Danh mục
              </p>
              <div className="flex flex-wrap gap-3">
                {categoriesLoading ? (
                  <>
                    <CategorySkeleton />
                    <CategorySkeleton />
                    <CategorySkeleton />
                    <CategorySkeleton />
                    <CategorySkeleton />
                  </>
                ) : (
                  categoryOptions.map((item) => {
                    const active = String(draftCategory) === String(item.id);

                    return (
                      <button
                        key={item.id}
                        onClick={() => setDraftCategory(item.id)}
                        className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ${
                          active
                            ? 'bg-slate-900 text-white'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item.name}
                      </button>
                    );
                  })
                )}
              </div>

              {!categoriesLoading && categoriesError ? (
                <p className="mt-3 text-sm text-rose-500">{categoriesError}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Trạng thái
                </p>
                <div className="flex flex-wrap gap-2">
                  {TABS.map((tab) => {
                    const active = draftTab === tab.key;

                    return (
                      <button
                        key={tab.key}
                        onClick={() => setDraftTab(tab.key)}
                        className={`h-11 rounded-2xl px-4 text-sm font-semibold transition-colors ${
                          active
                            ? 'bg-slate-900 text-white'
                            : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <div className="flex items-center gap-3">
                  <label className="shrink-0 text-sm font-semibold text-slate-700">
                    Sắp xếp
                  </label>
                  <select
                    value={draftSortValue}
                    onChange={(e) => setDraftSortValue(e.target.value)}
                    className="h-11 min-w-55 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleApplyFilters}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <Search size={16} />
                  Tìm kiếm
                </button>

                <button
                  onClick={handleResetFilters}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Đặt lại
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-4xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Kết quả phiên đấu giá
              </h2>
              <p className="mt-1 text-slate-500">
                {auctionsLoading
                  ? 'Đang tải dữ liệu...'
                  : `Trang ${auctionsPage.pageNumber + 1}/${Math.max(
                      auctionsPage.totalPages,
                      1,
                    )} • ${auctionsPage.totalElements} phiên đấu giá`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
                Mỗi trang:{' '}
                <span className="font-bold text-slate-900">
                  {auctionsPage.pageSize}
                </span>
              </div>

              <button
                onClick={handleRetry}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw size={16} />
                Làm mới
              </button>
            </div>
          </div>

          {auctionsLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <AuctionCardSkeleton key={index} />
              ))}
            </div>
          ) : auctionsError ? (
            <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50 px-6 py-14 text-center">
              <h3 className="text-lg font-bold text-rose-700">
                Không thể tải danh sách phiên đấu giá
              </h3>
              <p className="mt-2 text-sm text-rose-600">{auctionsError}</p>
              <button
                onClick={handleRetry}
                className="mt-5 h-11 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : auctionsPage.content.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Không có phiên đấu giá phù hợp
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Hãy thử đổi bộ lọc danh mục hoặc trạng thái để xem thêm phiên
                khác.
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
                    now={now}
                  />
                ))}
              </div>

              <Pagination
                pageNumber={auctionsPage.pageNumber}
                totalPages={auctionsPage.totalPages}
                totalElements={auctionsPage.totalElements}
                pageSize={auctionsPage.pageSize}
                onPageChange={handleChangePage}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
