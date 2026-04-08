import React, { useMemo, useState } from 'react';

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
  'bg-emerald-100 text-emerald-700',
  'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700',
  'bg-sky-100 text-sky-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
];

function getFallbackThumbnailClass(title) {
  const text = String(title || '');
  const hash = [...text].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return thumbnailPalette[hash % thumbnailPalette.length];
}

export default function AuctionProductPanel({ auction }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAllAttributes, setShowAllAttributes] = useState(false);

  const activeImage = auction?.images?.[activeImageIndex];

  const visibleAttributes = useMemo(() => {
    if (showAllAttributes) return auction?.attributes || [];
    return (auction?.attributes || []).slice(0, 5);
  }, [auction?.attributes, showAllAttributes]);

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-4 lg:p-5">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-6">
        <div>
          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square shadow-inner">
            {activeImage ? (
              <img
                src={activeImage}
                alt={auction.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-7xl font-bold ${getFallbackThumbnailClass(
                  auction.title,
                )}`}
              >
                {getTitleInitial(auction.title)}
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            {(auction.images?.length
              ? auction.images
              : Array.from({ length: 5 })
            ).map((image, index) => (
              <button
                key={index}
                onClick={() => image && setActiveImageIndex(index)}
                className={`rounded-2xl overflow-hidden border-2 aspect-square transition-all ${
                  activeImageIndex === index && image
                    ? 'border-slate-900 shadow-sm'
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
                      `${auction.title}-${index}`,
                    )}`}
                  >
                    {getTitleInitial(auction.title)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
            <div>
              <h2 className="text-2xl lg:text-[32px] font-bold text-slate-900 leading-tight">
                {auction.itemName}
              </h2>

              <div className="flex items-center gap-2 flex-wrap mt-2">
                {auction.category && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {auction.category}
                  </span>
                )}

                {auction.brand && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {auction.brand}
                  </span>
                )}

                {auction.condition && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {auction.condition}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold text-slate-800">
                Thông tin chi tiết sản phẩm
              </div>

              {(auction.attributes || []).length > 5 && (
                <button
                  onClick={() => setShowAllAttributes((prev) => !prev)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {showAllAttributes ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}
            </div>

            <div className="space-y-1">
              {visibleAttributes.length > 0 ? (
                visibleAttributes.map((attr) => (
                  <div
                    key={attr.key}
                    className="flex justify-between gap-4 py-3 border-b border-slate-200 last:border-0"
                  >
                    <span className="text-sm text-slate-500">{attr.key}</span>
                    <span className="text-sm font-semibold text-slate-800 text-right">
                      {attr.value}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 py-2">
                  Chưa có thông tin thêm.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="text-sm font-semibold text-slate-800 mb-2">
              Mô tả sản phẩm
            </div>
            <p className="text-sm lg:text-[15px] text-slate-600 leading-7 whitespace-pre-line">
              {auction.description || 'Chưa có mô tả.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
