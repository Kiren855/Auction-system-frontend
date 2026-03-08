import React from 'react';
import {
  Flame,
  Clock3,
  Wallet,
  Gavel,
  ArrowRight,
  Eye,
  Users,
  Smartphone,
  Laptop,
  Watch,
  Camera,
  Home,
} from 'lucide-react';

const stats = [
  {
    title: 'Phiên đang diễn ra',
    value: '128',
    icon: <Flame size={20} />,
    iconWrap: 'bg-rose-50 text-rose-500 border border-rose-100',
  },
  {
    title: 'Bạn đang tham gia',
    value: '2',
    icon: <Gavel size={20} />,
    iconWrap: 'bg-sky-50 text-sky-500 border border-sky-100',
  },
  {
    title: 'Sắp kết thúc (30p)',
    value: '3',
    icon: <Clock3 size={20} />,
    iconWrap: 'bg-amber-50 text-amber-500 border border-amber-100',
  },
  {
    title: 'Đặt cọc đang giữ',
    value: '2.000.000 đ',
    icon: <Wallet size={20} />,
    iconWrap: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  },
];

const categories = [
  { label: 'Điện thoại', icon: <Smartphone size={16} /> },
  { label: 'Laptop', icon: <Laptop size={16} /> },
  { label: 'Đồng hồ', icon: <Watch size={16} /> },
  { label: 'Máy ảnh', icon: <Camera size={16} /> },
  { label: 'Gia dụng', icon: <Home size={16} /> },
];

const liveAuctions = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max 256GB',
    currentPrice: '18.500.000 đ',
    bids: 14,
    watchers: 31,
    timeLeft: '01:12:45',
    image:
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: 'MacBook Air M2 13 inch',
    currentPrice: '19.800.000 đ',
    bids: 9,
    watchers: 24,
    timeLeft: '03:45:10',
    image:
      'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    title: 'Sony Alpha A6400 Body',
    currentPrice: '14.200.000 đ',
    bids: 17,
    watchers: 42,
    timeLeft: '05:08:22',
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
  },
];

const endingSoonAuctions = [
  {
    id: 4,
    title: 'Apple Watch Series 8',
    currentPrice: '6.100.000 đ',
    bids: 8,
    watchers: 19,
    timeLeft: '00:18:32',
    image:
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    title: 'Tai nghe Sony WH-1000XM5',
    currentPrice: '5.450.000 đ',
    bids: 12,
    watchers: 26,
    timeLeft: '00:25:11',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    title: 'Loa Marshall Acton III',
    currentPrice: '4.900.000 đ',
    bids: 7,
    watchers: 15,
    timeLeft: '00:29:54',
    image:
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 7,
    title: 'Kindle Paperwhite Gen 11',
    currentPrice: '2.950.000 đ',
    bids: 5,
    watchers: 12,
    timeLeft: '00:12:49',
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
  },
];

const recommendedAuctions = [
  {
    id: 8,
    title: 'Dell XPS 13 Plus',
    currentPrice: '24.500.000 đ',
    bids: 11,
    watchers: 21,
    timeLeft: '06:42:10',
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 9,
    title: 'Fujifilm Instax Mini Evo',
    currentPrice: '3.800.000 đ',
    bids: 6,
    watchers: 17,
    timeLeft: '07:20:14',
    image:
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 10,
    title: 'Bàn phím cơ Keychron K8',
    currentPrice: '1.650.000 đ',
    bids: 10,
    watchers: 20,
    timeLeft: '02:55:41',
    image:
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 11,
    title: 'Nintendo Switch OLED',
    currentPrice: '6.750.000 đ',
    bids: 13,
    watchers: 29,
    timeLeft: '09:10:26',
    image:
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80',
  },
];

function AuctionCard({ auction, compact = false }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:shadow-slate-200/70 transition-all duration-300">
      <div className={`relative overflow-hidden ${compact ? 'h-44' : 'h-52'}`}>
        <img
          // src={auction.image}
          // alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-600 px-3 py-1 text-xs font-bold border border-rose-100">
            LIVE
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs font-bold shadow-lg">
            <Clock3 size={14} />
            {auction.timeLeft}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
      </div>

      <div className="p-5">
        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 min-h-[48px]">
          {auction.title}
        </h3>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Giá hiện tại</p>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight">
              {auction.currentPrice}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Gavel size={15} />
            {auction.bids} lượt ra giá
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye size={15} />
            {auction.watchers} theo dõi
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button className="flex-1 h-11 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors">
            Tham gia đấu giá
          </button>
          <button className="h-11 px-4 rounded-2xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="text-slate-500 mt-1">{subtitle}</p>
        </div>
      </div>

      <button className="hidden sm:inline-flex items-center gap-2 text-slate-700 font-semibold hover:text-slate-900 transition-colors">
        Xem tất cả
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

export default function BidderDashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-10 md:px-10">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-amber-400/10 blur-3xl"></div>
        <div className="absolute -left-10 -bottom-16 w-56 h-56 rounded-full bg-sky-400/10 blur-3xl"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/10 text-amber-300 px-3 py-1 text-xs font-bold border border-white/10">
              Nền tảng đấu giá trực tuyến
            </span>

            <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Khám phá phiên đấu giá
              <br />
              đang diễn ra ngay lúc này
            </h1>

            <p className="mt-4 text-slate-300 max-w-xl leading-7">
              Theo dõi các phiên nổi bật, sản phẩm sắp kết thúc và nhanh chóng
              tham gia đặt giá với giao diện trực quan, hiện đại.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button className="h-12 px-6 rounded-2xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 transition-colors">
                Khám phá phiên live
              </button>
              <button className="h-12 px-6 rounded-2xl border border-white/15 bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors">
                Xem lịch sử đấu giá
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-lg"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.iconWrap}`}
                >
                  {item.icon}
                </div>
                <p className="mt-4 text-sm text-slate-300">{item.title}</p>
                <p className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-[28px] border border-slate-200 p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {categories.map((item) => (
            <button
              key={item.label}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.iconWrap}`}
            >
              {item.icon}
            </div>
            <p className="mt-5 text-sm text-slate-500">{item.title}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <SectionHeader
          icon={<Flame size={24} />}
          title="Đang diễn ra"
          subtitle="Các phiên LIVE bạn có thể tham gia ngay"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {liveAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <SectionHeader
          icon={<Clock3 size={24} />}
          title="Sắp kết thúc"
          subtitle="Những phiên có thời gian còn lại ngắn, cần theo dõi ngay"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {endingSoonAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} compact />
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <SectionHeader
          icon={<Users size={24} />}
          title="Gợi ý cho bạn"
          subtitle="Dựa trên các danh mục và phiên bạn đã quan tâm"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {recommendedAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
