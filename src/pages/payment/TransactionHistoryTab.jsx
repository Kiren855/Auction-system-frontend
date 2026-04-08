import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ReceiptText, Wallet } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import { paymentApi } from '../../api/paymentApi';
import {
  getDirectionBadgeClass,
  getTransactionDirectionLabel,
  getTransactionTypeLabel,
  getTypeBadgeClass,
} from '../../utils/walletTransactionMapper';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getResponseData = (response) =>
  response?.result || response?.data?.result;

export default function TransactionHistoryTab() {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState(null);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [error, setError] = useState('');

  const totalIn = useMemo(() => {
    return transactions
      .filter((item) => item.direction === 'IN')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [transactions]);

  const totalOut = useMemo(() => {
    return transactions
      .filter((item) => item.direction === 'OUT')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [transactions]);

  const fetchWallet = async () => {
    try {
      setWalletLoading(true);
      const response = await paymentApi.getMyWallet();
      const result = getResponseData(response);
      setWallet(result || null);
    } catch (err) {
      console.error('Lỗi tải ví:', err);
      setWallet(null);
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchTransactions = async (currentPage = page) => {
    try {
      setLoading(true);
      setError('');

      const response = await paymentApi.getMyWalletTransactions({
        page: currentPage,
        size,
      });

      const result = getResponseData(response);
      setTransactions(Array.isArray(result?.content) ? result.content : []);
      setTotalPages(result?.totalPages ?? 0);
      setTotalElements(result?.totalElements ?? 0);
    } catch (err) {
      console.error('Lỗi tải lịch sử giao dịch:', err);
      setTransactions([]);
      setTotalPages(0);
      setTotalElements(0);
      setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        {error ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto max-w-md rounded-md border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
              {error}
            </div>
          </div>
        ) : loading ? (
          <div className="px-6 py-16 text-center text-slate-500">
            Đang tải lịch sử giao dịch...
          </div>
        ) : transactions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8">
              <div className="text-lg font-semibold text-slate-900">
                Chưa có giao dịch nào
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Lịch sử giao dịch ví sẽ hiển thị tại đây khi phát sinh giao
                dịch.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-230">
                <thead className="bg-slate-900">
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                      Loại giao dịch
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white">
                      Dòng tiền
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-white">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-white">
                      Số dư trước
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-white">
                      Số dư sau
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => {
                    const isIn = transaction.direction === 'IN';

                    return (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-700">
                          {formatDateTime(transaction.createdAt)}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getTypeBadgeClass(
                              transaction.type,
                            )}`}
                          >
                            {getTransactionTypeLabel(transaction.type)}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${getDirectionBadgeClass(
                              transaction.direction,
                            )}`}
                          >
                            {isIn ? (
                              <ArrowDownLeft size={14} />
                            ) : (
                              <ArrowUpRight size={14} />
                            )}
                            {getTransactionDirectionLabel(
                              transaction.direction,
                            )}
                          </span>
                        </td>

                        <td
                          className={`px-6 py-4 text-right whitespace-nowrap text-sm font-bold ${
                            isIn ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIn ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-slate-700">
                          {formatCurrency(transaction.balanceBefore)}
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-semibold text-slate-900">
                          {formatCurrency(transaction.balanceAfter)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 pb-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
