import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { biddingApi } from '../../api/biddingApi';

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

  const chatEndRef = useRef(null);
  const historyEndRef = useRef(null);
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!auctionId) return;

    let isMounted = true;

    const loadLatestBids = async () => {
      try {
        setLoadingHistory(true);
        const response = await biddingApi.getHistoryLatestBids(auctionId);
        const bids = response?.result || response?.data?.result || [];

        if (isMounted) {
          setBidHistory(Array.isArray(bids) ? bids : []);
        }
      } catch (error) {
        console.error('Lỗi khi lấy lịch sử giá:', error);
        if (isMounted) {
          setBidHistory([]);
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
        const response = await biddingApi.getAuctionMessages(auctionId);
        const data = response?.result || response?.data?.result || [];

        if (isMounted) {
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Lỗi khi lấy lịch sử chat:', error);
        if (isMounted) {
          setMessages([]);
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
    if (!auctionId || auctionStatus !== 'ONGOING') return;

    const client = new Client({
      brokerURL: 'ws://localhost:8082/ws',
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        client.subscribe(
          `/topic/auctions/${auctionId}/latest-bids`,
          (message) => {
            try {
              const newBid = JSON.parse(message.body);

              setBidHistory((prev) => {
                const filtered = prev.filter((item) => item.id !== newBid.id);
                return [newBid, ...filtered].slice(0, 5);
              });
            } catch (error) {
              console.error('Lỗi parse bid socket:', error);
            }
          },
        );

        client.subscribe(`/topic/auctions/${auctionId}/chat`, (message) => {
          try {
            const newMessage = JSON.parse(message.body);

            setMessages((prev) => {
              const exists = prev.some((item) => item.id === newMessage.id);
              if (exists) return prev;
              return [...prev, newMessage];
            });
          } catch (error) {
            console.error('Lỗi parse chat socket:', error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
      },
      onWebSocketClose: (event) => {
        console.error('WebSocket closed:', event);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [auctionId, auctionStatus]);

  useEffect(() => {
    if (activeTab === 'CHAT') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async () => {
    const trimmed = chatMessage.trim();

    if (!trimmed || !auctionId || sendingMessage) return;

    try {
      setSendingMessage(true);

      await biddingApi.sendAuctionMessage(auctionId, {
        content: trimmed,
      });

      setChatMessage('');
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm flex flex-col min-h-130 overflow-hidden">
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

      <div className="flex-1 min-h-0 overflow-y-auto bg-white p-4 relative">
        {activeTab === 'HISTORY' && (
          <div className="space-y-2">
            {loadingHistory ? (
              <div className="text-sm text-slate-500 text-center py-6">
                Đang tải lịch sử giá...
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
            ) : messages.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-6">
                Chưa có tin nhắn nào.
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

                const isMine = String(msg.senderId) === String(currentUserId);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMine ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="text-[11px] text-slate-400 mb-1 px-1">
                      {msg.senderDisplayName} • {formatTime(msg.sentAt)}
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
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400"
            />

            <button
              disabled={sendingMessage || !chatMessage.trim()}
              className={`w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors ${
                sendingMessage || !chatMessage.trim()
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
              onClick={handleSendMessage}
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
