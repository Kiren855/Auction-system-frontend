import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gavel,
  Package,
  Tag,
  User,
  CalendarDays,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { auctionApi } from '../../api/auctionApi';
import StatusBadge from '../../components/StatusBadge';

function formatVND(value) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDateTimeVN(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';

  return d.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes) {
  const m = Number(minutes || 0);
  if (!m) return '0 phút';

  const day = Math.floor(m / (60 * 24));
  const hour = Math.floor((m % (60 * 24)) / 60);
  const min = m % 60;

  const parts = [];
  if (day) parts.push(`${day} ngày`);
  if (hour) parts.push(`${hour} giờ`);
  if (min) parts.push(`${min} phút`);

  return parts.join(' ');
}

function formatCondition(condition) {
  const map = {
    NEW: 'Mới',
    LIKE_NEW: 'Như mới',
    USED: 'Đã qua sử dụng',
    REFURBISHED: 'Tân trang',
  };

  return map[String(condition || '').toUpperCase()] || condition || '-';
}

function getStatusText(status) {
  const map = {
    CREATED: 'Đã tạo',
    PENDING: 'Sắp diễn ra',
    ONGOING: 'Đang diễn ra',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã huỷ',
  };

  return map[String(status || '').toUpperCase()] || status || '-';
}

function getTimeParts(ms) {
  if (!ms || ms <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      expired: true,
    };
  }

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    total: totalSeconds,
    expired: false,
  };
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function CompactCountdown({ label, time }) {
  if (!time || time.expired) {
    return (
      <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-500">
        {label}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-500">{label}</span>

      <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
        {time.days > 0 ? <span>{time.days} ngày</span> : null}
        <span>{pad2(time.hours)}h</span>
        <span>{pad2(time.minutes)}m</span>
        <span>{pad2(time.seconds)}s</span>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <div className="mt-0.5 text-slate-500">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="mt-1 wrap-break-word text-sm font-semibold text-slate-900">
          {value}
        </div>
      </div>
    </div>
  );
}

function AttributeItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 wrap-break-word text-sm font-semibold text-slate-900">
        {String(value)}
      </div>
    </div>
  );
}

