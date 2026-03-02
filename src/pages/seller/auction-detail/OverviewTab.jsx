import React, { useState, useEffect } from 'react';
import {
  Tag,
  ShieldCheck,
  Box,
  Clock,
  Gavel,
  DollarSign,
  Calendar,
} from 'lucide-react';

const OverviewTab = ({ data }) => {
  // 1. Khởi tạo state ảnh trống để tránh lỗi undefined ban đầu
  const [mainImage, setMainImage] = useState('');

  // 2. Sử dụng useEffect để cập nhật ảnh khi data thay đổi (quan trọng khi chuyển ID đấu giá)
  useEffect(() => {
    if (data?.item?.images?.length > 0) {
      const primary = data.item.images.find(
        (img) => img.primary || img.is_primary
      );
      setMainImage(primary ? primary.image_url : data.item.images[0].image_url);
    }
  }, [data]);

  // 3. Kiểm tra an toàn: Nếu không có data.item, hiện thông báo thay vì crash
  if (!data?.item) {
    return (
      <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-500">
        Product information is not available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* LEFT COLUMN: IMAGES */}
      <div className="lg:col-span-5 space-y-4">
        <div className="aspect-square rounded-4xl overflow-hidden border border-slate-100 bg-white shadow-sm flex items-center justify-center">
          {mainImage ? (
            <img
              src={mainImage}
              alt={data.item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
              No Image
            </div>
          )}
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-3">
          {data.item.images?.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setMainImage(img.image_url)}
              className={`aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                mainImage === img.image_url
                  ? 'border-amber-500 shadow-md scale-95'
                  : 'border-transparent hover:border-slate-200'
              }`}
            >
              <img
                src={img.image_url}
                className="w-full h-full object-cover"
                alt={`Thumbnail ${idx}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: INFO */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg tracking-widest ${
                  data.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {data.status}
              </span>
              <span className="text-slate-400 text-xs font-medium uppercase">
                ID: {data.id?.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">
              {data.item.title}
            </h1>
          </div>

          {/* Attributes */}
          <div className="flex flex-wrap gap-3 pb-6 border-b border-slate-50">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600">
              <Tag size={16} className="text-amber-500" />{' '}
              {data.item.category_name || 'Uncategorized'}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600">
              <ShieldCheck size={16} className="text-blue-500" />{' '}
              {data.item.condition}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600">
              <Box size={16} className="text-emerald-500" /> {data.item.brand}
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900 rounded-3xl text-white">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Gavel size={12} /> Current Price
              </p>
              <p className="text-2xl font-black">
                ${data.current_price?.toLocaleString()}
              </p>
            </div>
            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                <DollarSign size={12} /> Bid Step
              </p>
              <p className="text-2xl font-black text-slate-900">
                +${data.step_price?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Time & Dates */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Clock className="text-slate-900" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Time Remaining
                </p>
                <p className="text-lg font-black text-slate-900">
                  {data.secondsRemaining > 0
                    ? `${Math.floor(data.secondsRemaining / 86400)}d : ${Math.floor((data.secondsRemaining % 86400) / 3600)}h : ${Math.floor((data.secondsRemaining % 3600) / 60)}m`
                    : 'Auction Ended'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <Calendar size={12} /> Starts at
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {data.start_at
                    ? new Date(data.start_at).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <Calendar size={12} /> Ends at
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {data.end_at ? new Date(data.end_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 font-black rounded-2xl hover:bg-slate-50 active:scale-95 transition-all">
            EDIT AUCTION
          </button>
          <button className="flex-1 py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 active:scale-95 transition-all">
            CANCEL AUCTION
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
