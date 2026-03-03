import { useEffect, useState } from 'react';

export function useServerCountdown(auctions, serverTime) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!serverTime) return;

    const serverMillis = new Date(serverTime).getTime();
    const clientMillis = Date.now();

    // độ lệch giữa client và server
    const offset = clientMillis - serverMillis;

    const interval = setInterval(() => {
      // luôn lấy giờ server chuẩn
      setNow(Date.now() - offset);
    }, 1000);

    return () => clearInterval(interval);
  }, [serverTime]);

  const calculateRemaining = (auction) => {
    if (!auction?.start_at) return '00:00:00';

    const startMs = new Date(auction.start_at).getTime();
    const durationMs = (auction.duration_minutes || 0) * 60 * 1000;
    const endMs = startMs + durationMs;

    let target;

    if (auction.status === 'PENDING') {
      target = startMs;
    } else if (auction.status === 'ONGOING') {
      target = endMs;
    } else {
      return '00:00:00';
    }

    const diff = target - now;

    if (diff <= 0) return '00:00:00';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // Nếu còn trên 1 ngày → hiển thị dạng: 1d 02:03:04
    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Nếu dưới 1 ngày → HH:mm:ss
    const totalHours = Math.floor(diff / (1000 * 60 * 60));

    return `${totalHours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return { calculateRemaining };
}
