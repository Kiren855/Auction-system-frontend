import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionApi } from '../../../api/auctionApi';
import OverviewTab from './OverviewTab';
import {
  LayoutDashboard,
  Users,
  History,
  ArrowLeft,
  Loader2,
  ChevronRight,
} from 'lucide-react';

const AuctionDetail = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await auctionApi.getAuctionDetail(auctionId);
        // SỬA TẠI ĐÂY: Phải là res.data.result giống bản cũ của bạn
        if (res && res.data && res.data.result) {
          setAuctionData(res.data.result);
        }
      } catch (err) {
        console.error('Error fetching auction detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [auctionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
        <p className="font-bold text-sm tracking-tight">
          Loading auction details...
        </p>
      </div>
    );
  }

  // Nếu không có dữ liệu, hiện lỗi nhưng vẫn giữ Layout đẹp để nhấn nút Back
  if (!auctionData) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <p className="text-red-500 font-bold mb-4 text-lg">
          Auction not found!
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* HEADER GỌN GÀNG - Navigation & Tabs trên 1 hàng */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
        {/* Bên trái: Điều hướng */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Bên phải: Tabs mỏng gọn */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-fit border border-slate-200/50">
          {[
            {
              id: 'overview',
              label: 'Overview',
              icon: <LayoutDashboard size={14} />,
            },
            { id: 'users', label: 'Participants', icon: <Users size={14} /> },
            {
              id: 'history',
              label: 'Bid History',
              icon: <History size={14} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* HIỂN THỊ NỘI DUNG */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'overview' && <OverviewTab data={auctionData} />}

        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] p-16 border border-dashed border-slate-200 text-center">
            <Users className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold">
              Participants list coming soon...
            </p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-[2.5rem] p-16 border border-dashed border-slate-200 text-center">
            <History className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold">
              Bid history timeline coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionDetail;
