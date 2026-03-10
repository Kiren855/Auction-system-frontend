import React, { useEffect, useRef, useState } from 'react';

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ';
}

const mockBidHistory = [
  {
    id: 1,
    bidderName: 'bidder***29',
    amount: 28750000,
    createdAt: '20:11:22',
    isLeading: true,
  },
  { id: 2, bidderName: 'user***18', amount: 28500000, createdAt: '20:10:58' },
  { id: 3, bidderName: 'bidder***08', amount: 28250000, createdAt: '20:10:10' },
  { id: 4, bidderName: 'user***44', amount: 28000000, createdAt: '20:09:01' },
];

const mockMessages = [
  {
    id: 1,
    sender: 'system',
    type: 'SYSTEM',
    content: 'Phiên đấu giá đã bắt đầu.',
    time: '20:00',
  },
  {
    id: 2,
    sender: 'Minh',
    type: 'USER',
    content: 'Mọi người vào nhanh quá 😄',
    time: '20:03',
  },
  {
    id: 3,
    sender: 'system',
    type: 'SYSTEM',
    content: 'Một mức giá mới: 1.500.000đ',
    time: '20:11',
  },
];

export default function AuctionActivityPanel({ participantCount }) {
  const [activeTab, setActiveTab] = useState('HISTORY');
  const [chatMessage, setChatMessage] = useState('');
  const chatEndRef = useRef(null);
  const historyEndRef = useRef(null);

  //   useEffect(() => {
  //     if (activeTab === 'CHAT') {
  //       chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  //     } else {
  //       historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }, [activeTab]);

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm flex flex-col flex-1 min-h-100 overflow-hidden">
      <div className="flex border-b border-slate-200 px-2 pt-2 bg-slate-50 shrink-0">
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'HISTORY'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Lịch sử giá
        </button>

        <button
          onClick={() => setActiveTab('CHAT')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors flex justify-center items-center gap-2 ${
            activeTab === 'CHAT'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Phòng Chat
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-[10px] text-slate-600">
            {participantCount}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-4 relative">
        {activeTab === 'HISTORY' && (
          <div className="space-y-2">
            {mockBidHistory.map((bid) => (
              <div
                key={bid.id}
                className={`rounded-xl border px-3 py-3 transition-colors ${
                  bid.isLeading
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-100 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {bid.bidderName}
                      </span>

                      {bid.isLeading && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                          Dẫn đầu
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      {bid.createdAt}
                    </div>
                  </div>

                  <div className="text-sm font-bold text-slate-900">
                    {formatCurrency(bid.amount)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={historyEndRef} />
          </div>
        )}

        {activeTab === 'CHAT' && (
          <div className="space-y-3 pb-16">
            {mockMessages.map((msg) =>
              msg.type === 'SYSTEM' ? (
                <div key={msg.id} className="flex justify-center">
                  <div className="max-w-[90%] text-center text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-1.5">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex flex-col">
                  <div className="text-[11px] text-slate-400 mb-1 px-1">
                    {msg.sender} • {msg.time}
                  </div>
                  <div className="self-start max-w-[85%] rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    {msg.content}
                  </div>
                </div>
              ),
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {activeTab === 'CHAT' && (
        <div className="p-3 border-t border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 focus-within:border-slate-400 transition-colors">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setChatMessage('');
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400"
            />

            <button
              className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
              onClick={() => setChatMessage('')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
