import { useMemo, useState } from 'react';

const mockAuction = {
  id: '5bba76af-4ec1-41b9-b262-fc5266cc1267',
  title: 'Đấu giá iPhone 15 Pro Max 256GB',
  status: 'ONGOING',
  itemName: 'iPhone 15 Pro Max 256GB',
  sellerName: 'sunny_store',
  category: 'Điện thoại',
  brand: 'Apple',
  condition: 'Đã qua sử dụng - như mới',
  startPrice: 25000000,
  currentPrice: 28750000,
  stepPrice: 250000,
  minNextPrice: 29000000,
  participantCount: 18,
  highestBidderName: 'bidder***29',
  depositStatus: 'PAID',
  remaining: '00:18:24',
  description:
    'Máy ngoại hình đẹp, pin tốt, hoạt động ổn định, đầy đủ chức năng. Có kèm hộp và cáp sạc. Không lỗi Face ID, màn đẹp, khung viền ít trầy.',
  attributes: [
    { key: 'Màu sắc', value: 'Titan tự nhiên' },
    { key: 'Dung lượng', value: '256GB' },
    { key: 'Pin', value: '91%' },
    { key: 'Phiên bản', value: 'VN/A' },
    { key: 'Bảo hành', value: 'Hết bảo hành' },
    { key: 'Xuất xứ', value: 'Việt Nam' },
    { key: 'Phụ kiện', value: 'Hộp, cáp sạc' },
    { key: 'IMEI', value: 'Ẩn' },
  ],
  images: [null, null, null, null, null, null, null, null],
};

const mockBidHistory = [
  {
    id: 1,
    bidderName: 'bidder***29',
    amount: 28750000,
    createdAt: '20:11:22',
    isLeading: true,
  },
  {
    id: 2,
    bidderName: 'user***18',
    amount: 28500000,
    createdAt: '20:10:58',
  },
  {
    id: 3,
    bidderName: 'bidder***08',
    amount: 28250000,
    createdAt: '20:10:10',
  },
  {
    id: 4,
    bidderName: 'user***44',
    amount: 28000000,
    createdAt: '20:09:01',
  },
  {
    id: 5,
    bidderName: 'user***31',
    amount: 27750000,
    createdAt: '20:08:44',
  },
];

