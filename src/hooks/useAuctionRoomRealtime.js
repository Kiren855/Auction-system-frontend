import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

function normalizeArray(data) {
  return Array.isArray(data) ? data : [];
}

export function useAuctionRoomRealtime({
  auctionId,
  auctionStatus,
  currentUserId,
  initialBidHistory = [],
  initialMessages = [],
  onLatestBid,
  onAuctionUpdate,
  onAutoBidUpdate,
}) {
  const [bidHistory, setBidHistory] = useState(() =>
    normalizeArray(initialBidHistory),
  );
  const [messages, setMessages] = useState(() =>
    normalizeArray(initialMessages),
  );
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const clientRef = useRef(null);

  const onLatestBidRef = useRef(onLatestBid);
  const onAuctionUpdateRef = useRef(onAuctionUpdate);
  const onAutoBidUpdateRef = useRef(onAutoBidUpdate);

  useEffect(() => {
    onLatestBidRef.current = onLatestBid;
  }, [onLatestBid]);

  useEffect(() => {
    onAuctionUpdateRef.current = onAuctionUpdate;
  }, [onAuctionUpdate]);

  useEffect(() => {
    onAutoBidUpdateRef.current = onAutoBidUpdate;
  }, [onAutoBidUpdate]);

  useEffect(() => {
    setBidHistory(normalizeArray(initialBidHistory));
  }, [initialBidHistory]);

  useEffect(() => {
    setMessages(normalizeArray(initialMessages));
  }, [initialMessages]);

  useEffect(() => {
    if (!auctionId || auctionStatus !== 'ONGOING') {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
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
          (frame) => {
            try {
              const newBid = JSON.parse(frame.body);

              setBidHistory((prev) => {
                const filtered = prev.filter((item) => item.id !== newBid.id);
                return [newBid, ...filtered].slice(0, 20);
              });

              onLatestBidRef.current?.(newBid);
              onAuctionUpdateRef.current?.({
                currentPrice: Number(newBid.amount ?? 0),
                bidderId: newBid.bidderId ?? null,
                highestBidderId: newBid.bidderId ?? null,
              });
            } catch (error) {
              console.error('Parse latest bid failed:', error);
            }
          },
        );

        client.subscribe(`/topic/auctions/${auctionId}/chat`, (frame) => {
          try {
            const newMessage = JSON.parse(frame.body);

            setMessages((prev) => {
              const filtered = prev.filter((item) => item.id !== newMessage.id);
              return [...filtered, newMessage];
            });
          } catch (error) {
            console.error('Parse chat message failed:', error);
          }
        });

        // Mở topic này nếu backend của bạn có publish
        // client.subscribe(`/topic/auctions/${auctionId}/auto-bid`, (frame) => {
        //   try {
        //     const payload = JSON.parse(frame.body);
        //     onAutoBidUpdateRef.current?.(payload);
        //   } catch (error) {
        //     console.error('Parse auto bid failed:', error);
        //   }
        // });

        // Mở topic này nếu backend của bạn có publish
        // client.subscribe(`/topic/auctions/${auctionId}`, (frame) => {
        //   try {
        //     const payload = JSON.parse(frame.body);
        //     onAuctionUpdateRef.current?.(payload?.data ?? payload);
        //   } catch (error) {
        //     console.error('Parse auction update failed:', error);
        //   }
        // });
      },
      onDisconnect: () => {
        setIsSocketConnected(false);
      },
      onStompError: (frame) => {
        console.error('Auction room STOMP error:', frame);
      },
      onWebSocketError: (error) => {
        console.error('Auction room WebSocket error:', error);
      },
      onWebSocketClose: (event) => {
        setIsSocketConnected(false);

        if (event.code !== 1000) {
          console.error('Auction room WebSocket closed unexpectedly:', event);
        }
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsSocketConnected(false);
    };
  }, [auctionId, auctionStatus]);

  const sendChatMessage = useCallback(
    (payload) => {
      const client = clientRef.current;
      if (!client || !client.connected || !auctionId) {
        throw new Error('Socket chưa kết nối.');
      }

      client.publish({
        destination: `/app/auctions/${auctionId}/chat`,
        body: JSON.stringify(payload),
      });
    },
    [auctionId],
  );

  return useMemo(
    () => ({
      bidHistory,
      messages,
      isSocketConnected,
      sendChatMessage,
    }),
    [bidHistory, messages, isSocketConnected, sendChatMessage],
  );
}
