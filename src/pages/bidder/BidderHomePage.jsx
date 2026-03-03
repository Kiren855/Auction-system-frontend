import { useMemo, useState } from 'react';
import {
  Search,
  Flame,
  Timer,
  Gavel,
  Heart,
  Wallet,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function formatMoney(v) {
  const n = Number(v || 0);
  return n.toLocaleString('vi-VN');
}

function StatusPill({ tone = 'slate', children }) {
  const map = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
    blue: 'bg-sky-50 text-sky-700 border-sky-100',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[tone]}`}
    >
      {children}
    </span>
  );
}

function AuctionCard({ item, actionLabel = 'Tham gia', actionTo = '#' }) {
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="relative">
        <div className="aspect-4/3 bg-slate-100">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <span className="text-sm">No image</span>
            </div>
          )}
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-2">
          {item.badge && (
            <StatusPill tone={item.badgeTone}>{item.badge}</StatusPill>
          )}
          {item.leading === true && (
            <StatusPill tone="green">Bạn đang dẫn đầu</StatusPill>
          )}
          {item.leading === false && item.leading != null && (
            <StatusPill tone="red">Bạn đang bị vượt</StatusPill>
          )}
        </div>

        {item.endsIn && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white shadow">
              <Timer size={14} />
              {item.endsIn}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 line-clamp-1">
              {item.title}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-1">
              {item.subtitle || 'Danh mục • Thương hiệu'}
            </p>
          </div>

          <button
            className="shrink-0 w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition"
            title="Theo dõi"
            type="button"
          >
            <Heart
              size={18}
              className="text-slate-600 group-hover:text-rose-600 transition"
            />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="text-xs text-slate-500">Giá hiện tại</div>
            <div className="mt-1 font-bold text-slate-900">
              {formatMoney(item.currentPrice)} đ
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="text-xs text-slate-500">Người tham gia</div>
            <div className="mt-1 font-bold text-slate-900">
              {item.participants ?? 0}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Link
            to={actionTo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            <Gavel size={16} />
            {actionLabel}
          </Link>

          <span className="text-xs text-slate-500">
            Bước giá:{' '}
            <span className="font-semibold">
              {formatMoney(item.stepPrice)} đ
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, actionLabel, actionTo }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {actionLabel && (
        <Link
          to={actionTo || '#'}
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          {actionLabel}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

export default function BidderHomePage() {
  const [query, setQuery] = useState('');

  // Mock data (thay bằng API sau)
  const liveAuctions = useMemo(
    () => [
      {
        id: 'a1',
        title: 'iPhone 15 Pro Max 256GB',
        subtitle: 'Điện thoại • Apple',
        currentPrice: 21500000,
        stepPrice: 200000,
        participants: 38,
        endsIn: '01:12:45',
        badge: 'LIVE',
        badgeTone: 'red',
        imageUrl: '',
      },
      {
        id: 'a2',
        title: 'Sony WH-1000XM5',
        subtitle: 'Tai nghe • Sony',
        currentPrice: 5400000,
        stepPrice: 50000,
        participants: 14,
        endsIn: '03:45:10',
        badge: 'LIVE',
        badgeTone: 'red',
        imageUrl: '',
      },
      {
        id: 'a3',
        title: 'MacBook Air M2 13"',
        subtitle: 'Laptop • Apple',
        currentPrice: 17900000,
        stepPrice: 150000,
        participants: 22,
        endsIn: '05:08:22',
        badge: 'LIVE',
        badgeTone: 'red',
        imageUrl: '',
      },
    ],
    [],
  );

  const endingSoon = useMemo(
    () => [
      {
        id: 'e1',
        title: 'Samsung Galaxy S24 Ultra',
        subtitle: 'Điện thoại • Samsung',
        currentPrice: 24500000,
        stepPrice: 200000,
        participants: 41,
        endsIn: '00:08:12',
        badge: 'Sắp kết thúc',
        badgeTone: 'amber',
        imageUrl: '',
      },
      {
        id: 'e2',
        title: 'Nintendo Switch OLED',
        subtitle: 'Gaming • Nintendo',
        currentPrice: 6800000,
        stepPrice: 50000,
        participants: 19,
        endsIn: '00:18:46',
        badge: 'Sắp kết thúc',
        badgeTone: 'amber',
        imageUrl: '',
      },
      {
        id: 'e3',
        title: 'AirPods Pro 2',
        subtitle: 'Tai nghe • Apple',
        currentPrice: 3400000,
        stepPrice: 30000,
        participants: 27,
        endsIn: '00:27:31',
        badge: 'Sắp kết thúc',
        badgeTone: 'amber',
        imageUrl: '',
      },
    ],
    [],
  );

  const myBidding = useMemo(
    () => [
      {
        id: 'm1',
        title: 'Rolex Datejust (Used)',
        subtitle: 'Đồng hồ • Rolex',
        currentPrice: 125000000,
        stepPrice: 1000000,
        participants: 9,
        endsIn: '02:02:02',
        leading: true,
        badge: 'Đang tham gia',
        badgeTone: 'blue',
        imageUrl: '',
      },
      {
        id: 'm2',
        title: 'Canon EOS R6 Mark II',
        subtitle: 'Máy ảnh • Canon',
        currentPrice: 37800000,
        stepPrice: 200000,
        participants: 17,
        endsIn: '04:15:18',
        leading: false,
        badge: 'Đang tham gia',
        badgeTone: 'blue',
        imageUrl: '',
      },
    ],
    [],
  );

  const watchlist = useMemo(
    () => [
      {
        id: 'w1',
        title: 'Dyson V12 Detect Slim',
        subtitle: 'Gia dụng • Dyson',
        currentPrice: 9800000,
        stepPrice: 50000,
        participants: 12,
        endsIn: '12:40:10',
        badge: 'Theo dõi',
        badgeTone: 'slate',
        imageUrl: '',
      },
      {
        id: 'w2',
        title: 'LEGO Technic Supercar',
        subtitle: 'Đồ chơi • LEGO',
        currentPrice: 4200000,
        stepPrice: 30000,
        participants: 8,
        endsIn: '16:05:42',
        badge: 'Theo dõi',
        badgeTone: 'slate',
        imageUrl: '',
      },
    ],
    [],
  );

  const stats = useMemo(
    () => [
      {
        label: 'Phiên đang diễn ra',
        value: '128',
        icon: <Flame size={18} />,
        tone: 'bg-rose-50 text-rose-700 border-rose-100',
      },
      {
        label: 'Bạn đang tham gia',
        value: String(myBidding.length),
        icon: <Gavel size={18} />,
        tone: 'bg-sky-50 text-sky-700 border-sky-100',
      },
      {
        label: 'Sắp kết thúc (30p)',
        value: String(endingSoon.length),
        icon: <Timer size={18} />,
        tone: 'bg-amber-50 text-amber-700 border-amber-100',
      },
      {
        label: 'Đặt cọc đang giữ',
        value: '2.000.000 đ',
        icon: <Wallet size={18} />,
        tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      },
    ],
    [endingSoon.length, myBidding.length],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top area */}
      <div className="bg-linear-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                Trang chủ đấu giá
              </h1>
              <p className="text-slate-600 mt-2">
                Khám phá phiên đang diễn ra, sắp kết thúc và những phiên bạn
                quan tâm.
              </p>
            </div>

            {/* Search */}
            <div className="w-full lg:w-115">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Search size={18} className="text-slate-600" />
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm phiên đấu giá, sản phẩm, thương hiệu..."
                  className="flex-1 outline-none text-sm text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                >
                  Tìm
                </button>
              </div>

              {/* quick filters */}
              <div className="flex flex-wrap gap-2 mt-3">
                {['Điện thoại', 'Laptop', 'Đồng hồ', 'Máy ảnh', 'Gia dụng'].map(
                  (t) => (
                    <button
                      key={t}
                      className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition"
                      type="button"
                    >
                      {t}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-4`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${s.tone}`}
                  >
                    {s.icon}
                  </div>
                  <TrendingUp size={18} className="text-slate-300" />
                </div>
                <div className="mt-3">
                  <div className="text-xs text-slate-500">{s.label}</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {s.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* LIVE */}
        <section>
          <SectionHeader
            icon={<Flame size={20} />}
            title="Đang diễn ra"
            subtitle="Các phiên LIVE bạn có thể tham gia ngay"
            actionLabel="Xem tất cả"
            actionTo="/auctions/live"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {liveAuctions.map((a) => (
              <AuctionCard
                key={a.id}
                item={a}
                actionLabel="Tham gia"
                actionTo={`/auctions/${a.id}`}
              />
            ))}
          </div>
        </section>

        {/* Ending soon */}
        <section>
          <SectionHeader
            icon={<Timer size={20} />}
            title="Sắp kết thúc"
            subtitle="Chốt deal nhanh trước khi hết thời gian"
            actionLabel="Xem tất cả"
            actionTo="/auctions/ending-soon"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {endingSoon.map((a) => (
              <AuctionCard
                key={a.id}
                item={a}
                actionLabel="Đặt giá"
                actionTo={`/auctions/${a.id}`}
              />
            ))}
          </div>
        </section>

        {/* My bidding */}
        <section>
          <SectionHeader
            icon={<Gavel size={20} />}
            title="Phiên bạn đang tham gia"
            subtitle="Theo dõi vị trí và ra quyết định nhanh"
            actionLabel="Xem lịch sử"
            actionTo="/account/my-bids"
          />

          {myBidding.length === 0 ? (
            <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-700 font-semibold">
                Bạn chưa tham gia phiên nào.
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Hãy tham gia một phiên LIVE để bắt đầu đấu giá.
              </p>
              <Link
                to="/auctions/live"
                className="inline-flex items-center justify-center mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
              >
                Khám phá phiên LIVE
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
              {myBidding.map((a) => (
                <AuctionCard
                  key={a.id}
                  item={a}
                  actionLabel="Xem phiên"
                  actionTo={`/auctions/${a.id}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Watchlist */}
        <section>
          <SectionHeader
            icon={<Heart size={20} />}
            title="Theo dõi"
            subtitle="Những phiên bạn quan tâm"
            actionLabel="Quản lý"
            actionTo="/account/watchlist"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {watchlist.map((a) => (
              <AuctionCard
                key={a.id}
                item={a}
                actionLabel="Xem"
                actionTo={`/auctions/${a.id}`}
              />
            ))}
          </div>
        </section>

        {/* Footer spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
}
