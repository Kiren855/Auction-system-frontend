import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Clock3,
  Gavel,
  Users,
  ArrowRight,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import { auctionApi } from '../../api/auctionApi';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'PENDING', label: 'Sắp bắt đầu' },
  { key: 'ONGOING', label: 'Đang diễn ra' },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ';
}

function formatRelativeTimeFromSeconds(seconds) {
  const total = Number(seconds || 0);

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

function formatDateTime(value) {
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

function getAuctionTimeText(auction) {
  if (!auction) return '--';

  if (auction.status === 'ONGOING') {
    return formatRelativeTimeFromSeconds(auction.remainingSeconds);
  }

  if (auction.status === 'PENDING') {
    return `Bắt đầu lúc ${formatDateTime(auction.startAt)}`;
  }

  if (auction.status === 'COMPLETED') {
    return 'Đã kết thúc';
  }

  return '--';
}

function StatCard({ title, value, icon, iconWrap }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconWrap}`}
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

function CategorySkeleton() {
  return <div className="h-11 w-28 rounded-2xl bg-slate-100 animate-pulse" />;
}

function StatSkeleton() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 animate-pulse" />
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

      setAuctions(Array.isArray(content) ? content : []);
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

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
        <section className="relative overflow-hidden rounded-4xl bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-8 md:px-10 md:py-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-16 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-amber-300">
                Nền tảng đấu giá trực tuyến
              </span>

              <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Khám phá các phiên đấu giá
                <br />
                phù hợp với bạn
              </h1>

              <p className="mt-4 max-w-2xl text-base md:text-lg leading-7 text-slate-300">
                Theo dõi các phiên đang diễn ra, đón đầu phiên sắp bắt đầu và
                tham gia đấu giá với giao diện trực quan, hiện đại, tập trung
                vào thông tin quan trọng nhất.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleViewAll}
                  className="h-12 px-6 rounded-2xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 transition-colors"
                >
                  Xem tất cả phiên đấu giá
                </button>

                <button
                  onClick={() => navigate('/my-auctions')}
                  className="h-12 px-6 rounded-2xl border border-white/15 bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  Phiên bạn đã tham gia
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-5">
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
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
                    >
                      {category.name}
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={handleViewAll}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors"
              >
                Xem danh sách đầy đủ
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
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

        <section className="rounded-4xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
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
                className="mt-5 h-11 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
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
                    onViewDetail={handleViewDetail}
                  />
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleViewAll}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Xem tất cả phiên đấu giá
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