export default function AuctionDetailHomePage() {
  const { auctionId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auction, setAuction] = useState(null);

  const [selectedImage, setSelectedImage] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const [serverTimeMs, setServerTimeMs] = useState(null);
  const [clientAnchorMs, setClientAnchorMs] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await auctionApi.getAuctionDetail(auctionId);
      const result = res?.data?.result || null;
      const serverTime = res?.data?.server_time;

      setAuction(result);

      if (serverTime) {
        const parsed = new Date(serverTime).getTime();
        if (!Number.isNaN(parsed)) {
          setServerTimeMs(parsed);
          setClientAnchorMs(Date.now());
          setNowMs(parsed);
        }
      }
    } catch (e) {
      setError(
        e?.response?.data?.message || 'Không thể tải chi tiết phiên đấu giá.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auctionId) return;
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId]);

  useEffect(() => {
    if (!serverTimeMs || !clientAnchorMs) return;

    const timer = setInterval(() => {
      const elapsed = Date.now() - clientAnchorMs;
      setNowMs(serverTimeMs + elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [serverTimeMs, clientAnchorMs]);

  const status = String(auction?.status || '').toUpperCase();

  const images = useMemo(() => {
    return (auction?.item?.images || [])
      .map((img) => img?.image_url)
      .filter(Boolean);
  }, [auction]);

  const primaryImage = useMemo(() => {
    const list = auction?.item?.images || [];
    const primary = list.find((img) => img?.is_primary || img?.primary);
    return primary?.image_url || list?.[0]?.image_url || '';
  }, [auction]);

  useEffect(() => {
    if (!auction) return;
    setSelectedImage((prev) => prev || primaryImage || images[0] || '');
  }, [auction, primaryImage, images]);

  const selectedIndex = useMemo(() => {
    const idx = images.findIndex((img) => img === selectedImage);
    return idx >= 0 ? idx : 0;
  }, [images, selectedImage]);

  const startAtMs = useMemo(() => {
    const time = new Date(auction?.start_at || '').getTime();
    return Number.isNaN(time) ? null : time;
  }, [auction]);

  const endAtMs = useMemo(() => {
    if (!startAtMs) return null;
    return startAtMs + Number(auction?.duration_minutes || 0) * 60 * 1000;
  }, [startAtMs, auction]);

  const pendingTime = useMemo(() => {
    if (status !== 'PENDING' || !startAtMs) return null;
    return getTimeParts(startAtMs - nowMs);
  }, [status, startAtMs, nowMs]);

  const ongoingTime = useMemo(() => {
    if (status !== 'ONGOING' || !endAtMs) return null;
    return getTimeParts(endAtMs - nowMs);
  }, [status, endAtMs, nowMs]);

  const openModalByUrl = (url) => {
    if (!url) return;
    const idx = images.findIndex((u) => u === url);
    setModalIndex(idx >= 0 ? idx : 0);
    setImageModalOpen(true);
  };

  const closeModal = () => setImageModalOpen(false);

  const goPrev = () => {
    if (!images.length) return;
    setModalIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goNext = () => {
    if (!images.length) return;
    setModalIndex((i) => (i + 1) % images.length);
  };

  useEffect(() => {
    if (!imageModalOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageModalOpen, images.length]);

  const handleJoinAuction = () => {
    // TODO: xử lý sau
    console.log('join auction', auction?.id);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-5 lg:py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-5 flex items-start gap-3">
          <Link
            to="/home/auctions"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-slate-900 lg:text-3xl">
              {auction?.title || 'Chi tiết phiên đấu giá'}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {!loading && auction ? (
                <StatusBadge status={auction?.status} />
              ) : null}
              {auction?.seller_name ? (
                <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-600 shadow-sm border border-slate-200">
                  Người bán:{' '}
                  <span className="font-semibold">{auction.seller_name}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <div className="h-95 rounded-3xl bg-slate-200" />
                </div>
                <div className="space-y-4 lg:col-span-7">
                  <div className="h-12 rounded-2xl bg-slate-200" />
                  <div className="h-28 rounded-2xl bg-slate-200" />
                  <div className="h-28 rounded-2xl bg-slate-200" />
                  <div className="h-20 rounded-2xl bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-sm">
            <div className="font-semibold">Có lỗi xảy ra</div>
            <div className="mt-1 text-sm">{error}</div>
          </div>
        ) : !auction ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Không tìm thấy phiên đấu giá.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                    {selectedImage ? (
                      <div className="relative">
                        <img
                          src={selectedImage}
                          alt={auction?.item?.item_name || 'Auction item'}
                          className="h-80 w-full cursor-zoom-in object-contain bg-white sm:h-95 lg:h-105"
                          onDoubleClick={() => openModalByUrl(selectedImage)}
                          draggable="false"
                        />

                        {images.length > 1 ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const prev =
                                  (selectedIndex - 1 + images.length) %
                                  images.length;
                                setSelectedImage(images[prev]);
                              }}
                              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow transition hover:bg-white"
                            >
                              <ChevronLeft size={18} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const next =
                                  (selectedIndex + 1) % images.length;
                                setSelectedImage(images[next]);
                              }}
                              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow transition hover:bg-white"
                            >
                              <ChevronRight size={18} />
                            </button>
                          </>
                        ) : null}

                        <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
                          {images.length
                            ? `${selectedIndex + 1}/${images.length}`
                            : '0/0'}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-80 flex-col items-center justify-center gap-2 text-slate-400 sm:h-95 lg:h-105">
                        <ImageIcon size={32} />
                        <span className="text-sm">Không có ảnh sản phẩm</span>
                      </div>
                    )}
                  </div>

                  {images.length > 1 ? (
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {images.slice(0, 10).map((url, idx) => {
                        const active = url === selectedImage;

                        return (
                          <button
                            key={`${url}-${idx}`}
                            type="button"
                            onClick={() => setSelectedImage(url)}
                            className={`overflow-hidden rounded-2xl border transition ${
                              active
                                ? 'border-slate-900 ring-2 ring-slate-900/10'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`thumb-${idx + 1}`}
                              className="h-16 w-full object-cover"
                              draggable="false"
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-5 lg:col-span-7">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">
                          {auction?.item?.item_name || 'Sản phẩm đấu giá'}
                        </h2>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {status === 'PENDING' ? (
                          <CompactCountdown
                            label="Bắt đầu sau"
                            time={pendingTime}
                          />
                        ) : null}

                        {status === 'ONGOING' ? (
                          <CompactCountdown
                            label="Còn lại"
                            time={ongoingTime}
                          />
                        ) : null}

                        {(status === 'COMPLETED' || status === 'CANCELLED') && (
                          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-500">
                            {status === 'COMPLETED'
                              ? 'Phiên đấu giá đã kết thúc'
                              : 'Phiên đấu giá đã bị huỷ'}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleJoinAuction}
                      disabled={loading || !auction}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition ${
                        loading || !auction
                          ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <Gavel size={18} />
                      Tham gia phiên đấu giá
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <InfoRow
                      icon={<Tag size={16} />}
                      label="Danh mục"
                      value={auction?.item?.category_name || '-'}
                    />
                    <InfoRow
                      icon={<Tag size={16} />}
                      label="Thương hiệu"
                      value={auction?.item?.brand || '-'}
                    />
                    <InfoRow
                      icon={<Package size={16} />}
                      label="Tình trạng"
                      value={formatCondition(auction?.item?.condition)}
                    />
                    <InfoRow
                      icon={<CalendarDays size={16} />}
                      label="Thời gian bắt đầu"
                      value={formatDateTimeVN(auction?.start_at)}
                    />
                    <InfoRow
                      icon={<Clock3 size={16} />}
                      label="Thời lượng phiên"
                      value={formatDuration(auction?.duration_minutes)}
                    />
                    <InfoRow
                      icon={<User size={16} />}
                      label="Người bán"
                      value={auction?.seller_name || '-'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">
                      Giá khởi điểm
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">
                      {formatVND(auction?.start_price)}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                    <div className="text-sm font-medium text-amber-700">
                      Giá hiện tại
                    </div>
                    <div className="mt-2 text-2xl font-bold text-amber-800">
                      {formatVND(auction?.current_price)}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
                    <div className="text-sm font-medium text-sky-700">
                      Bước giá
                    </div>
                    <div className="mt-2 text-2xl font-bold text-sky-800">
                      {formatVND(auction?.step_price)}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-slate-700" />
                    <h3 className="text-lg font-bold text-slate-900">
                      Mô tả sản phẩm
                    </h3>
                  </div>

                  <div className="text-sm leading-7 text-slate-700 whitespace-pre-line">
                    {auction?.item?.description || 'Chưa có mô tả sản phẩm.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Thông tin thêm về sản phẩm
                </h3>
              </div>

              {Object.keys(auction?.item?.attributes || {}).length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Chưa có thuộc tính sản phẩm.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(auction?.item?.attributes || {}).map(
                    ([key, value]) => (
                      <AttributeItem key={key} label={key} value={value} />
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {imageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-slate-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute left-3 right-3 top-3 z-10 flex items-center justify-between">
              <div className="rounded-full bg-black/45 px-3 py-1 text-xs text-white">
                {images.length ? `${modalIndex + 1}/${images.length}` : '0/0'}
              </div>

              <button
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 hover:bg-white"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-center bg-black">
              <img
                src={images[modalIndex] || selectedImage}
                alt="Preview"
                className="max-h-[85vh] w-auto object-contain"
                draggable="false"
              />
            </div>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 hover:bg-white"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 hover:bg-white"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
