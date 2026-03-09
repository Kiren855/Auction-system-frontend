import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionApi } from '../../api/auctionApi';
import { useCreateAuction } from '../../context/CreateAuctionContext';

export default function CreateAuctionAuctionPage() {
  const navigate = useNavigate();
  const {
    mode,
    selectedProductId,
    selectedProductName,
    productData,
    auctionData,
    setAuctionData,
  } = useCreateAuction();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const productSummaryTitle = useMemo(() => {
    if (mode === 'existing') return 'Sản phẩm đã chọn';
    return 'Sản phẩm mới';
  }, [mode]);

  const thumbnailPreview = useMemo(() => {
    if (!auctionData.thumbnail) return '';
    return URL.createObjectURL(auctionData.thumbnail);
  }, [auctionData.thumbnail]);

  const canSubmit = useMemo(() => {
    const startPrice = Number(auctionData.startPrice);
    const stepPrice = Number(auctionData.stepPrice);
    const durationMinutes = Number(auctionData.durationMinutes);

    const okAuction =
      String(auctionData.title || '').trim() &&
      auctionData.startAt &&
      Number.isFinite(startPrice) &&
      startPrice > 0 &&
      Number.isFinite(stepPrice) &&
      stepPrice > 0 &&
      Number.isFinite(durationMinutes) &&
      durationMinutes >= 20;

    const okProduct =
      mode === 'existing'
        ? Boolean(selectedProductId)
        : Boolean(productData.itemName && productData.categoryId);

    return okAuction && okProduct;
  }, [auctionData, mode, selectedProductId, productData]);

  const buildFormData = () => {
    const fd = new FormData();

    if (mode === 'existing') {
      fd.append('itemId', selectedProductId);
    } else {
      fd.append('itemName', productData.itemName || '');
      fd.append('categoryId', productData.categoryId || '');
      fd.append('brand', productData.brand || '');
      fd.append('condition', productData.condition || '');
      fd.append('description', productData.description || '');

      Object.entries(productData.attributes || {}).forEach(([k, v]) => {
        fd.append(`attributes[${k}]`, v ?? '');
      });

      (productData.images || []).forEach((file) => {
        fd.append('images', file);
      });
    }

    fd.append('title', String(auctionData.title || '').trim());
    fd.append('startPrice', String(auctionData.startPrice));
    fd.append('stepPrice', String(auctionData.stepPrice));

    const isoStart = new Date(auctionData.startAt).toISOString();
    fd.append('startAt', isoStart);

    fd.append('durationMinutes', String(auctionData.durationMinutes));

    if (auctionData.thumbnail) {
      fd.append('thumbnail', auctionData.thumbnail);
    }

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

  const handlePositiveNumberChange = (field, value) => {
    if (value === '') {
      setAuctionData({ ...auctionData, [field]: '' });
      return;
    }

    if (!/^\d*\.?\d*$/.test(value)) return;

    setAuctionData({
      ...auctionData,
      [field]: value,
    });
  };

  const handlePositiveNumberBlur = (field, minValue = 0) => {
    const rawValue = auctionData[field];

    if (rawValue === '' || rawValue === null || rawValue === undefined) return;

    let numericValue = Number(rawValue);

    if (!Number.isFinite(numericValue)) {
      numericValue = minValue;
    }

    if (numericValue < minValue) {
      numericValue = minValue;
    }

    setAuctionData({
      ...auctionData,
      [field]: String(numericValue),
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type?.startsWith('image/')) {
      setError('Thumbnail phải là file hình ảnh.');
      e.target.value = '';
      return;
    }

    setError('');
    setAuctionData({
      ...auctionData,
      thumbnail: file,
    });

    e.target.value = '';
  };

  const removeThumbnail = () => {
    setAuctionData({
      ...auctionData,
      thumbnail: null,
    });
  };

  const requiredLabel = (text) => (
    <label className="block text-sm font-medium mb-2">
      {text} <span className="text-red-500">*</span>
    </label>
  );

  const optionalLabel = (text) => (
    <label className="block text-sm font-medium mb-2">{text}</label>
  );

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
                      <span className="font-mono">{selectedProductName}</span>
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
              {requiredLabel('Tiêu đề phiên đấu giá')}
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

            {/* thumbnail */}
            <div className="md:col-span-2">
              {optionalLabel('Ảnh thumbnail')}
              <div className="flex items-center gap-3 flex-wrap">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm cursor-pointer hover:shadow-sm">
                  <span>🖼️</span>
                  <span>Chọn thumbnail</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>

                <p className="text-xs text-gray-500">
                  Ảnh đại diện cho phiên đấu giá, không bắt buộc
                </p>
              </div>

              {thumbnailPreview && (
                <div className="mt-4">
                  <div className="relative w-48 group">
                    <img
                      src={thumbnailPreview}
                      alt="thumbnail-preview"
                      className="h-32 w-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-white/90 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-800 hover:bg-white"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* startPrice */}
            <div>
              {requiredLabel('Giá khởi điểm')}
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={auctionData.startPrice || ''}
                onChange={(e) =>
                  handlePositiveNumberChange('startPrice', e.target.value)
                }
                onBlur={() => handlePositiveNumberBlur('startPrice', 1)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="VD: 100000"
              />
            </div>

            {/* stepPrice */}
            <div>
              {requiredLabel('Bước giá')}
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={auctionData.stepPrice || ''}
                onChange={(e) =>
                  handlePositiveNumberChange('stepPrice', e.target.value)
                }
                onBlur={() => handlePositiveNumberBlur('stepPrice', 1)}
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
                value={auctionData.startAt || ''}
                onChange={(e) =>
                  setAuctionData({ ...auctionData, startAt: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* duration */}
            <div>
              {requiredLabel('Thời lượng phiên (phút)')}
              <input
                type="number"
                min="20"
                step="1"
                inputMode="numeric"
                value={auctionData.durationMinutes || ''}
                onChange={(e) =>
                  handlePositiveNumberChange('durationMinutes', e.target.value)
                }
                onBlur={() => handlePositiveNumberBlur('durationMinutes', 20)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="VD: 60"
              />
              <p className="text-xs text-gray-500 mt-2">
                Tối thiểu 20 phút. VD: 60 = 1 tiếng, 1440 = 1 ngày.
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
