import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auctionApi } from '../../api/auctionApi';
import StatusBadge from '../../components/StatusBadge';
import AuctionParticipantsTab from '../../components/auction/AuctionParticipantsTab';

const TABS = [
  { key: 'detail', label: 'Chi tiết' },
  { key: 'participants', label: 'Người tham gia' },
  { key: 'abnormal', label: 'Hoạt động bất thường' },
];

function formatDuration(minutes) {
  const m = Number(minutes || 0);
  if (!m) return '0 phút';
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return `${h} giờ ${r} phút`;
  if (h) return `${h} giờ`;
  return `${r} phút`;
}

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

export default function AuctionDetailPage() {
  const { auctionId } = useParams();
  const [activeTab, setActiveTab] = useState('detail');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auction, setAuction] = useState(null);

  // Gallery states
  const [selectedImage, setSelectedImage] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // Action states (start/cancel)
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null, // 'start' | 'cancel'
    loading: false,
  });

  // ====== Fetch detail (ONLY ONE place) ======
  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await auctionApi.getAuctionDetail(auctionId);
      setAuction(res?.data?.result || null);
    } catch (e) {
      setError(
        e?.response?.data?.message || 'Không thể tải chi tiết phiên đấu giá.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Load when enter page / auctionId changes
  useEffect(() => {
    if (auctionId) fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId]);

  const images = useMemo(() => {
    const imgs = auction?.item?.images || [];
    return imgs.map((x) => x?.image_url).filter(Boolean);
  }, [auction]);

  const primaryImageUrl = useMemo(() => {
    const imgs = auction?.item?.images || [];
    const primary = imgs.find((x) => x?.is_primary || x?.primary);
    return primary?.image_url || imgs?.[0]?.image_url || '';
  }, [auction]);

  // Init selected image once data loaded
  useEffect(() => {
    if (!auction) return;
    const initial = selectedImage || primaryImageUrl || images?.[0] || '';
    if (initial && initial !== selectedImage) {
      setSelectedImage(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auction, primaryImageUrl, images]);

  const selectedIndex = useMemo(() => {
    const idx = images.findIndex((u) => u === selectedImage);
    return idx >= 0 ? idx : 0;
  }, [images, selectedImage]);

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

  // ESC + Arrow keys in modal
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

  const isPending = String(auction?.status || '').toUpperCase() === 'PENDING';

  const handleStartAuction = () => {
    if (!auctionId || !isPending || actionLoading) return;

    setConfirmState({
      open: true,
      type: 'start',
      loading: false,
    });
  };

  const handleCancelAuction = () => {
    if (!auctionId || !isPending || actionLoading) return;

    setConfirmState({
      open: true,
      type: 'cancel',
      loading: false,
    });
  };

  const getVietnameseStatus = (status) => {
    const map = {
      CREATED: 'Đã tạo',
      PENDING: 'Sắp diễn ra',
      ONGOING: 'Đang diễn ra',
      COMPLETED: 'Đã hoàn thành',
      CANCELLED: 'Đã huỷ',
    };

    return map[String(status || '').toUpperCase()] || status;
  };

  const handleConfirmAction = async () => {
    try {
      setConfirmState((prev) => ({ ...prev, loading: true }));

      if (confirmState.type === 'start') {
        await auctionApi.startAuction(auctionId);
      } else if (confirmState.type === 'cancel') {
        await auctionApi.cancelAuction(auctionId);
      }

      await fetchDetail();

      setConfirmState({
        open: false,
        type: null,
        loading: false,
      });
    } catch (e) {
      setConfirmState((prev) => ({ ...prev, loading: false }));
    }
  };

  const serverTimeVN = useMemo(() => null, []);

  return (
    <div className="bg-slate-100 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/seller/auctions"
              className="inline-flex items-center gap-2 px-4 py-0.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50"
              title="Quay lại"
            >
              <span className="text-lg">←</span>
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {auction?.title || 'Chi tiết phiên đấu giá'}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <StatusBadge status={auction?.status} />
                <span className="text-sm text-slate-500">
                  Auction ID:{' '}
                  <span className="font-mono">{auction?.id || auctionId}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartAuction}
              disabled={!isPending || actionLoading || loading}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition
                ${
                  !isPending || actionLoading || loading
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                }`}
              title={
                isPending ? 'Bắt đầu phiên đấu giá' : 'Chỉ thao tác khi PENDING'
              }
            >
              {actionLoading ? 'Đang xử lý...' : 'Bắt đầu'}
            </button>

            <button
              onClick={handleCancelAuction}
              disabled={!isPending || actionLoading || loading}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition
                ${
                  !isPending || actionLoading || loading
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                }`}
              title={
                isPending ? 'Huỷ phiên đấu giá' : 'Chỉ thao tác khi PENDING'
              }
            >
              {actionLoading ? 'Đang xử lý...' : 'Huỷ'}
            </button>

            {serverTimeVN ? (
              <div className="text-sm text-slate-500 hidden md:block">
                Server time:{' '}
                <span className="font-semibold">{serverTimeVN}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="px-6 pt-5">
            <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {TABS.map((t) => {
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200 mt-5" />

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-64 bg-slate-200 rounded-2xl mt-6" />
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4">
                <div className="font-semibold mb-1">Có lỗi xảy ra</div>
                <div className="text-sm">{error}</div>
              </div>
            ) : !auction ? (
              <div className="text-slate-600">
                Không tìm thấy phiên đấu giá.
              </div>
            ) : (
              <>
                {activeTab === 'detail' && (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left: Gallery */}
                    <div className="lg:col-span-2">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                        {selectedImage ? (
                          <div className="relative">
                            <img
                              src={selectedImage}
                              alt="Auction item"
                              className="w-full h-80 object-contain bg-black cursor-zoom-in"
                              loading="lazy"
                              onDoubleClick={() =>
                                openModalByUrl(selectedImage)
                              }
                              title=".."
                              draggable="false"
                            />

                            <div className="absolute bottom-3 left-3 right-3">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs text-white/90 bg-black/40 px-3 py-1 rounded-full">
                                  {images.length
                                    ? `${selectedIndex + 1}/${images.length}`
                                    : '0/0'}{' '}
                                </span>

                                {images.length > 1 ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const prev =
                                          (selectedIndex - 1 + images.length) %
                                          images.length;
                                        setSelectedImage(images[prev]);
                                      }}
                                      className="bg-white/90 hover:bg-white text-slate-800 text-sm font-semibold px-3 py-1 rounded-full"
                                      title="Ảnh trước"
                                    >
                                      ←
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next =
                                          (selectedIndex + 1) % images.length;
                                        setSelectedImage(images[next]);
                                      }}
                                      className="bg-white/90 hover:bg-white text-slate-800 text-sm font-semibold px-3 py-1 rounded-full"
                                      title="Ảnh tiếp"
                                    >
                                      →
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-80 flex items-center justify-center text-slate-400">
                            Không có ảnh
                          </div>
                        )}
                      </div>

                      {images.length > 1 ? (
                        <div className="mt-3 grid grid-cols-6 sm:grid-cols-7 gap-2">
                          {images.slice(0, 14).map((url, idx) => {
                            const active = url === selectedImage;
                            return (
                              <button
                                key={`${url}-${idx}`}
                                type="button"
                                className={`relative rounded-xl overflow-hidden border transition ${
                                  active
                                    ? 'border-slate-900 ring-2 ring-slate-900/20'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                                onClick={() => setSelectedImage(url)}
                                onDoubleClick={() => openModalByUrl(url)}
                                title="Click để xem • Double click để phóng to"
                              >
                                <img
                                  src={url}
                                  alt={`thumb-${idx + 1}`}
                                  className="w-full h-14 object-cover bg-slate-100"
                                  loading="lazy"
                                  draggable="false"
                                />
                                {active ? (
                                  <span className="absolute top-1 left-1 text-[10px] font-semibold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                                    Đang xem
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}

                          {images.length > 14 ? (
                            <div className="h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-600">
                              +{images.length - 14}
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {images.length ? (
                        <div className="mt-3 text-xs text-slate-500"></div>
                      ) : null}
                    </div>

                    {/* Right: Detail */}
                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                          label="Sản phẩm"
                          value={auction?.item?.item_name || '-'}
                        />
                        <InfoCard
                          label="Danh mục"
                          value={auction?.item?.category_name || '-'}
                        />
                        <InfoCard
                          label="Thương hiệu"
                          value={auction?.item?.brand || '-'}
                        />
                        <InfoCard
                          label="Tình trạng"
                          value={auction?.item?.condition || '-'}
                        />

                        <InfoCard
                          label="Thời lượng"
                          value={formatDuration(auction?.duration_minutes)}
                        />
                        <InfoCard
                          label="Bắt đầu lúc"
                          value={formatDateTimeVN(auction?.start_at)}
                        />

                        <InfoCard
                          label="Giá khởi điểm"
                          value={formatVND(auction?.start_price)}
                        />
                        <InfoCard
                          label="Giá hiện tại"
                          value={formatVND(auction?.current_price)}
                        />

                        <InfoCard
                          label="Bước giá"
                          value={formatVND(auction?.step_price)}
                        />
                        <InfoCard
                          label="Người bán (seller_id)"
                          value={
                            <span className="font-mono text-xs break-all">
                              {auction?.seller_id || '-'}
                            </span>
                          }
                        />
                      </div>

                      {/* Attributes */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-900">
                            Thông tin chi tiết
                          </h3>
                        </div>

                        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                          {Object.keys(auction?.item?.attributes || {})
                            .length === 0 ? (
                            <div className="text-slate-500 text-sm">
                              Sản phẩm không cung cấp chi tiết thông tin
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {Object.entries(auction.item.attributes).map(
                                ([k, v]) => (
                                  <div
                                    key={k}
                                    className="bg-white border border-slate-200 rounded-2xl p-3"
                                  >
                                    <div className="text-xs text-slate-500 font-semibold">
                                      {k}
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900 wrap-break-word">
                                      {String(v)}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'participants' && (
                  <AuctionParticipantsTab auctionId={auctionId} />
                )}

                {activeTab === 'abnormal' && (
                  <EmptyTab
                    title="Hoạt động bất thường"
                    desc="Tab này tạm thời chưa có dữ liệu."
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {confirmState.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900">
              {confirmState.type === 'start'
                ? 'Xác nhận bắt đầu phiên đấu giá'
                : 'Xác nhận huỷ phiên đấu giá'}
            </h3>

            <p className="mt-3 text-sm text-slate-600">
              {confirmState.type === 'start'
                ? 'Bạn chắc chắn muốn bắt đầu phiên đấu giá này?'
                : 'Bạn chắc chắn muốn huỷ phiên đấu giá này? Hành động này không thể hoàn tác.'}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setConfirmState({ open: false, type: null, loading: false })
                }
                disabled={confirmState.loading}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Huỷ
              </button>

              <button
                onClick={handleConfirmAction}
                disabled={confirmState.loading}
                className={`px-4 py-2 rounded-xl text-white font-semibold transition ${
                  confirmState.type === 'start'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmState.loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Image Modal */}
      {imageModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-6xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3">
              <div className="text-xs text-white/90 bg-black/40 px-3 py-1 rounded-full">
                {images.length ? `${modalIndex + 1}/${images.length}` : '0/0'} •
                ←/→ để chuyển • ESC để đóng
              </div>

              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-slate-200
                           flex items-center justify-center text-slate-800 font-bold"
                aria-label="Close"
                title="Đóng"
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white
                             text-slate-800 font-bold w-10 h-10 rounded-full flex items-center justify-center"
                  title="Ảnh trước"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white
                             text-slate-800 font-bold w-10 h-10 rounded-full flex items-center justify-center"
                  title="Ảnh tiếp"
                >
                  →
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}

function EmptyTab({ title, desc }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
      <div className="text-lg font-bold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{desc}</div>
      <div className="mt-6 text-xs text-slate-500">
        {/* (Bạn chỉ cần giữ UI tab trước, sau này nối API là xong.) */}
      </div>
    </div>
  );
}
