import { useEffect, useMemo, useState } from 'react';
import { auctionApi } from '../../api/auctionApi';

const MAX_IMAGES = 9;

export default function CreateProductSection({ productData, setProductData }) {
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([{ key: '', value: '' }]);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await auctionApi.getAllCategories();
      setCategories(res.data.result || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error);
      setCategories([]);
    }
  };

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);

    const attributeMap = {};
    updated.forEach((attr) => {
      const key = String(attr.key || '').trim();
      const val = String(attr.value || '').trim();
      if (key) {
        attributeMap[key] = val;
      }
    });

    setProductData({
      ...productData,
      attributes: attributeMap,
    });
  };

  const addAttribute = () => {
    setAttributes([...attributes, { key: '', value: '' }]);
  };

  const removeAttribute = (index) => {
    const updated = attributes.filter((_, i) => i !== index);
    setAttributes(updated);

    const attributeMap = {};
    updated.forEach((attr) => {
      const key = String(attr.key || '').trim();
      const val = String(attr.value || '').trim();
      if (key) {
        attributeMap[key] = val;
      }
    });

    setProductData({
      ...productData,
      attributes: attributeMap,
    });
  };

  const images = productData.images || [];

  const previews = useMemo(() => {
    return images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [images]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const handleSelectImages = (e) => {
    setImageError('');
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const nonImages = files.filter((f) => !f.type?.startsWith('image/'));
    if (nonImages.length) {
      setImageError('Chỉ cho phép upload file hình ảnh.');
      e.target.value = '';
      return;
    }

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setImageError(`Bạn chỉ có thể upload tối đa ${MAX_IMAGES} hình.`);
      e.target.value = '';
      return;
    }

    const toAdd = files.slice(0, remaining);

    if (files.length > remaining) {
      setImageError(
        `Chỉ lấy ${remaining} hình để đủ tối đa ${MAX_IMAGES} hình.`,
      );
    }

    setProductData({
      ...productData,
      images: [...images, ...toAdd],
    });

    e.target.value = '';
  };

  const removeImageAt = (index) => {
    const next = images.filter((_, i) => i !== index);
    setProductData({
      ...productData,
      images: next,
    });
    setImageError('');
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
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
      {/* Tên sản phẩm */}
      <div>
        {requiredLabel('Tên sản phẩm')}
        <input
          type="text"
          value={productData.itemName || ''}
          onChange={(e) =>
            setProductData({ ...productData, itemName: e.target.value })
          }
          placeholder="Nhập tên sản phẩm"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* Danh mục + Tình trạng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {requiredLabel('Danh mục')}
          <select
            value={productData.categoryId || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedCategory = categories.find(
                (cat) => String(cat.id) === String(selectedId),
              );

              setProductData({
                ...productData,
                categoryId: selectedId,
                categoryName: selectedCategory?.name || '',
              });
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          {requiredLabel('Tình trạng')}
          <select
            value={productData.condition || ''}
            onChange={(e) =>
              setProductData({ ...productData, condition: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">-- Chọn tình trạng --</option>
            <option value="NEW">Hàng mới</option>
            <option value="USED">Hàng đã qua sử dụng</option>
          </select>
        </div>
      </div>

      {/* Brand */}
      <div>
        {requiredLabel('Thương hiệu')}
        <input
          type="text"
          value={productData.brand || ''}
          onChange={(e) =>
            setProductData({ ...productData, brand: e.target.value })
          }
          placeholder="Nhập thương hiệu"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* Description */}
      <div>
        {optionalLabel('Mô tả sản phẩm')}
        <textarea
          rows={5}
          value={productData.description || ''}
          onChange={(e) =>
            setProductData({ ...productData, description: e.target.value })
          }
          placeholder="Nhập mô tả chi tiết về sản phẩm..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">
            Hình ảnh sản phẩm <span className="text-red-500">*</span>
          </label>
          <div className="text-xs text-gray-500">
            {images.length}/{MAX_IMAGES}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm hover:shadow-sm ${
              images.length >= MAX_IMAGES
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            <span>📷</span>
            <span>Chọn ảnh</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={images.length >= MAX_IMAGES}
              onChange={handleSelectImages}
              className="hidden"
            />
          </label>

          <p className="text-xs text-gray-500">
            PNG/JPG/WebP • tối đa {MAX_IMAGES} ảnh • tối thiểu 1 ảnh
          </p>
        </div>

        {imageError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {imageError}
          </div>
        )}

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previews.map((p, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={p.url}
                  alt={`preview-${idx}`}
                  className="h-28 w-full object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImageAt(idx)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-white/90 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-800 hover:bg-white"
                >
                  Xoá
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attributes */}
      <div>
        <div className="flex justify-between items-center mb-3">
          {optionalLabel('Thuộc tính sản phẩm')}
          <button
            type="button"
            onClick={addAttribute}
            className="text-sm text-blue-600 hover:underline"
          >
            + Thêm thuộc tính
          </button>
        </div>

        <div className="space-y-3">
          {attributes.map((attr, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-3 md:items-center"
            >
              <input
                type="text"
                placeholder="Tên thuộc tính (vd: Màu)"
                value={attr.key}
                onChange={(e) =>
                  handleAttributeChange(index, 'key', e.target.value)
                }
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <input
                type="text"
                placeholder="Giá trị (vd: Vàng)"
                value={attr.value}
                onChange={(e) =>
                  handleAttributeChange(index, 'value', e.target.value)
                }
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />

              {attributes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="shrink-0 text-red-500 text-sm px-2 py-2"
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
