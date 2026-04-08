import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import { auctionApi } from '../../api/auctionApi';
import Pagination from '../../components/common/Pagination';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Xoá',
  loading,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            className={cn(
              'rounded-xl px-4 py-2 text-white',
              loading
                ? 'cursor-not-allowed bg-rose-400'
                : 'bg-rose-600 hover:bg-rose-700',
            )}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xoá...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = Math.max(Number(searchParams.get('page') || 1) - 1, 0);
  const initialKeyword = searchParams.get('keyword') || '';

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState(null);

  const [keywordInput, setKeywordInput] = useState(initialKeyword);
  const [keyword, setKeyword] = useState(initialKeyword);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const params = {};

    if (page > 0) params.page = String(page + 1);
    if (keyword) params.keyword = keyword;

    setSearchParams(params, { replace: true });
  }, [page, keyword, setSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(keywordInput.trim());
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [keywordInput]);

  const fetchData = async ({ currentPage = page, currentSize = size } = {}) => {
    try {
      setLoading(true);
      setError('');

      const res = await auctionApi.getAllProductPage(currentPage, currentSize);
      setData(res?.data?.result || null);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const content = data?.content || [];

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return content;

    return content.filter((item) => {
      const itemName = item?.item_name || item?.itemName || '';
      const brand = item?.brand || '';
      const categoryName = item?.category_name || item?.categoryName || '';

      return (
        itemName.toLowerCase().includes(q) ||
        brand.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q)
      );
    });
  }, [content, keyword]);

  const totalPages = Number(data?.totalPages ?? 0);
  const totalElements = Number(data?.totalElements ?? 0);

  const handlePageChange = (nextPage) => {
    if (nextPage < 0 || nextPage >= totalPages) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleResetFilters = () => {
    setKeywordInput('');
    setKeyword('');
    setPage(0);
  };

  const openDelete = (item) => {
    setSelected(item);
    setConfirmOpen(true);
  };

  const onDelete = async () => {
    if (!selected?.id) return;

    try {
      setDeleting(true);
      await auctionApi.deleteProduct(selected.id);

      setConfirmOpen(false);
      setSelected(null);

      const remaining = (data?.content?.length || 0) - 1;

      if (remaining <= 0 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        await fetchData();
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 transition-all focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
                <Search size={16} className="shrink-0 text-slate-400" />
                <input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Tìm theo tên sản phẩm, brand, danh mục..."
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          {error && (
            <div className="border-b border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          {!loading && filtered.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-lg font-semibold text-slate-900">
                Chưa có sản phẩm
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {keyword
                  ? 'Không tìm thấy sản phẩm phù hợp.'
                  : 'Bạn chưa có sản phẩm nào'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                      Tên sản phẩm
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                      Brand
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                      Danh mục
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-white">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => {
                    const itemName = item?.item_name || item?.itemName || '--';
                    const brand = item?.brand || '--';
                    const categoryName =
                      item?.category_name || item?.categoryName || '--';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {itemName}
                          </div>
                          <div className="mt-1 text-xs text-slate-500 lg:hidden">
                            {brand} · {categoryName}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-700">{brand}</td>

                        <td className="px-5 py-4 text-slate-700">
                          {categoryName}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/seller/products/${item.id}`}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
                            >
                              Xem
                            </Link>
                            <button
                              onClick={() => openDelete(item)}
                              className="rounded-xl border border-rose-200 px-3 py-2 text-rose-700 hover:bg-rose-50"
                            >
                              Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-5 pb-5">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={handlePageChange}
              className="mt-5"
            />
          </div>
        </div>

        <ConfirmModal
          open={confirmOpen}
          title="Xoá sản phẩm?"
          description={
            selected
              ? `Bạn chắc chắn muốn xoá "${
                  selected.item_name || selected.itemName
                }"? Hành động này sẽ ẩn sản phẩm khỏi danh sách.`
              : ''
          }
          loading={deleting}
          onClose={() => !deleting && setConfirmOpen(false)}
          onConfirm={onDelete}
          confirmText="Xoá"
        />
      </div>
    </div>
  );
}
