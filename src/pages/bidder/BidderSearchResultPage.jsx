import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { auctionApi } from '../../api/auctionApi';
import ConfirmModal from '../../components/common/ConfirmModal';
import AuctionCard from '../../components/auction/AuctionCard';

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

function parseSortValue(sortValue) {
  if (!sortValue || sortValue === 'default') {
    return { sortBy: undefined, sortDir: 'asc' };
  }

  const [sortBy, sortDir] = sortValue.split('-');
  return { sortBy, sortDir: sortDir || 'asc' };
}

function CategorySkeleton() {
  return <div className="h-11 w-28 animate-pulse rounded-2xl bg-slate-100" />;
}

function AuctionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="h-52 animate-pulse bg-slate-100" />
      <div className="p-5">
        <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 h-11 animate-pulse rounded-2xl bg-slate-100" />
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
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
            <ChevronRight size={16} />
          </button>
        </div>
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
  const [now, setNow] = useState(Date.now());

  const [joinModal, setJoinModal] = useState({
    isOpen: false,
    loading: false,
    auctionId: null,
    auctionTitle: '',
    auctionPrice: 0,
  });

  const [insufficientModal, setInsufficientModal] = useState({
    isOpen: false,
    loading: false,
    auctionId: null,
    auctionTitle: '',
    auctionPrice: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
      setAuctionsLoading(false);
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
        pageNumber: result?.pageNumber ?? 0,
        pageSize: result?.pageSize ?? 12,
        totalElements: result?.totalElements ?? 0,
        totalPages: result?.totalPages ?? 0,
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
    window.scrollTo({ top: 0, behavior: 'auto' });
    navigate(`/home/auctions/${auctionId}`);
  };

  const handleChangePage = (nextPage) => {
    if (nextPage < 0 || nextPage >= auctionsPage.totalPages) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openJoinModal = (auction) => {
    setJoinModal({
      isOpen: true,
      loading: false,
      auctionId: auction.id,
      auctionTitle: auction.title,
      auctionPrice: auction.depositPrice,
    });
  };

  const closeJoinModal = () => {
    if (joinModal.loading) return;
    setJoinModal({
      isOpen: false,
      loading: false,
      auctionId: null,
      auctionTitle: '',
      auctionPrice: 0,
    });
  };

  const openInsufficientModal = (auctionId, auctionTitle, auctionPrice) => {
    setInsufficientModal({
      isOpen: true,
      loading: false,
      auctionId,
      auctionTitle,
      auctionPrice,
    });
  };

  const closeInsufficientModal = () => {
    if (insufficientModal.loading) return;
    setInsufficientModal({
      isOpen: false,
      loading: false,
      auctionId: null,
      auctionTitle: '',
      auctionPrice: 0,
    });
  };

  const goToAuctionDetail = (auctionId) => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    navigate(`/home/auctions/${auctionId}`);
  };

  const handleJoinAuctionClick = (auction) => {
    openJoinModal(auction);
  };

  const handleConfirmDeposit = async () => {
    const currentAuctionId = joinModal.auctionId;
    const currentAuctionTitle = joinModal.auctionTitle;
    const currentAuctionPrice = joinModal.auctionPrice;

    try {
      setJoinModal((prev) => ({ ...prev, loading: true }));

      const response = await auctionApi.checkBalance(currentAuctionId);
      const result = response?.result || response?.data?.result || {};
      const availableDepositStatus = result?.availableDepositStatus;

      if (availableDepositStatus === 'YES') {
        const joinResponse = await auctionApi.joinAuction(currentAuctionId);
        const joinResult =
          joinResponse?.result || joinResponse?.data?.result || {};

        setJoinModal({
          isOpen: false,
          loading: false,
          auctionId: null,
          auctionTitle: '',
          auctionPrice: 0,
        });

        await fetchAuctions();

        if (joinResult?.paymentUrl) {
          window.location.href = joinResult.paymentUrl;
          return;
        }

        goToAuctionDetail(currentAuctionId);
        return;
      }

      setJoinModal({
        isOpen: false,
        loading: false,
        auctionId: null,
        auctionTitle: '',
        auctionPrice: 0,
      });

      openInsufficientModal(
        currentAuctionId,
        currentAuctionTitle,
        currentAuctionPrice,
      );
    } catch (error) {
      console.error('Check balance failed:', error);
      setJoinModal((prev) => ({ ...prev, loading: false }));
      alert(
        error?.response?.data?.message ||
          'Không thể kiểm tra số dư để tham gia phiên đấu giá.',
      );
    }
  };

  const handleConfirmDirectPayment = async () => {
    const currentAuctionId = insufficientModal.auctionId;

    try {
      setInsufficientModal((prev) => ({ ...prev, loading: true }));

      const response = await auctionApi.joinAuction(currentAuctionId);
      const result = response?.result || response?.data?.result || {};
      const paymentUrl = result?.paymentUrl;

      setInsufficientModal({
        isOpen: false,
        loading: false,
        auctionId: null,
        auctionTitle: '',
        auctionPrice: 0,
      });

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      await fetchAuctions();
      goToAuctionDetail(currentAuctionId);
    } catch (error) {
      console.error('Join auction failed:', error);
      setInsufficientModal((prev) => ({ ...prev, loading: false }));
      alert(
        error?.response?.data?.message || 'Không thể tạo yêu cầu thanh toán.',
      );
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5">
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
                </>
              ) : (
                categoryOptions.map((item) => {
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
                })
              )}
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

      <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Kết quả tìm kiếm
            </h2>
            <p className="mt-1 text-slate-500">
              {!keyword
                ? 'Hãy nhập từ khóa để tìm kiếm phiên đấu giá.'
                : auctionsLoading
                  ? 'Đang tải dữ liệu...'
                  : `Từ khóa "${keyword}" • ${auctionsPage.totalElements} kết quả`}
            </p>
          </div>

          <button
            onClick={fetchAuctions}
            className="inline-flex h-11 items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <AuctionCardSkeleton key={index} />
            ))}
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
                  now={now}
                  onViewDetail={handleViewDetail}
                  onJoinAuction={handleJoinAuctionClick}
                  showJoinButton
                  showDepositPrice
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

      <ConfirmModal
        isOpen={joinModal.isOpen}
        onClose={closeJoinModal}
        onConfirm={handleConfirmDeposit}
        loading={joinModal.loading}
        title="Xác nhận thanh toán tiền đặt cọc"
        message={`Bạn có muốn thanh toán số tiền đặt cọc là ${joinModal.auctionPrice} vnđ để tham gia phiên đấu giá "${joinModal.auctionTitle}" không?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        variant="wallet"
      />

      <ConfirmModal
        isOpen={insufficientModal.isOpen}
        onClose={closeInsufficientModal}
        onConfirm={handleConfirmDirectPayment}
        loading={insufficientModal.loading}
        title="Số dư ví không đủ"
        message={`Số dư khả dụng trong ví của bạn hiện không đủ để thanh toán tiền đặt cọc cho phiên đấu giá "${insufficientModal.auctionTitle}". Bạn có muốn thanh toán trực tiếp không?`}
        confirmText="Thanh toán trực tiếp"
        cancelText="Hủy"
        variant="payment"
      />
    </div>
  );
}
