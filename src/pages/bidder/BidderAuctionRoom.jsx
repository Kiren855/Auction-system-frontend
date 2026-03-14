import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';
import NotificationToast from '../../components/NotificationToast';
import AuctionRoomHeader from '../../components/auction-room/AuctionRoomHeader';
import AuctionProductPanel from '../../components/auction-room/AuctionProductPanel';
import AuctionBidPanel from '../../components/auction-room/AuctionBidPanel';
import AuctionActivityPanel from '../../components/auction-room/AuctionActivityPanel';
import { auctionApi } from '../../api/auctionApi';
import { biddingApi } from '../../api/biddingApi';
import { useAuth } from '../../context/AuthContext';

function calculateRemainingTime(startAt, durationMinutes) {
  if (!startAt || !durationMinutes) return '--:--:--';

  const start = new Date(startAt).getTime();
  const end = start + Number(durationMinutes) * 60 * 1000;
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return '00:00:00';

  const totalSeconds = Math.floor(diff / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    '0',
  );
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ';
}

export default function BidderAuctionRoom() {
  const { auctionId } = useParams();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState('--:--:--');

  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);

  const [autoBidAmount, setAutoBidAmount] = useState('');
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [savingAutoBid, setSavingAutoBid] = useState(false);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    mode: null,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    type: 'primary',
  });

  const [notifications, setNotifications] = useState([]);

  const { user } = useAuth();

  const pushNotification = ({
    type = 'info',
    title = 'Thông báo',
    message = '',
    duration = 3500,
  }) => {
    const id = `${Date.now()}-${Math.random()}`;

    setNotifications((prev) => [...prev, { id, type, title, message }]);

    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const loadAuction = async ({
    keepBidValue = false,
    keepAutoBidValue = false,
  } = {}) => {
    try {
      setLoading(true);

      const res = await auctionApi.getAuctionDetail(auctionId);
      const data = res?.data?.result;

      if (!data) {
        setAuction(null);
        return;
      }

      const currentPrice = Number(data.current_price ?? data.start_price ?? 0);
      const stepPrice = Number(data.step_price ?? 0);
      const minNextPrice = currentPrice + stepPrice;

      const normalizedAuction = {
        id: data.id,
        title: data.title,
        status: data.status,
        sellerName: data.seller_name,
        sellerId: data.seller_id,
        itemName: data.item?.item_name || '',
        brand: data.item?.brand || '',
        condition: data.item?.condition || '',
        category: data.item?.category_name || '',
        description: data.item?.description || '',
        startAt: data.start_at,
        durationMinutes: Number(data.duration_minutes || 0),
        startPrice: Number(data.start_price || 0),
        currentPrice,
        stepPrice,
        minNextPrice,
        depositStatus: 'PAID',
        participantCount: 18,
        highestBidderName: 'bidder***29',
        attributes: Object.entries(data.item?.attributes || {}).map(
          ([key, value]) => ({
            key,
            value: String(value ?? ''),
          }),
        ),
        images:
          data.item?.images
            ?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map((img) => img.image_url)
            .filter(Boolean) || [],
      };

      setAuction(normalizedAuction);

      setRemaining(
        calculateRemainingTime(
          normalizedAuction.startAt,
          normalizedAuction.durationMinutes,
        ),
      );

      if (!keepBidValue) {
        setBidAmount(String(minNextPrice));
      } else {
        setBidAmount((prev) =>
          prev && Number(prev) >= minNextPrice ? prev : String(minNextPrice),
        );
      }

      if (!keepAutoBidValue) {
        setAutoBidAmount(String(minNextPrice + stepPrice * 3));
      } else {
        setAutoBidAmount((prev) =>
          prev && Number(prev) >= minNextPrice
            ? prev
            : String(minNextPrice + stepPrice * 3),
        );
      }
    } catch (error) {
      console.error('Load auction detail error:', error);
      setAuction(null);
      pushNotification({
        type: 'error',
        title: 'Tải dữ liệu thất bại',
        message: 'Không thể tải thông tin phiên đấu giá.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuction();
  }, [auctionId]);

  useEffect(() => {
    if (!auction?.startAt || !auction?.durationMinutes) return;

    const timer = setInterval(() => {
      setRemaining(
        calculateRemainingTime(auction.startAt, auction.durationMinutes),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [auction?.startAt, auction?.durationMinutes]);

  const canBid = auction?.status === 'ONGOING' && remaining !== '00:00:00';

  const openManualBidConfirm = () => {
    if (!auction || !bidAmount) return;

    const amount = Number(bidAmount);

    if (!canBid) {
      pushNotification({
        type: 'warning',
        title: 'Không thể đặt giá',
        message: 'Phiên đấu giá hiện không ở trạng thái cho phép đặt giá.',
      });
      return;
    }

    if (Number.isNaN(amount) || amount <= 0 || amount < auction.minNextPrice) {
      pushNotification({
        type: 'warning',
        title: 'Giá chưa hợp lệ',
        message: `Giá đặt phải từ ${formatCurrency(auction.minNextPrice)} trở lên.`,
      });
      return;
    }

    setConfirmState({
      isOpen: true,
      mode: 'MANUAL_BID',
      title: 'Xác nhận đặt giá',
      message: `Bạn có chắc muốn đặt giá ${formatCurrency(
        bidAmount,
      )} cho phiên đấu giá này không?`,
      confirmText: 'Đặt giá ngay',
      type: 'primary',
    });
  };

  const openAutoBidConfirm = () => {
    if (!auction || !autoBidAmount) return;

    const amount = Number(autoBidAmount);

    if (!canBid) {
      pushNotification({
        type: 'warning',
        title: 'Không thể bật auto bid',
        message: 'Phiên đấu giá hiện không ở trạng thái cho phép đặt giá.',
      });
      return;
    }

    if (Number.isNaN(amount) || amount <= 0 || amount < auction.minNextPrice) {
      pushNotification({
        type: 'warning',
        title: 'Mức tối đa chưa hợp lệ',
        message: `Mức tối đa phải từ ${formatCurrency(
          auction.minNextPrice,
        )} trở lên.`,
      });
      return;
    }

    setConfirmState({
      isOpen: true,
      mode: 'AUTO_BID',
      title: autoBidEnabled ? 'Cập nhật auto bid' : 'Bật auto bid',
      message: autoBidEnabled
        ? `Bạn có muốn cập nhật mức tối đa auto bid thành ${formatCurrency(
            autoBidAmount,
          )} không?`
        : `Bạn có muốn bật auto bid với mức tối đa ${formatCurrency(
            autoBidAmount,
          )} không?`,
      confirmText: autoBidEnabled ? 'Cập nhật' : 'Bật auto bid',
      type: 'success',
    });
  };

  const closeConfirmModal = () => {
    if (placingBid || savingAutoBid) return;

    setConfirmState({
      isOpen: false,
      mode: null,
      title: '',
      message: '',
      confirmText: 'Xác nhận',
      type: 'primary',
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.mode) return;

    if (confirmState.mode === 'MANUAL_BID') {
      try {
        setPlacingBid(true);
        await biddingApi.placeBid(auctionId, Number(bidAmount));

        closeConfirmModal();

        pushNotification({
          type: 'success',
          title: 'Đặt giá thành công',
          message: `Bạn đã đặt giá ${formatCurrency(bidAmount)}.`,
        });

        await loadAuction({ keepBidValue: false, keepAutoBidValue: true });
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          'Đặt giá thất bại. Giá có thể đã thay đổi.';

        closeConfirmModal();

        pushNotification({
          type: 'error',
          title: 'Đặt giá thất bại',
          message,
        });

        await loadAuction({ keepBidValue: false, keepAutoBidValue: true });
      } finally {
        setPlacingBid(false);
      }

      return;
    }

    if (confirmState.mode === 'AUTO_BID') {
      try {
        setSavingAutoBid(true);

        // TODO: nối API auto bid thật
        // await auctionApi.enableAutoBid(auctionId, Number(autoBidAmount));

        await new Promise((resolve) => setTimeout(resolve, 800));

        setAutoBidEnabled(true);
        closeConfirmModal();

        pushNotification({
          type: 'success',
          title: autoBidEnabled
            ? 'Cập nhật auto bid thành công'
            : 'Bật auto bid thành công',
          message: `Mức tối đa hiện tại là ${formatCurrency(autoBidAmount)}.`,
        });
      } catch (error) {
        const message =
          error?.response?.data?.message || 'Không thể lưu cấu hình auto bid.';

        closeConfirmModal();

        pushNotification({
          type: 'error',
          title: 'Auto bid thất bại',
          message,
        });
      } finally {
        setSavingAutoBid(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-350 mx-auto animate-pulse space-y-6">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-12 w-96 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
            <div className="h-155 bg-white rounded-3xl border border-slate-200" />
            <div className="h-155 bg-white rounded-3xl border border-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center max-w-md w-full">
          <div className="text-lg font-semibold text-slate-800">
            Không tìm thấy phiên đấu giá
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20 lg:pb-6">
      <NotificationToast items={notifications} onClose={removeNotification} />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={
          placingBid || savingAutoBid
            ? 'Đang xử lý...'
            : confirmState.confirmText
        }
        cancelText="Hủy"
        isLoading={placingBid || savingAutoBid}
        type={confirmState.type}
      />

      <div className="max-w-362.5 mx-auto px-4 lg:px-6 py-4 lg:py-6">
        <AuctionRoomHeader
          title={auction.title}
          status={auction.status}
          sellerName={auction.sellerName}
          participantCount={auction.participantCount}
          startAt={auction.startAt}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_420px] gap-6">
          <div className="space-y-6">
            <AuctionProductPanel auction={auction} />
          </div>
          <aside className="lg:sticky lg:top-24">
            <AuctionBidPanel
              auction={auction}
              remaining={remaining}
              bidAmount={bidAmount}
              setBidAmount={setBidAmount}
              placingBid={placingBid}
              autoBidAmount={autoBidAmount}
              setAutoBidAmount={setAutoBidAmount}
              autoBidEnabled={autoBidEnabled}
              savingAutoBid={savingAutoBid}
              canBid={canBid}
              onOpenManualBidConfirm={openManualBidConfirm}
              onOpenAutoBidConfirm={openAutoBidConfirm}
            />
          </aside>
        </div>
      </div>
      <AuctionActivityPanel
        participantCount={auction.participantCount}
        auctionId={auction?.id}
        auctionStatus={auction?.status}
        currentUserId={user?.userId}
      />
    </div>
  );
}
