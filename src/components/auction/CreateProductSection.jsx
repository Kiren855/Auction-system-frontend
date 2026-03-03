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
    const res = await auctionApi.getAllCategories();
    setCategories(res.data.result);
  };

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);

    const attributeMap = {};
    updated.forEach((attr) => {
      if (attr.key) attributeMap[attr.key] = attr.value;
    });

    setProductData({
      ...productData,
      attributes: attributeMap,
    });
  };

  const addAttribute = () =>
    setAttributes([...attributes, { key: '', value: '' }]);

  const removeAttribute = (index) => {
    const updated = attributes.filter((_, i) => i !== index);
    setAttributes(updated);

    const attributeMap = {};
    updated.forEach((attr) => {
      if (attr.key) attributeMap[attr.key] = attr.value;
    });

    setProductData({
      ...productData,
      attributes: attributeMap,
    });
  };

  // ===== Images =====
  const images = productData.images || [];

  const previews = useMemo(() => {
    return images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [images]);

  useEffect(() => {
    // cleanup object URLs
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const handleSelectImages = (e) => {
    setImageError('');
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // optional: validate image mime
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

    // reset input để chọn lại cùng 1 file vẫn trigger onChange
    e.target.value = '';
  };

  const removeImageAt = (index) => {
    const next = images.filter((_, i) => i !== index);
    setProductData({ ...productData, images: next });
    setImageError('');
  };
  // ==================

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Tên sản phẩm</label>
        <input
          type="text"
          value={productData.itemName || ''}
          onChange={(e) =>
            setProductData({ ...productData, itemName: e.target.value })
          }
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">Danh mục</label>
        <select
          value={productData.categoryId || ''}
          onChange={(e) => {
            const selectedId = e.target.value;

            const selectedCategory = categories.find(
              (cat) => cat.id === selectedId,
            );

            setProductData({
              ...productData,
              categoryId: selectedId,
              categoryName: selectedCategory?.name || '',
            });
          }}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium mb-2">Thương hiệu</label>
        <input
          type="text"
          value={productData.brand || ''}
          onChange={(e) =>
            setProductData({ ...productData, brand: e.target.value })
          }
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium mb-2">Tình trạng</label>
        <select
          value={productData.condition || ''}
          onChange={(e) =>
            setProductData({ ...productData, condition: e.target.value })
          }
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="">-- Chọn tình trạng --</option>
          <option value="NEW">Hàng mới</option>
          <option value="USED">Hàng đã qua sử dụng</option>
        </select>
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Hình ảnh sản phẩm</label>
          <div className="text-xs text-gray-500">
            {images.length}/{MAX_IMAGES}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm cursor-pointer hover:shadow-sm
              ${images.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            PNG/JPG/WebP • tối đa {MAX_IMAGES} ảnh
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
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition
                    bg-white/90 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-800 hover:bg-white"
                >
                  Xoá
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attributes dynamic */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium">Thuộc tính sản phẩm</label>
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
            <div key={index} className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Tên thuộc tính (vd: Màu)"
                value={attr.key}
                onChange={(e) =>
                  handleAttributeChange(index, 'key', e.target.value)
                }
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Giá trị (vd: Vàng)"
                value={attr.value}
                onChange={(e) =>
                  handleAttributeChange(index, 'value', e.target.value)
                }
                className="flex-1 border rounded-lg px-3 py-2"
              />

              {attributes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="text-red-500 text-sm"
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
