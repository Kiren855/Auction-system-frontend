import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionApi } from '../../api/auctionApi'; // <-- đổi path theo project bạn
// import { toast } from 'react-hot-toast'; // nếu bạn có toast thì bật lên

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
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            className={cn(
              'px-4 py-2 rounded-xl text-white',
              loading
                ? 'bg-rose-400 cursor-not-allowed'
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
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState(null); // result object
  const [q, setQ] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState(null); // {id, itemName}

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await auctionApi.getAllProductPage(page, size);
      // res.data.result theo format bạn gửi
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
    const keyword = q.trim().toLowerCase();
    if (!keyword) return content;
    return content.filter((x) =>
      (x?.itemName || '').toLowerCase().includes(keyword),
    );
  }, [content, q]);

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const pageNumber = data?.pageNumber ?? page;

  const canPrev = pageNumber > 0;
  const canNext = totalPages ? pageNumber < totalPages - 1 : false;

  const openDelete = (item) => {
    setSelected(item);
    setConfirmOpen(true);
  };

  const onDelete = async () => {
    if (!selected?.id) return;

    try {
      setDeleting(true);
      await auctionApi.deleteProduct(selected.id);
      // toast?.success?.('Đã xoá sản phẩm');
      setConfirmOpen(false);
      setSelected(null);

      // Nếu xoá xong mà page hiện tại rỗng (trường hợp xoá item cuối trang) thì lùi page
      const remaining = (data?.content?.length || 0) - 1;
      if (remaining <= 0 && pageNumber > 0) {
        setPage((p) => p - 1);
      } else {
        fetchData();
      }
    } catch (e) {
      // toast?.error?.(e?.response?.data?.message || 'Xoá thất bại');
      setError(e?.response?.data?.message || e?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}

        {/* Toolbar */}
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Sản phẩm</h1>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo tên sản phẩm..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
                {q && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-slate-500 hover:text-slate-700"
                    onClick={() => setQ('')}
                    title="Xoá tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={size}
                onChange={(e) => {
                  setPage(0);
                  setSize(Number(e.target.value));
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 focus:outline-none"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>

              <button
                onClick={fetchData}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Làm mới
              </button>
            </div>
          </div>

          {/* meta */}
          <div className="mt-3 text-sm text-slate-600 flex flex-wrap gap-x-6 gap-y-1">
            <span>
              Tổng: <b className="text-slate-900">{totalElements}</b>
            </span>
            <span>
              Trang: <b className="text-slate-900">{(pageNumber ?? 0) + 1}</b> /{' '}
              <b className="text-slate-900">{Math.max(totalPages, 1)}</b>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Danh sách</h2>

            {loading && (
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                Đang tải...
              </div>
            )}
          </div>

          {error && (
            <div className="px-5 py-4 bg-rose-50 border-b border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {!loading && filtered.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-lg font-semibold text-slate-900">
                Chưa có sản phẩm
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {q
                  ? 'Không tìm thấy sản phẩm phù hợp.'
                  : 'Tạo sản phẩm mới để bắt đầu.'}
              </div>
              <div className="mt-4">
                <Link
                  to="/seller/products/new"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                  + Tạo sản phẩm
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left font-medium px-5 py-3">
                      Tên sản phẩm
                    </th>
                    <th className="text-left font-medium px-5 py-3 hidden md:table-cell">
                      ID
                    </th>
                    <th className="text-right font-medium px-5 py-3">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {item.itemName}
                        </div>
                        <div className="text-xs text-slate-500 md:hidden mt-1 break-all">
                          {item.id}
                        </div>
                      </td>

                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-slate-600">{item.id}</span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/seller/products/${item.id}`}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            Xem
                          </Link>
                          <button
                            onClick={() => openDelete(item)}
                            className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50"
                          >
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
            <button
              className={cn(
                'px-3 py-2 rounded-xl border',
                canPrev
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-100 text-slate-400 cursor-not-allowed',
              )}
              onClick={() => canPrev && setPage((p) => Math.max(0, p - 1))}
              disabled={!canPrev}
            >
              ← Trước
            </button>

            <div className="text-sm text-slate-600">
              Trang <b className="text-slate-900">{pageNumber + 1}</b> /{' '}
              <b className="text-slate-900">{Math.max(totalPages, 1)}</b>
            </div>

            <button
              className={cn(
                'px-3 py-2 rounded-xl border',
                canNext
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-100 text-slate-400 cursor-not-allowed',
              )}
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
            >
              Sau →
            </button>
          </div>
        </div>

        {/* Confirm delete */}
        <ConfirmModal
          open={confirmOpen}
          title="Xoá sản phẩm?"
          description={
            selected
              ? `Bạn chắc chắn muốn xoá "${selected.itemName}"? Hành động này sẽ ẩn sản phẩm khỏi danh sách.`
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