const mockMessages = [
  {
    id: 1,
    sender: 'system',
    type: 'SYSTEM',
    content: 'Phiên đấu giá đã bắt đầu.',
    time: '20:00',
  },
  {
    id: 2,
    sender: 'Minh',
    type: 'USER',
    content: 'Mọi người vào nhanh quá 😄',
    time: '20:03',
  },
  {
    id: 3,
    sender: 'system',
    type: 'SYSTEM',
    content: 'Một mức giá mới: 28.750.000đ',
    time: '20:11',
  },
  {
    id: 4,
    sender: 'Hùng',
    type: 'USER',
    content: 'Ai còn lên nữa không?',
    time: '20:12',
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ';
}

function getStatusStyle(status) {
  switch (String(status || '').toUpperCase()) {
    case 'PENDING':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'ONGOING':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'FINISHED':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-sky-50 text-sky-700 border-sky-200';
  }
}

function getVietnameseStatus(status) {
  const map = {
    CREATED: 'Đã tạo',
    PENDING: 'Sắp diễn ra',
    ONGOING: 'Đang diễn ra',
    FINISHED: 'Đã kết thúc',
    CANCELLED: 'Đã huỷ',
  };
  return map[String(status || '').toUpperCase()] || status;
}

function getTitleInitial(title) {
  const text = String(title || '').trim();
  return text ? text.charAt(0).toUpperCase() : '?';
}

const thumbnailPalette = [
  'bg-rose-100 text-rose-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
  'bg-amber-100 text-amber-700',
  'bg-yellow-100 text-yellow-700',
  'bg-lime-100 text-lime-700',
  'bg-green-100 text-green-700',
  'bg-emerald-100 text-emerald-700',
  'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700',
  'bg-sky-100 text-sky-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-purple-100 text-purple-700',
];

function getFallbackThumbnailClass(title) {
  const text = String(title || '');
  const hash = [...text].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return thumbnailPalette[hash % thumbnailPalette.length];
}

function InfoTooltip({ open, onToggle }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-5 h-5 rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 transition flex items-center justify-center text-xs font-semibold"
      >
        i
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-20 w-64 rounded-xl border border-slate-200 bg-white shadow-xl p-3">
          <div className="text-sm font-semibold text-slate-800 mb-1">
            Đấu giá tự động
          </div>
          <div className="space-y-1 text-xs text-slate-600 leading-5">
            <p>Hệ thống sẽ tự tăng giá giúp bạn theo bước giá.</p>
            <p>Không vượt quá mức tối đa bạn đã thiết lập.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BidderAuctionRoom() {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState(mockAuction.minNextPrice);
  const [autoBidAmount, setAutoBidAmount] = useState(
    mockAuction.currentPrice + 1000000,
  );
  const [chatMessage, setChatMessage] = useState('');
  const [showAutoBidInfo, setShowAutoBidInfo] = useState(false);
  const [showAllAttributes, setShowAllAttributes] = useState(false);

  const quickBidOptions = useMemo(
    () => [
      mockAuction.minNextPrice,
      mockAuction.minNextPrice + mockAuction.stepPrice,
      mockAuction.minNextPrice + mockAuction.stepPrice * 2,
    ],
    [],
  );

  const activeImage = mockAuction.images[activeImageIndex];
  const visibleAttributes = showAllAttributes
    ? mockAuction.attributes
    : mockAuction.attributes.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-350 mx-auto px-4 lg:px-6 py-4 lg:py-6">
        <div className="mb-4 lg:mb-6">
          <div className="text-xs lg:text-sm text-slate-500 mb-1">
            Đấu giá trực tiếp / Phòng đấu giá
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl lg:text-3xl font-bold text-slate-900 wrap-break-word">
                {mockAuction.title}
              </h1>

              <div className="flex items-center gap-2 lg:gap-3 mt-2 flex-wrap">
                <span
                  className={`px-2.5 py-1 text-xs lg:text-sm font-medium rounded-full border ${getStatusStyle(
                    mockAuction.status,
                  )}`}
                >
                  {getVietnameseStatus(mockAuction.status)}
                </span>

                <span className="text-xs lg:text-sm text-slate-500">
                  Người bán:{' '}
                  <span className="font-medium text-slate-700">
                    {mockAuction.sellerName}
                  </span>
                </span>

                <span className="text-xs lg:text-sm text-slate-500">
                  {mockAuction.participantCount} người tham gia
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm p-4 lg:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gallery */}
                <div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square">
                    {activeImage ? (
                      <img
                        src={activeImage}
                        alt={mockAuction.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center text-6xl font-bold ${getFallbackThumbnailClass(
                          mockAuction.title,
                        )}`}
                      >
                        {getTitleInitial(mockAuction.title)}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 xl:grid-cols-6 gap-2">
                    {mockAuction.images.slice(0, 9).map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`rounded-lg overflow-hidden border-2 aspect-square transition ${
                          activeImageIndex === index
                            ? 'border-slate-900'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={`thumb-${index}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center text-xl font-bold ${getFallbackThumbnailClass(
                              `${mockAuction.title}-${index}`,
                            )}`}
                          >
                            {getTitleInitial(mockAuction.title)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product summary */}
                <div className="flex flex-col">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-4">
                    <h2 className="text-lg lg:text-xl font-bold text-slate-900">
                      {mockAuction.itemName}
                    </h2>

                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      {mockAuction.depositStatus === 'PAID'
                        ? 'Đã đặt cọc'
                        : 'Cần đặt cọc'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <div className="text-xs text-slate-500">
                        Giá khởi điểm
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {formatCurrency(mockAuction.startPrice)}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <div className="text-xs text-slate-500">Bước giá</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {formatCurrency(mockAuction.stepPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 lg:p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-sm font-semibold text-slate-800">
                        Thuộc tính sản phẩm
                      </div>

                      {mockAuction.attributes.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setShowAllAttributes((prev) => !prev)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 transition"
                        >
                          {showAllAttributes ? 'Thu gọn' : 'Xem thêm'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {visibleAttributes.map((attr) => (
                        <div
                          key={attr.key}
                          className="flex items-start justify-between gap-4 py-1.5 border-b border-slate-200 last:border-0"
                        >
                          <span className="text-xs lg:text-sm text-slate-500 shrink-0">
                            {attr.key}
                          </span>
                          <span className="text-xs lg:text-sm font-medium text-slate-800 text-right wrap-break-word">
                            {attr.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs font-medium text-slate-800 mb-1">
                      Mô tả ngắn
                    </div>
                    <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">
                      {mockAuction.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CHAT - moved to main content */}
            <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-105">
              <div className="px-4 lg:px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-slate-900">
                    Chat phòng đấu giá
                  </h3>
                  <p className="text-xs lg:text-sm text-slate-500 mt-0.5">
                    Trao đổi cùng những người tham gia
                  </p>
                </div>

                <span className="text-[10px] lg:text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {mockAuction.participantCount} online
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-4 lg:px-5 py-4 space-y-3 bg-slate-50 min-h-65 max-h-105">
                {mockMessages.map((msg) =>
                  msg.type === 'SYSTEM' ? (
                    <div key={msg.id} className="flex justify-center">
                      <div className="max-w-[90%] text-center text-[11px] lg:text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex flex-col">
                      <div className="text-[11px] lg:text-xs text-slate-500 mb-1 px-1">
                        {msg.sender} • {msg.time}
                      </div>
                      <div className="self-start max-w-[80%] rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs lg:text-sm text-slate-700 shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="p-3 lg:p-4 border-t border-slate-200 bg-white">
                <div className="rounded-xl border border-slate-300 bg-slate-50 p-2">
                  <textarea
                    rows={3}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="w-full resize-none bg-transparent px-2 py-1.5 text-xs lg:text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <div className="flex items-center justify-between px-2 pt-2">
                    <div className="text-[10px] lg:text-xs text-slate-400">
                      Giữ lịch sự khi chat
                    </div>

                    <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs lg:text-sm font-medium hover:bg-slate-800 transition">
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] overflow-y-auto flex flex-col gap-6 scrollbar-hide">
            {/* Action panel */}
            <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm p-4 lg:p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500">
                    Thời gian còn lại
                  </div>
                  <div className="mt-0.5 text-2xl lg:text-3xl font-mono font-bold text-red-600 tracking-wide">
                    {mockAuction.remaining}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">Giá hiện tại</div>
                  <div className="mt-1 text-base lg:text-lg font-bold text-slate-900 break-all">
                    {formatCurrency(mockAuction.currentPrice)}
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <div className="text-xs text-amber-700">Giá tối thiểu</div>
                  <div className="mt-1 text-base lg:text-lg font-bold text-amber-800 break-all">
                    {formatCurrency(mockAuction.minNextPrice)}
                  </div>
                </div>
              </div>

              {/* Manual bid */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Đặt giá thủ công
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Bước giá {formatCurrency(mockAuction.stepPrice)}
                  </span>
                </div>

                <div className="mt-3">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Nhập số tiền"
                  />
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {quickBidOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBidAmount(value)}
                      className="px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-[11px] lg:text-xs text-slate-700 hover:bg-slate-100 transition"
                    >
                      {formatCurrency(value)}
                    </button>
                  ))}
                </div>

                <button className="mt-3 w-full rounded-xl bg-slate-900 text-white py-2.5 text-sm font-semibold hover:bg-slate-800 transition">
                  Đặt giá ngay
                </button>
              </div>

              {/* Auto bid */}
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:p-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Auto bid
                  </h3>
                  <InfoTooltip
                    open={showAutoBidInfo}
                    onToggle={() => setShowAutoBidInfo((prev) => !prev)}
                  />
                </div>

                <div className="mt-3">
                  <input
                    type="number"
                    value={autoBidAmount}
                    onChange={(e) => setAutoBidAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Mức tối đa"
                  />
                </div>

                <button className="mt-3 w-full rounded-xl border border-slate-300 bg-white text-slate-800 py-2.5 text-sm font-semibold hover:bg-slate-100 transition">
                  Bật auto bid
                </button>
              </div>
            </div>

            {/* Bid history - moved to sidebar */}
            <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 shadow-sm p-4 lg:p-5">
              <div className="mb-4">
                <h3 className="text-sm lg:text-base font-semibold text-slate-900">
                  Lịch sử đấu giá
                </h3>
                <p className="text-[11px] lg:text-xs text-slate-500 mt-1">
                  Cập nhật những mức giá gần nhất
                </p>
              </div>

              <div className="space-y-2 max-h-90 overflow-y-auto">
                {mockBidHistory.map((bid) => (
                  <div
                    key={bid.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-800 truncate">
                            {bid.bidderName}
                          </span>
                          {bid.isLeading && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Dẫn đầu
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-1">
                          {bid.createdAt}
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                        {formatCurrency(bid.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
