import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionApi } from '../../api/auctionApi';
import {
  Plus,
  Package,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  Search,
} from 'lucide-react';

const MyAuctions = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho phân trang dựa trên response của bạn
  const [pagination, setPagination] = useState({
    current: 0,
    total: 0,
    pageSize: 10,
  });

  // Hàm gọi API
  const loadAuctions = useCallback(
    async (page = 0) => {
      setLoading(true);
      try {
        const response = await auctionApi.getAllSellerAuctions(
          page,
          pagination.pageSize
        );

        if (response.data.code === '10000') {
          const { content, pageNumber, totalPages } = response.data.result;
          setAuctions(content);
          setPagination((prev) => ({
            ...prev,
            current: pageNumber,
            total: totalPages,
          }));
        }
      } catch (error) {
        console.error('Error fetching seller auctions:', error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize]
  );

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  // Helper: Render màu sắc cho Status
  const renderStatus = (status) => {
    const map = {
      PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
      ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      FINISHED: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-[11px] font-bold border ${map[status] || map.FINISHED}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Auctions
          </h1>
          <p className="text-slate-500 text-sm">
            You have {pagination.total || 0} total auction listings.
          </p>
        </div>

        <button
          onClick={() => navigate('/seller/create')}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
        >
          <Plus size={16} />
          New Auction
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Product Information
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Time start
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">
                  Manage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-6 py-8 bg-slate-50/30"></td>
                  </tr>
                ))
              ) : auctions.length > 0 ? (
                auctions.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {item.item.title}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            Ref: {item.id.split('-')[0].toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">{renderStatus(item.status)}</td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Calendar size={14} className="text-slate-300" />

                          {new Date(item.start_at)
                            .toLocaleString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                            .replace(',', ' •')}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                          <Clock size={14} />
                          Ends in: {Math.floor(
                            item.secondsRemaining / 3600
                          )}h {Math.floor((item.secondsRemaining % 3600) / 60)}m
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/seller/auctions/${item.id}`)
                          } // Điều hướng đến path đã tạo ở App.jsx
                          className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900 transition-all"
                          title="View Details"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <Search size={32} />
                      </div>
                      <p className="text-slate-400 font-medium">
                        No auctions found in your account.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.total > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-xs font-bold text-slate-400 uppercase">
              Page {pagination.current + 1} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadAuctions(pagination.current - 1)}
                disabled={pagination.current === 0}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => loadAuctions(pagination.current + 1)}
                disabled={pagination.current + 1 >= pagination.total}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAuctions;
