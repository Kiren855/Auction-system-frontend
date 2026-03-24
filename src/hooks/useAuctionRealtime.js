import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

export function useAuctionRealtime({
  auctionId,
  onAuctionUpdate,
  onAutoBidUpdate,
  onBidHistoryUpdate,
}) {
  const clientRef = useRef(null);

  const onAuctionUpdateRef = useRef(onAuctionUpdate);
  const onAutoBidUpdateRef = useRef(onAutoBidUpdate);
  const onBidHistoryUpdateRef = useRef(onBidHistoryUpdate);

  useEffect(() => {
    onAuctionUpdateRef.current = onAuctionUpdate;
  }, [onAuctionUpdate]);

  useEffect(() => {
    onAutoBidUpdateRef.current = onAutoBidUpdate;
  }, [onAutoBidUpdate]);

  useEffect(() => {
    onBidHistoryUpdateRef.current = onBidHistoryUpdate;
  }, [onBidHistoryUpdate]);

  useEffect(() => {
    if (!auctionId) return;

    const client = new Client({
      brokerURL: 'ws://localhost:8082/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},

      onConnect: () => {
        client.subscribe(
          `/topic/auctions/${auctionId}/latest-bids`,
          (messageFrame) => {
            try {
              const newBid = JSON.parse(messageFrame.body);

              onBidHistoryUpdateRef.current?.(newBid);

              onAuctionUpdateRef.current?.({
                currentPrice: Number(newBid.amount ?? 0),
              });
            } catch (error) {
              console.error('Lỗi parse latest bid socket:', error);
            }
          },
        );

        // Chỉ bật nếu backend thực sự có publish topic này
        // client.subscribe(
        //   `/topic/auctions/${auctionId}/auto-bid`,
        //   (messageFrame) => {
        //     try {
        //       const payload = JSON.parse(messageFrame.body);
        //       onAutoBidUpdateRef.current?.(payload);
        //     } catch (error) {
        //       console.error('Lỗi parse auto bid socket:', error);
        //     }
        //   },
        // );
      },

      onDisconnect: () => {
        console.log('Auction realtime disconnected');
      },

      onStompError: (frame) => {
        console.error('Auction realtime STOMP error:', frame);
      },

      onWebSocketError: (error) => {
        console.error('Auction realtime WebSocket error:', error);
      },

      onWebSocketClose: (event) => {
        console.error('Auction realtime WebSocket closed:', event);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [auctionId]);
}
