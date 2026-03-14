import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Clock3,
  Gavel,
  ArrowRight,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import { auctionApi } from '../../api/auctionApi';
import ConfirmModal from '../../components/common/ConfirmModal';
import AuctionCard from '../../components/auction/AuctionCard';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'PENDING', label: 'Sắp bắt đầu' },
  { key: 'ONGOING', label: 'Đang diễn ra' },
];

function StatCard({ title, value, icon, iconWrap }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconWrap}`}
      >
        {icon}
      </div>
      <p className="mt-5 text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function CategorySkeleton() {
  return <div className="h-11 w-28 rounded-2xl bg-slate-100 animate-pulse" />;
}

function StatSkeleton() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 animate-pulse" />
      <div className="mt-5 h-4 w-32 rounded bg-slate-100 animate-pulse" />
      <div className="mt-3 h-8 w-20 rounded bg-slate-100 animate-pulse" />
    </div>
  );
}

function CardSkeleton() {
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

export default function HomePage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    ongoingCount: 0,
    upcomingCount: 0,
    joinedCount: 0,
  });
  const [auctions, setAuctions] = useState([]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [auctionsLoading, setAuctionsLoading] = useState(true);

  const [categoriesError, setCategoriesError] = useState('');
  const [statsError, setStatsError] = useState('');
  const [auctionsError, setAuctionsError] = useState('');

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

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError('');

      const response = await auctionApi.getAllCategories();
      const result = response?.result || response?.data?.result || [];

      setCategories(Array.isArray(result) ? result : []);
    } catch (error) {
      setCategoriesError('Không thể tải danh mục.');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError('');

      const response = await auctionApi.getHomeStats();
      const result = response?.result || response?.data?.result || {};

      setStats({
        ongoingCount: result?.ongoingCount || 0,
        upcomingCount: result?.upcomingCount || 0,
        joinedCount: result?.joinedCount || 0,
      });
    } catch (error) {
      setStatsError('Không thể tải thống kê.');
      setStats({
        ongoingCount: 0,
        upcomingCount: 0,
        joinedCount: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchAuctions = useCallback(async () => {
    try {
      setAuctionsLoading(true);
      setAuctionsError('');

      const params = {
        page: 0,
        size: 6,
      };

      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      if (activeCategory !== 'all') {
        params.categoryId = activeCategory;
      }

      const response = await auctionApi.getAuctions(params);
      const result = response?.result || response?.data?.result || {};
      const content = result?.content || [];
      console.log(result);

      const mappedAuctions = Array.isArray(content)
        ? content.map((item) => ({
            ...item,
            _fetchedAt: Date.now(),
          }))
        : [];

      setAuctions(mappedAuctions);
    } catch (error) {
      setAuctionsError('Không thể tải danh sách phiên đấu giá.');
      setAuctions([]);
    } finally {
      setAuctionsLoading(false);
    }
  }, [activeCategory, activeTab]);

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [fetchCategories, fetchStats]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const categoryOptions = useMemo(() => {
    return [{ id: 'all', name: 'Tất cả' }, ...categories];
  }, [categories]);

  const statItems = useMemo(() => {
    return [
      {
        key: 'ongoing',
        title: 'Phiên đang diễn ra',
        value: stats.ongoingCount,
        icon: <Flame size={20} />,
        iconWrap: 'bg-rose-50 text-rose-500 border border-rose-100',
      },
      {
        key: 'upcoming',
        title: 'Sắp bắt đầu',
        value: stats.upcomingCount,
        icon: <Clock3 size={20} />,
        iconWrap: 'bg-amber-50 text-amber-500 border border-amber-100',
      },
      {
        key: 'joined',
        title: 'Bạn đã tham gia',
        value: stats.joinedCount,
        icon: <Gavel size={20} />,
        iconWrap: 'bg-sky-50 text-sky-500 border border-sky-100',
      },
    ];
  }, [stats]);

  const handleViewAll = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    navigate('/home/auctions');
  };

  const handleViewDetail = (auctionId) => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    navigate(`/home/auctions/${auctionId}`);
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
    try {
      setJoinModal((prev) => ({ ...prev, loading: true }));

      const response = await auctionApi.checkBalance(joinModal.auctionId);
      const result = response?.result || response?.data?.result || {};
      const availableDepositStatus = result?.availableDepositStatus;

      if (availableDepositStatus === 'YES') {
        const joinResponse = await auctionApi.joinAuction(joinModal.auctionId);
        const joinResult =
          joinResponse?.result || joinResponse?.data?.result || {};

        setJoinModal({
          isOpen: false,
          loading: false,
          auctionId: null,
          auctionTitle: '',
          auctionPrice: 0,
        });

        await fetchStats();
        await fetchAuctions();

        if (joinResult?.paymentUrl) {
          window.location.href = joinResult.paymentUrl;
          return;
        }

        goToAuctionDetail(joinModal.auctionId);
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
        joinModal.auctionId,
        joinModal.auctionTitle,
        joinModal.auctionPrice,
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
    try {
      setInsufficientModal((prev) => ({ ...prev, loading: true }));

      const response = await auctionApi.joinAuction(
        insufficientModal.auctionId,
      );
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

      await fetchStats();
      await fetchAuctions();
      goToAuctionDetail(insufficientModal.auctionId);
    } catch (error) {
      console.error('Join auction failed:', error);
      setInsufficientModal((prev) => ({ ...prev, loading: false }));
      alert(
        error?.response?.data?.message || 'Không thể tạo yêu cầu thanh toán.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
        <section className="relative overflow-hidden rounded-4xl bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-8 md:px-10 md:py-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-16 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-amber-300">
                Nền tảng đấu giá trực tuyến
              </span>

              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
                Khám phá các phiên đấu giá phù hợp với bạn
              </h1>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleViewAll}
                  className="h-12 rounded-2xl bg-amber-500 px-6 font-bold text-slate-900 transition-colors hover:bg-amber-400"
                >
                  Xem tất cả phiên đấu giá
                </button>

                <button
                  onClick={() => navigate('/my-auctions')}
                  className="h-12 rounded-2xl border border-white/15 bg-white/5 px-6 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Phiên bạn đã tham gia
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Khám phá nhanh</p>
                  <h3 className="text-xl font-bold text-white">
                    Danh mục phổ biến
                  </h3>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {categoriesLoading ? (
                  <>
                    <div className="h-11 w-28 rounded-2xl bg-white/10 animate-pulse" />
                    <div className="h-11 w-24 rounded-2xl bg-white/10 animate-pulse" />
                    <div className="h-11 w-32 rounded-2xl bg-white/10 animate-pulse" />
                    <div className="h-11 w-28 rounded-2xl bg-white/10 animate-pulse" />
                  </>
                ) : categoriesError ? (
                  <p className="text-sm text-rose-200">{categoriesError}</p>
                ) : (
                  categoryOptions.slice(1, 5).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                    >
                      {category.name}
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={handleViewAll}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 transition-colors hover:text-amber-200"
              >
                Xem danh sách đầy đủ
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
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
                const active = String(activeCategory) === String(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveCategory(item.id)}
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
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {statsLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            statItems.map((item) => (
              <StatCard
                key={item.key}
                title={item.title}
                value={item.value}
                icon={item.icon}
                iconWrap={item.iconWrap}
              />
            ))
          )}
        </section>

        {!statsLoading && statsError ? (
          <p className="-mt-4 text-sm text-rose-500">{statsError}</p>
        ) : null}

        <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Danh sách phiên đấu giá
              </h2>
              <p className="mt-1 text-slate-500">
                Hiển thị các phiên theo bộ lọc danh mục và trạng thái bạn chọn
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => {
                const active = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
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

          {auctionsLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : auctionsError ? (
            <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50 px-6 py-14 text-center">
              <h3 className="text-lg font-bold text-rose-700">
                Không thể tải danh sách phiên đấu giá
              </h3>
              <p className="mt-2 text-sm text-rose-600">{auctionsError}</p>
              <button
                onClick={fetchAuctions}
                className="mt-5 h-11 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                Thử lại
              </button>
            </div>
          ) : auctions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Không có phiên đấu giá phù hợp
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Hãy thử đổi danh mục hoặc trạng thái để xem thêm phiên khác.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {auctions.map((auction) => (
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

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleViewAll}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
                >
                  Xem tất cả phiên đấu giá
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </section>
      </div>

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
