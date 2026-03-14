import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import {
  MessageCircle,
  Clock3,
  Send,
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  History,
  MessagesSquare,
} from 'lucide-react';
import { biddingApi } from '../../api/biddingApi';

const MAX_MESSAGE_LENGTH = 500;
const SEND_COOLDOWN_MS = 1500;

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ';
}

function formatTime(value) {
  if (!value) return '--:--:--';

  const date = new Date(value);

  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getChatStatusMeta(auctionStatus, isSocketConnected) {
  if (auctionStatus !== 'ONGOING') {
    return {
      label: 'Chat đang khóa',
      className: 'bg-slate-100 text-slate-600 border border-slate-200',
      icon: <WifiOff size={14} />,
    };
  }

  if (isSocketConnected) {
    return {
      label: 'Đang kết nối',
      className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      icon: <Wifi size={14} />,
    };
  }

  return {
    label: 'Đang kết nối lại...',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: <Loader2 size={14} className="animate-spin" />,
  };
}

export default function AuctionActivityPanel({
  participantCount,
  auctionId,
  auctionStatus,
  currentUserId,
}) {
  const [activeTab, setActiveTab] = useState('HISTORY');
  const [chatMessage, setChatMessage] = useState('');
  const [bidHistory, setBidHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [historyError, setHistoryError] = useState('');
  const [messagesError, setMessagesError] = useState('');
  const [sendError, setSendError] = useState('');

  const [unreadCount, setUnreadCount] = useState(0);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const chatEndRef = useRef(null);
  const historyEndRef = useRef(null);
  const stompClientRef = useRef(null);

  const canChat = auctionStatus === 'ONGOING';
  const trimmedMessage = chatMessage.trim();
  const remainingChars = MAX_MESSAGE_LENGTH - chatMessage.length;
  const isCooldownActive = Date.now() - lastSentAt < SEND_COOLDOWN_MS;

  const chatStatusMeta = useMemo(
    () => getChatStatusMeta(auctionStatus, isSocketConnected),
    [auctionStatus, isSocketConnected],
  );

  useEffect(() => {
    if (isOpen && activeTab === 'CHAT') {
      setUnreadCount(0);
    }
  }, [activeTab, isOpen]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'CHAT') return;

    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, activeTab, isOpen]);

  useEffect(() => {
    if (!auctionId) return;

    let isMounted = true;

    const loadLatestBids = async () => {
      try {
        setLoadingHistory(true);
        setHistoryError('');

        const response = await biddingApi.getHistoryLatestBids(auctionId);
        const bids = response?.result || response?.data?.result || [];

        if (isMounted) {
          setBidHistory(Array.isArray(bids) ? bids : []);
        }
      } catch (error) {
        console.error('Lỗi khi lấy lịch sử giá:', error);
        if (isMounted) {
          setBidHistory([]);
          setHistoryError('Không thể tải lịch sử đấu giá.');
        }
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };

    loadLatestBids();

    return () => {
      isMounted = false;
    };
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return;

    let isMounted = true;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setMessagesError('');

        const response = await biddingApi.getAuctionMessages(auctionId);
        const data = response?.result || response?.data?.result || [];

        if (isMounted) {
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Lỗi khi lấy lịch sử chat:', error);
        if (isMounted) {
          setMessages([]);
          setMessagesError('Không thể tải đoạn chat.');
        }
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId || auctionStatus !== 'ONGOING') {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setIsSocketConnected(false);
      return;
    }

    const client = new Client({
      brokerURL: 'ws://localhost:8082/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      onConnect: () => {
        setIsSocketConnected(true);

        client.subscribe(
          `/topic/auctions/${auctionId}/latest-bids`,
          (messageFrame) => {
            try {
              const newBid = JSON.parse(messageFrame.body);

              setBidHistory((prev) => {
                const filtered = prev.filter((item) => item.id !== newBid.id);
                return [newBid, ...filtered].slice(0, 5);
              });
            } catch (error) {
              console.error('Lỗi parse bid socket:', error);
            }
          },
        );

        client.subscribe(
          `/topic/auctions/${auctionId}/chat`,
          (messageFrame) => {
            try {
              const newMessage = JSON.parse(messageFrame.body);

              setMessages((prev) => {
                const exists = prev.some((item) => item.id === newMessage.id);
                if (exists) return prev;
                return [...prev, newMessage];
              });

              const isMine =
                String(newMessage.senderId) === String(currentUserId) ||
                newMessage.messageType === 'SYSTEM';

              if ((!isOpen || activeTab !== 'CHAT') && !isMine) {
                setUnreadCount((prev) => prev + 1);
              }
            } catch (error) {
              console.error('Lỗi parse chat socket:', error);
            }
          },
        );
      },
      onDisconnect: () => {
        setIsSocketConnected(false);
      },
      onStompError: (frame) => {
        setIsSocketConnected(false);
        console.error('STOMP error:', frame);
      },
      onWebSocketError: (error) => {
        setIsSocketConnected(false);
        console.error('WebSocket error:', error);
      },
      onWebSocketClose: (event) => {
        setIsSocketConnected(false);
        console.error('WebSocket closed:', event);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      setIsSocketConnected(false);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [auctionId, auctionStatus, activeTab, currentUserId, isOpen]);

  const handleSendMessage = async () => {
    setSendError('');

    if (!canChat) {
      setSendError('Chỉ có thể chat khi phiên đấu giá đang diễn ra.');
      return;
    }

    const trimmed = chatMessage.trim();

    if (!trimmed || !auctionId || sendingMessage) return;

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setSendError(`Tin nhắn không được vượt quá ${MAX_MESSAGE_LENGTH} ký tự.`);
      return;
    }

    if (Date.now() - lastSentAt < SEND_COOLDOWN_MS) {
      setSendError('Bạn đang gửi quá nhanh, vui lòng chờ một chút.');
      return;
    }

    try {
      setSendingMessage(true);

      await biddingApi.sendAuctionMessage(auctionId, {
        content: trimmed,
      });

      setChatMessage('');
      setLastSentAt(Date.now());
      setSendError('');
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      setSendError(
        error?.response?.data?.message || 'Không thể gửi tin nhắn lúc này.',
      );
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRetryMessages = async () => {
    if (!auctionId) return;

    try {
      setLoadingMessages(true);
      setMessagesError('');

      const response = await biddingApi.getAuctionMessages(auctionId);
      const data = response?.result || response?.data?.result || [];
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi khi tải lại chat:', error);
      setMessagesError('Không thể tải đoạn chat.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const openPanel = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closePanel = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <>
      {!isOpen ? (
        <button
          onClick={openPanel}
          className="fixed bottom-4 right-4 md:bottom-5 md:right-5 z-50 flex h-14 items-center gap-3 rounded-full bg-slate-900 px-5 text-white shadow-2xl transition-all hover:scale-[1.02] hover:bg-slate-800"
        >
          <div className="relative">
            <MessageCircle size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>

          <span className="text-sm font-bold">Lịch sử & Chat</span>
        </button>
      ) : (
        <div
          className={`fixed z-50 flex flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl transition-all duration-300
    bottom-3 left-3 right-3 rounded-3xl
    md:bottom-5 md:left-auto md:right-5 md:w-105
    ${isMinimized ? 'h-16' : 'h-[78vh] max-h-190 md:h-[85vh] md:max-h-180'}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {activeTab === 'HISTORY' ? 'Lịch sử giá' : 'Phòng Chat'}
              </p>
              <p className="truncate text-xs text-slate-500">
                {canChat
                  ? 'Theo dõi hoạt động phiên đấu giá'
                  : 'Chat chỉ mở khi phiên ở trạng thái ONGOING'}
              </p>
            </div>

            <div className="ml-3 flex items-center gap-1">
              <button
                onClick={toggleMinimize}
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
                onClick={closePanel}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex border-b border-slate-200 px-2 pt-2 bg-slate-50 shrink-0">
                <button
                  onClick={() => setActiveTab('HISTORY')}
                  className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'HISTORY'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <History size={16} />
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
                  <MessagesSquare size={16} />
                  <span>Phòng Chat</span>

                  <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-[10px] text-slate-600">
                    {participantCount}
                  </span>

                  {unreadCount > 0 && activeTab !== 'CHAT' && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'CHAT' && (
                <div className="px-4 py-3 border-b border-slate-100 bg-white shrink-0 flex flex-wrap items-center justify-between gap-2">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${chatStatusMeta.className}`}
                  >
                    {chatStatusMeta.icon}
                    {chatStatusMeta.label}
                  </div>

                  <div className="text-xs text-slate-500">
                    {canChat
                      ? 'Tin nhắn'
                      : 'Chat chỉ mở khi phiên đấu giá đang diễn ra'}
                  </div>
                </div>
              )}

              <div className="flex flex-1 min-h-0 flex-col">
                <div className="flex-1 min-h-0 overflow-y-auto bg-white p-4 relative">
                  {activeTab === 'HISTORY' && (
                    <div className="space-y-2">
                      {loadingHistory ? (
                        <div className="text-sm text-slate-500 text-center py-6">
                          Đang tải lịch sử giá...
                        </div>
                      ) : historyError ? (
                        <div className="text-center py-8">
                          <div className="inline-flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2">
                            <AlertCircle size={16} />
                            {historyError}
                          </div>
                        </div>
                      ) : bidHistory.length === 0 ? (
                        <div className="text-sm text-slate-500 text-center py-6">
                          Chưa có lịch sử đấu giá.
                        </div>
                      ) : (
                        bidHistory.map((bid, index) => (
                          <div
                            key={bid.id}
                            className={`rounded-xl border px-3 py-3 transition-colors ${
                              index === 0
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-slate-100 bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-slate-800 truncate">
                                    {bid.bidderMaskedName}
                                  </span>

                                  {index === 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                                      Mới nhất
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs text-slate-500 mt-1">
                                  {formatTime(bid.activatedAt)}
                                </div>
                              </div>

                              <div className="text-sm font-bold text-slate-900">
                                {formatCurrency(bid.amount)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={historyEndRef} />
                    </div>
                  )}

                  {activeTab === 'CHAT' && (
                    <div className="space-y-3 pb-3">
                      {loadingMessages ? (
                        <div className="text-sm text-slate-500 text-center py-6">
                          Đang tải đoạn chat...
                        </div>
                      ) : messagesError ? (
                        <div className="py-8 text-center">
                          <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
                            <div className="inline-flex items-center gap-2 text-sm font-medium text-rose-700">
                              <AlertCircle size={16} />
                              {messagesError}
                            </div>

                            <button
                              onClick={handleRetryMessages}
                              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                            >
                              Tải lại
                            </button>
                          </div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-sm text-slate-500 text-center py-10 flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <MessageCircle size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-slate-700">
                              Chưa có tin nhắn nào
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {canChat
                                ? 'Hãy bắt đầu cuộc trò chuyện trong phiên đấu giá.'
                                : 'Phòng chat sẽ mở khi phiên chuyển sang trạng thái đang diễn ra.'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          if (msg.messageType === 'SYSTEM') {
                            return (
                              <div key={msg.id} className="flex justify-center">
                                <div className="max-w-[90%] text-center text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-1.5">
                                  {msg.content}
                                </div>
                              </div>
                            );
                          }

                          const isMine =
                            String(msg.senderId) === String(currentUserId);

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${
                                isMine ? 'items-end' : 'items-start'
                              }`}
                            >
                              <div className="text-[11px] text-slate-400 mb-1 px-1">
                                {msg.senderDisplayName} •{' '}
                                {formatTime(msg.sentAt)}
                              </div>

                              <div
                                className={`max-w-[85%] px-3 py-2 text-sm wrap-break-word shadow-sm ${
                                  isMine
                                    ? 'bg-slate-900 text-white rounded-2xl rounded-br-md'
                                    : 'bg-slate-100 text-slate-700 rounded-2xl rounded-bl-md'
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {activeTab === 'CHAT' && (
                  <div className="shrink-0 border-t border-slate-200 bg-white p-3">
                    {!canChat && (
                      <div className="mb-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <Clock3 size={14} />
                        Chỉ có thể chat khi phiên đấu giá đang diễn ra.
                      </div>
                    )}

                    {sendError && (
                      <div className="mb-2 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                        <AlertCircle size={14} />
                        {sendError}
                      </div>
                    )}

                    <div className="flex items-end gap-2 rounded-3xl border border-slate-300 bg-slate-50 px-3 py-2 focus-within:border-slate-400 transition-colors">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={chatMessage}
                          disabled={!canChat || sendingMessage}
                          maxLength={MAX_MESSAGE_LENGTH}
                          onChange={(e) => {
                            setChatMessage(e.target.value);
                            if (sendError) setSendError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder={
                            !canChat
                              ? 'Chỉ có thể chat khi phiên đấu giá đang diễn ra'
                              : 'Nhập tin nhắn...'
                          }
                          className="w-full bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400 disabled:cursor-not-allowed"
                        />

                        <div className="mt-1 flex items-center justify-between px-1">
                          <span className="text-[11px] text-slate-400">
                            {!canChat
                              ? 'Phòng chat hiện đang bị khóa'
                              : isCooldownActive
                                ? 'Bạn đang gửi quá nhanh, vui lòng chờ...'
                                : 'Enter để gửi'}
                          </span>

                          <span
                            className={`text-[11px] ${
                              remainingChars < 40
                                ? 'text-amber-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {chatMessage.length}/{MAX_MESSAGE_LENGTH}
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={
                          sendingMessage ||
                          !trimmedMessage ||
                          !canChat ||
                          isCooldownActive
                        }
                        className={`w-9 h-9 rounded-full text-white flex items-center justify-center transition-colors shrink-0 ${
                          sendingMessage ||
                          !trimmedMessage ||
                          !canChat ||
                          isCooldownActive
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                        onClick={handleSendMessage}
                        title={!canChat ? 'Chat đang bị khóa' : 'Gửi tin nhắn'}
                      >
                        {sendingMessage ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Send size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
