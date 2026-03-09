import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProductSection from '../../components/auction/CreateProductSection';
import { auctionApi } from '../../api/auctionApi';
import { useCreateAuction } from '../../context/CreateAuctionContext';

export default function CreateAuctionProductPage() {
  const navigate = useNavigate();

  const {
    mode,
    setMode,
    selectedProductId,
    setSelectedProductId,
    selectedProductName,
    setSelectedProductName,
    productData,
    setProductData,
  } = useCreateAuction();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState('');

  // const selectedProduct = useMemo(
  //   () => products.find((p) => p.id === selectedProductId),
  //   [products, selectedProductId],
  // );

  const fetchProducts = async () => {
    try {
      setProductsError('');
      setLoadingProducts(true);
      const res = await auctionApi.getAllProducts();
      setProducts(res?.data?.result ?? []);
    } catch (e) {
      setProducts([]);
      setProductsError(
        e?.response?.data?.message || 'Không thể tải danh sách sản phẩm.',
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (mode === 'existing') fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const canNext =
    mode === 'existing'
      ? Boolean(selectedProductId)
      : Boolean(
          productData.itemName &&
          productData.categoryId &&
          productData.brand &&
          productData.condition,
        );

  const handleNext = () => {
    if (!canNext) return;
    navigate('/seller/auctions/create/auction');
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Tạo phiên đấu giá mới
          </h2>

          <div className="border-t my-6"></div>

          <div className="mb-10">
            <h3 className="text-lg font-semibold mb-5">Chọn sản phẩm</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* EXISTING */}
              <div
                onClick={() => setMode('existing')}
                className={`relative cursor-pointer border rounded-xl p-6 transition-all duration-200
                  ${
                    mode === 'existing'
                      ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900/10 shadow-sm'
                      : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📦</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Sử dụng sản phẩm đã có
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Chọn từ danh sách sản phẩm bạn đã tạo trước đó
                    </p>
                  </div>
                </div>

                {mode === 'existing' && (
                  <div className="absolute top-4 right-4 text-gray-900 text-sm font-semibold">
                    ✓
                  </div>
                )}
              </div>

              {/* NEW */}
              <div
                onClick={() => setMode('new')}
                className={`relative cursor-pointer border rounded-xl p-6 transition-all duration-200
                  ${
                    mode === 'new'
                      ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900/10 shadow-sm'
                      : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">➕</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Tạo sản phẩm mới
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Nhập thông tin chi tiết cho sản phẩm mới
                    </p>
                  </div>
                </div>

                {mode === 'new' && (
                  <div className="absolute top-4 right-4 text-gray-900 text-sm font-semibold">
                    ✓
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conditional content */}
          {mode === 'new' && (
            <div className="animate-fadeIn">
              <CreateProductSection
                productData={productData}
                setProductData={setProductData}
              />
            </div>
          )}

          {mode === 'existing' && (
            <div className="animate-fadeIn">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Chọn sản phẩm đã có
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Chọn 1 sản phẩm để tạo phiên đấu giá
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchProducts}
                    disabled={loadingProducts}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border
                      ${
                        loadingProducts
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                  >
                    {loadingProducts ? 'Đang tải...' : 'Tải lại'}
                  </button>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sản phẩm
                  </label>

                  <div className="relative">
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        const id = e.target.value;

                        const product = products.find((p) => p.id === id);

                        setSelectedProductId(id);
                        setSelectedProductName(product?.itemName || '');
                      }}
                      disabled={loadingProducts || products.length === 0}
                      className={`w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-sm outline-none transition
                        ${
                          loadingProducts
                            ? 'border-gray-200 text-gray-400'
                            : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'
                        }
                        ${products.length === 0 ? 'cursor-not-allowed bg-gray-100' : ''}`}
                    >
                      <option value="">
                        {loadingProducts
                          ? 'Đang tải danh sách...'
                          : products.length === 0
                            ? 'Chưa có sản phẩm nào'
                            : '-- Chọn sản phẩm --'}
                      </option>

                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.itemName}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                      ▼
                    </div>
                  </div>

                  {productsError && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {productsError}
                    </div>
                  )}

                  {/* {selectedProductId && selectedProduct && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-4">
                      <div className="text-sm text-gray-500">Đã chọn</div>
                      <div className="mt-1 font-semibold text-gray-900">
                        {selectedProduct.title}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 break-all">
                        Sản phẩm: {selectedProduct.itemName}
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/seller/auctions')}
              className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:shadow-sm transition text-sm font-medium"
            >
              ← Quay lại
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition
                ${
                  canNext
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              Tiếp theo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
