import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageCircle,
  X,
  History,
  MessagesSquare,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import AuctionActivityPanel from './AuctionActivityPanel';

export default function FloatingAuctionActivityPanel({
  auction,
  bidHistory = [],
  messages = [],
  canChat = true,
  onSendMessage,
  onPlaceBid,
  loading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [unreadCount, setUnreadCount] = useState(0);

  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    if (!isOpen && messages.length > prevMessageCountRef.current) {
      setUnreadCount(
        (prev) => prev + (messages.length - prevMessageCountRef.current),
      );
    }

    prevMessageCountRef.current = messages.length;
  }, [messages.length, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const panelTitle = useMemo(() => {
    if (activeTab === 'history') return 'Lịch sử & hoạt động';
    return 'Chat phiên đấu giá';
  }, [activeTab]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <>
      {!isOpen ? (
        <button
          onClick={handleOpen}
          className="fixed bottom-5 right-5 z-50 flex h-14 items-center gap-3 rounded-full bg-slate-900 px-5 text-white shadow-2xl transition-all hover:scale-[1.02] hover:bg-slate-800"
        >
          <div className="relative">
            <MessageCircle size={20} />
            {unreadCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </div>
          <span className="text-sm font-bold">Lịch sử & Chat</span>
        </button>
      ) : (
        <div
          className={`fixed bottom-5 right-5 z-50 flex w-[calc(100vw-24px)] max-w-105 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[70vh] max-h-180'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {panelTitle}
              </p>
              <p className="truncate text-xs text-slate-500">
                {auction?.title || 'Phiên đấu giá'}
              </p>
            </div>

            <div className="ml-3 flex items-center gap-1">
              <button
                onClick={handleMinimize}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                title={isMinimized ? 'Mở rộng' : 'Thu gọn'}
              >
                {isMinimized ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>

              <button
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized ? (
            <>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-200 bg-slate-50 p-2">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-colors ${
                    activeTab === 'history'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <History size={16} />
                  Lịch sử bid
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MessagesSquare size={16} />
                  Chat
                </button>
              </div>

              <div className="min-h-0 flex-1">
                <AuctionActivityPanel
                  auction={auction}
                  bidHistory={bidHistory}
                  messages={messages}
                  activeTab={activeTab}
                  canChat={canChat}
                  onSendMessage={onSendMessage}
                  onPlaceBid={onPlaceBid}
                  loading={loading}
                  embeddedFloating
                />
              </div>
            </>
          ) : null}
        </div>
      )}
    </>
  );
}
