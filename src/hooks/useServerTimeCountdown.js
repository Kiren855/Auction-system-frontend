import { useEffect, useState } from 'react';

export function useServerCountdown(auctions, serverTime) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!serverTime) return;

    const serverMillis = new Date(serverTime).getTime();
    const clientMillis = Date.now();
    const offset = clientMillis - serverMillis;

    const interval = setInterval(() => {
      setNow(Date.now() - offset);
    }, 1000);

    return () => clearInterval(interval);
  }, [serverTime]);

  const calculateRemaining = (auction) => {
    const target =
      auction.status === 'PENDING'
        ? new Date(auction.start_at).getTime()
        : new Date(auction.end_at).getTime();

    const diff = target - now;

    if (diff <= 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return { calculateRemaining };
}
