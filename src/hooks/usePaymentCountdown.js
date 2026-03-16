import { useEffect, useState } from 'react';

export function usePaymentCountdown(serverTime) {
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

  const getRemaining = (expiredAt) => {
    if (!expiredAt) return '00:00:00';

    const target = new Date(expiredAt).getTime();
    const diff = target - now;

    if (diff <= 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isExpired = (expiredAt) => {
    if (!expiredAt) return true;
    return new Date(expiredAt).getTime() - now <= 0;
  };

  return { getRemaining, isExpired };
}
