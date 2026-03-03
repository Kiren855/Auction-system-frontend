import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionApi } from '../../api/auctionApi';
import { useCreateAuction } from '../../context/CreateAuctionContext';

export default function CreateAuctionAuctionPage() {
  const navigate = useNavigate();
  const { mode, selectedProductId, productData, auctionData, setAuctionData } =
    useCreateAuction();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const productSummaryTitle = useMemo(() => {
    if (mode === 'existing') return 'Sản phẩm đã chọn';
    return 'Sản phẩm mới';
  }, [mode]);

  const canSubmit = useMemo(() => {
    const okAuction =
      auctionData.title &&
      auctionData.startPrice &&
      auctionData.stepPrice &&
      auctionData.startAt &&
      auctionData.durationMinutes;

    const okProduct =
      mode === 'existing'
        ? Boolean(selectedProductId)
        : Boolean(productData.itemName && productData.categoryId);

    return okAuction && okProduct;
  }, [auctionData, mode, selectedProductId, productData]);

  const buildFormData = () => {
    const fd = new FormData();

    // itemId: chỉ gửi khi dùng existing
    if (mode === 'existing') {
      fd.append('itemId', selectedProductId);
    } else {
      // product fields chỉ khi tạo mới
      fd.append('itemName', productData.itemName || '');
      fd.append('categoryId', productData.categoryId || '');
      fd.append('brand', productData.brand || '');
      fd.append('condition', productData.condition || '');

      Object.entries(productData.attributes || {}).forEach(([k, v]) => {
        fd.append(`attributes[${k}]`, v ?? '');
      });

      (productData.images || []).forEach((file) => {
        fd.append('images', file); // List<MultipartFile> images
      });
    }

    fd.append('title', String(auctionData.title));
    fd.append('startPrice', String(auctionData.startPrice));
    fd.append('stepPrice', String(auctionData.stepPrice));

    // datetime-local -> ISO Instant
    const isoStart = new Date(auctionData.startAt).toISOString();
    fd.append('startAt', isoStart);

    fd.append('durationMinutes', String(auctionData.durationMinutes));

    return fd;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setError('');
      setSubmitting(true);

      const formData = buildFormData();
      await auctionApi.createAuction(formData);

      navigate('/seller/auctions');
    } catch (e) {
      setError(e?.response?.data?.message || 'Tạo phiên đấu giá thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Thông tin phiên đấu giá
          </h2>

          <div className="border-t my-6"></div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="text-sm text-gray-500">
                  {productSummaryTitle}
                </div>

                {mode === 'existing' ? (
                  <div className="mt-1">
                    <div className="font-semibold text-gray-900">
                      Sản phẩm:{' '}
                      <span className="font-mono">{selectedProductId}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      (Hệ thống sẽ dùng sản phẩm đã có để tạo phiên)
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <div className="font-semibold text-gray-900">
                      {productData.itemName || '—'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Ảnh: {(productData.images || []).length} file • Danh mục:{' '}
                      {productData.categoryName || '—'}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate('/seller/auctions/create/product')}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:shadow-sm transition text-sm font-medium"
              >
                ← Sửa sản phẩm
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* auction title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Tiêu đề phiên đấu giá
              </label>
              <input
                type="text"
                value={auctionData.title || ''}
                onChange={(e) =>
                  setAuctionData({ ...auctionData, title: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="VD: Đấu giá iPhone 14 Pro Max - bản 256GB"
              />
            </div>
            {/* startPrice */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Giá khởi điểm
              </label>
              <input
                type="number"
                min="0"
                value={auctionData.startPrice}
                onChange={(e) =>
                  setAuctionData({ ...auctionData, startPrice: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="VD: 100000"
              />
            </div>

            {/* stepPrice */}
            <div>
              <label className="block text-sm font-medium mb-2">Bước giá</label>
              <input
                type="number"
                min="0"
                value={auctionData.stepPrice}
                onChange={(e) =>
                  setAuctionData({ ...auctionData, stepPrice: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="VD: 5000"
              />
            </div>

            {/* startAt */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Thời gian bắt đầu
              </label>
              <input
                type="datetime-local"
                value={auctionData.startAt}
                onChange={(e) =>
                  setAuctionData({ ...auctionData, startAt: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <p className="text-xs text-gray-500 mt-2">
                Lưu ý: Hệ thống sẽ gửi lên dạng ISO Instant (UTC).
              </p>
            </div>

            {/* duration */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Thời lượng phiên (phút)
              </label>
              <input
                type="number"
                min="1"
                value={auctionData.durationMinutes}
                onChange={(e) =>
                  setAuctionData({
                    ...auctionData,
                    durationMinutes: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="VD: 60"
              />
              <p className="text-xs text-gray-500 mt-2">
                VD: 60 = 1 tiếng, 1440 = 1 ngày.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/seller/auctions/create/product')}
              className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:shadow-sm transition text-sm font-medium"
            >
              ← Quay lại
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition
                ${
                  !canSubmit || submitting
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
            >
              {submitting ? 'Đang tạo...' : 'Tạo phiên đấu giá'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
