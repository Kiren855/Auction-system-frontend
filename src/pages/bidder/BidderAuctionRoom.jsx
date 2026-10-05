import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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
import { useAuctionRoomRealtime } from '../../hooks/useAuctionRoomRealtime';

function calculateRemainingTime(startAt, endAt) {
  if (!startAt || !endAt) return '--:--:--';

  const end = new Date(endAt).getTime();
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

function getResponseData(response) {
  return response?.result || response?.data?.result || null;
}

function normalizeAuctionDetail(data) {
  if (!data) return null;

  const currentPrice = Number(
    data.currentPrice ??
      data.current_price ??
      data.startPrice ??
      data.start_price ??
      0,
  );

  const stepPrice = Number(data.stepPrice ?? data.step_price ?? 0);
  const startPrice = Number(data.startPrice ?? data.start_price ?? 0);
  const minNextPrice = currentPrice + stepPrice;

  const item = data.item || {};

  const images = Array.isArray(item.images)
    ? [...item.images]
        .sort(
          (a, b) =>
            (a.displayOrder ?? a.display_order ?? 0) -
            (b.displayOrder ?? b.display_order ?? 0),
        )
        .map((img) => img.imageUrl || img.image_url)
        .filter(Boolean)
    : [];

  const attributes = item.attributes
    ? Object.entries(item.attributes).map(([key, value]) => ({
        key,
        value: String(value ?? ''),
      }))
    : [];

  return {
    id: data.id,
    title: data.title,
    status: data.status,
    sellerName: data.sellerName ?? data.seller_name ?? 'Người bán',
    sellerId: data.sellerId ?? data.seller_id,
    itemName: item.itemName ?? item.item_name ?? data.title ?? '',
    brand: item.brand ?? '',
    condition: item.condition ?? '',
    category: item.categoryName ?? item.category_name ?? '',
    description: item.description ?? data.description ?? '',
    startAt: data.startAt ?? data.start_at,
    endAt: data.endAt ?? data.end_at,
    durationMinutes: Number(data.durationMinutes ?? data.duration_minutes ?? 0),
    startPrice,
    currentPrice,
    stepPrice,
    minNextPrice,
    highestBidderId: data.highestBidderId ?? data.highest_bidder_id ?? null,
    participantCount: Number(
      data.participantCount ?? data.participant_count ?? 0,
    ),
    bidCount: Number(data.bidCount ?? data.bid_count ?? 0),
    attributes,
    images,
  };
}

export default function BidderAuctionRoom() {
  const { auctionId } = useParams();
  const { user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remaining, setRemaining] = useState('--:--:--');

  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);

  const [autoBidAmount, setAutoBidAmount] = useState('');
  const [autoBidStatus, setAutoBidStatus] = useState(null);
  const [savingAutoBid, setSavingAutoBid] = useState(false);
  const [disablingAutoBid, setDisablingAutoBid] = useState(false);

  const [initialBidHistory, setInitialBidHistory] = useState([]);
  const [initialMessages, setInitialMessages] = useState([]);

  const bidInputTouchedRef = useRef(false);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    mode: null,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    type: 'primary',
  });

  const [notifications, setNotifications] = useState([]);

  const pushNotification = useCallback(
    ({ type = 'info', title = 'Thông báo', message = '', duration = 3500 }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [...prev, { id, type, title, message }]);

      window.setTimeout(() => {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
      }, duration);
    },
    [],
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const loadAuctionRoom = useCallback(
    async ({ keepBidValue = false, keepAutoBidValue = false } = {}) => {
      try {
        setLoading(true);

        const [auctionRes, autoBidRes, latestBidsRes, messagesRes] =
          await Promise.allSettled([
            auctionApi.getAuctionDetail(auctionId),
            biddingApi.getMyAutoBidStatus(auctionId),
            biddingApi.getHistoryLatestBids(auctionId),
            biddingApi.getAuctionMessages(auctionId),
          ]);

        const auctionData =
          auctionRes.status === 'fulfilled'
            ? getResponseData(auctionRes.value)
            : null;

        if (!auctionData) {
          setAuction(null);
          return;
        }

        const normalizedAuction = normalizeAuctionDetail(auctionData);

        setAuction(normalizedAuction);
        setRemaining(
          calculateRemainingTime(
            normalizedAuction.startAt,
            normalizedAuction.endAt,
          ),
        );

        if (latestBidsRes.status === 'fulfilled') {
          const bids = getResponseData(latestBidsRes.value) || [];
          setInitialBidHistory(Array.isArray(bids) ? bids : []);
        } else {
          setInitialBidHistory([]);
        }

        if (messagesRes.status === 'fulfilled') {
          const msgs = getResponseData(messagesRes.value) || [];
          setInitialMessages(Array.isArray(msgs) ? msgs : []);
        } else {
          setInitialMessages([]);
        }

        if (!keepBidValue) {
          bidInputTouchedRef.current = false;
          setBidAmount(String(normalizedAuction.minNextPrice));
        } else {
          setBidAmount((prev) =>
            prev && Number(prev) >= normalizedAuction.minNextPrice
              ? prev
              : String(normalizedAuction.minNextPrice),
          );
        }

        let latestAutoBidStatus = null;

        if (autoBidRes.status === 'fulfilled') {
          latestAutoBidStatus = getResponseData(autoBidRes.value);

          if (latestAutoBidStatus) {
            const isLeading =
              String(normalizedAuction.highestBidderId || '') ===
              String(user?.userId || '');

            setAutoBidStatus({
              ...latestAutoBidStatus,
              currentPrice: normalizedAuction.currentPrice,
              highestBidderId: normalizedAuction.highestBidderId,
              currentlyLeading: isLeading,
              currentlyOutbid:
                !!latestAutoBidStatus.enabled &&
                !isLeading &&
                Number(latestAutoBidStatus.maxBidAmount || 0) > 0 &&
                Number(latestAutoBidStatus.maxBidAmount || 0) <
                  Number(normalizedAuction.currentPrice || 0),
            });
          } else {
            setAutoBidStatus({
              enabled: false,
              maxBidAmount: null,
              currentlyLeading:
                String(normalizedAuction.highestBidderId || '') ===
                String(user?.userId || ''),
              currentlyOutbid: false,
              currentPrice: normalizedAuction.currentPrice,
              highestBidderId: normalizedAuction.highestBidderId,
            });
          }
        } else {
          setAutoBidStatus({
            enabled: false,
            maxBidAmount: null,
            currentlyLeading:
              String(normalizedAuction.highestBidderId || '') ===
              String(user?.userId || ''),
            currentlyOutbid: false,
            currentPrice: normalizedAuction.currentPrice,
            highestBidderId: normalizedAuction.highestBidderId,
          });
        }

        if (!keepAutoBidValue) {
          if (
            latestAutoBidStatus?.enabled &&
            latestAutoBidStatus?.maxBidAmount != null
          ) {
            setAutoBidAmount(String(latestAutoBidStatus.maxBidAmount));
          } else {
            setAutoBidAmount(
              String(
                normalizedAuction.minNextPrice +
                  normalizedAuction.stepPrice * 3,
              ),
            );
          }
        } else {
          setAutoBidAmount((prev) => {
            if (prev && Number(prev) >= normalizedAuction.minNextPrice) {
              return prev;
            }

            if (
              latestAutoBidStatus?.enabled &&
              latestAutoBidStatus?.maxBidAmount != null
            ) {
              return String(latestAutoBidStatus.maxBidAmount);
            }

            return String(
              normalizedAuction.minNextPrice + normalizedAuction.stepPrice * 3,
            );
          });
        }
      } catch (error) {
        console.error('Load auction room error:', error);
        setAuction(null);
        pushNotification({
          type: 'error',
          title: 'Tải dữ liệu thất bại',
          message: 'Không thể tải thông tin phiên đấu giá.',
        });
      } finally {
        setLoading(false);
      }
    },
    [auctionId, pushNotification, user?.userId],
  );

  useEffect(() => {
    loadAuctionRoom();
  }, [loadAuctionRoom]);

  const handleBidAmountChange = useCallback((value) => {
    bidInputTouchedRef.current = true;
    setBidAmount(value);
  }, []);

  const handleAutoBidAmountChange = useCallback((value) => {
    setAutoBidAmount(value);
  }, []);

  const {
    bidHistory: realtimeBidHistory,
    messages: realtimeMessages,
    isSocketConnected,
    sendChatMessage,
  } = useAuctionRoomRealtime({
    auctionId,
    auctionStatus: auction?.status,
    currentUserId: user?.userId,
    initialBidHistory,
    initialMessages,

    onLatestBid: (bidEvent) => {
      const liveAmount = Number(bidEvent?.amount ?? 0);
      if (!liveAmount) return;

      let nextMinFromAuction = liveAmount;

      setAuction((prev) => {
        if (!prev) return prev;

        const stepPrice = Number(prev.stepPrice || 0);
        const nextMinPrice = liveAmount + stepPrice;
        nextMinFromAuction = nextMinPrice;

        return {
          ...prev,
          currentPrice: liveAmount,
          minNextPrice: nextMinPrice,
        };
      });

      setBidAmount((prev) => {
        if (!bidInputTouchedRef.current) {
          return String(nextMinFromAuction);
        }

        if (!prev) return String(nextMinFromAuction);
        return Number(prev) < nextMinFromAuction
          ? String(nextMinFromAuction)
          : prev;
      });
    },

    onAuctionUpdate: (liveData) => {
      setAuction((prev) => {
        if (!prev) return prev;

        const nextCurrentPrice = Number(
          liveData?.currentPrice ??
            liveData?.current_price ??
            prev.currentPrice ??
            0,
        );

        const nextStepPrice = Number(
          liveData?.stepPrice ?? liveData?.step_price ?? prev.stepPrice ?? 0,
        );

        const nextMinNextPrice = Number(
          liveData?.minNextPrice ??
            liveData?.min_next_price ??
            nextCurrentPrice + nextStepPrice,
        );

        const nextHighestBidderId =
          liveData?.highestBidderId ??
          liveData?.highest_bidder_id ??
          prev.highestBidderId ??
          null;

        const nextStatus = liveData?.status ?? prev.status;
        const nextEndAt = liveData?.endAt ?? liveData?.end_at ?? prev.endAt;

        const nextParticipantCount = Number(
          liveData?.participantCount ??
            liveData?.participant_count ??
            prev.participantCount ??
            0,
        );

        const nextBidCount = Number(
          liveData?.bidCount ?? liveData?.bid_count ?? prev.bidCount ?? 0,
        );

        return {
          ...prev,
          currentPrice: nextCurrentPrice,
          stepPrice: nextStepPrice,
          minNextPrice: nextMinNextPrice,
          highestBidderId: nextHighestBidderId,
          status: nextStatus,
          endAt: nextEndAt,
          participantCount: nextParticipantCount,
          bidCount: nextBidCount,
        };
      });
    },

    onAutoBidUpdate: (liveAutoBid) => {
      setAutoBidStatus((prev) => {
        const current = prev ?? {
          enabled: false,
          maxBidAmount: null,
          currentlyLeading: false,
          currentlyOutbid: false,
          currentPrice: 0,
          highestBidderId: null,
        };

        return {
          ...current,
          ...liveAutoBid,
          maxBidAmount:
            liveAutoBid?.maxBidAmount ??
            liveAutoBid?.max_bid_amount ??
            current.maxBidAmount,
          enabled: liveAutoBid?.enabled ?? current.enabled,
          currentlyLeading:
            liveAutoBid?.currentlyLeading ??
            liveAutoBid?.currently_leading ??
            current.currentlyLeading,
          currentlyOutbid:
            liveAutoBid?.currentlyOutbid ??
            liveAutoBid?.currently_outbid ??
            current.currentlyOutbid,
          currentPrice: Number(
            liveAutoBid?.currentPrice ??
              liveAutoBid?.current_price ??
              current.currentPrice ??
              0,
          ),
          highestBidderId:
            liveAutoBid?.highestBidderId ??
            liveAutoBid?.highest_bidder_id ??
            current.highestBidderId ??
            null,
        };
      });
    },
  });

  useEffect(() => {
    if (!auction?.startAt || !auction?.endAt) return;

    const timer = setInterval(() => {
      setRemaining(calculateRemainingTime(auction.startAt, auction.endAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [auction?.startAt, auction?.endAt]);

  useEffect(() => {
    if (!auction?.minNextPrice) return;
    if (bidInputTouchedRef.current) return;

    setBidAmount(String(auction.minNextPrice));
  }, [auction?.minNextPrice]);

  useEffect(() => {
    if (!auction || !user?.userId) return;

    setAutoBidStatus((prev) => {
      if (!prev) return prev;

      const isLeading =
        String(auction.highestBidderId || '') === String(user.userId);

      const currentPrice = Number(auction.currentPrice || 0);
      const maxBidAmount = Number(prev.maxBidAmount || 0);

      return {
        ...prev,
        currentPrice,
        highestBidderId: auction.highestBidderId,
        currentlyLeading: isLeading,
        currentlyOutbid:
          !!prev.enabled &&
          maxBidAmount > 0 &&
          !isLeading &&
          maxBidAmount < currentPrice,
      };
    });
  }, [auction?.highestBidderId, auction?.currentPrice, user?.userId]);

  const canBid = useMemo(() => {
    return auction?.status === 'ONGOING' && remaining !== '00:00:00';
  }, [auction?.status, remaining]);

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
      message: `Bạn có chắc muốn đặt giá ${formatCurrency(amount)} cho phiên đấu giá này không?`,
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
        message: `Mức tối đa phải từ ${formatCurrency(auction.minNextPrice)} trở lên.`,
      });
      return;
    }

    const enabled = !!autoBidStatus?.enabled;

    setConfirmState({
      isOpen: true,
      mode: 'AUTO_BID',
      title: enabled ? 'Cập nhật auto bid' : 'Bật auto bid',
      message: enabled
        ? `Bạn có muốn cập nhật mức tối đa auto bid thành ${formatCurrency(amount)} không?`
        : `Bạn có muốn bật auto bid với mức tối đa ${formatCurrency(amount)} không?`,
      confirmText: enabled ? 'Cập nhật' : 'Bật auto bid',
      type: 'success',
    });
  };

  const openDisableAutoBidConfirm = () => {
    if (!autoBidStatus?.enabled) return;

    setConfirmState({
      isOpen: true,
      mode: 'DISABLE_AUTO_BID',
      title: 'Tắt auto bid',
      message:
        'Bạn có chắc muốn tắt chế độ auto bid cho phiên đấu giá này không?',
      confirmText: 'Tắt auto bid',
      type: 'danger',
    });
  };

  const resetConfirmState = () => {
    setConfirmState({
      isOpen: false,
      mode: null,
      title: '',
      message: '',
      confirmText: 'Xác nhận',
      type: 'primary',
    });
  };

  const closeConfirmModal = () => {
    if (placingBid || savingAutoBid || disablingAutoBid) return;
    resetConfirmState();
  };

  const handleConfirmAction = async () => {
    if (!confirmState.mode) return;

    if (confirmState.mode === 'MANUAL_BID') {
      try {
        setPlacingBid(true);
        await biddingApi.placeBid(auctionId, Number(bidAmount));

        resetConfirmState();

        pushNotification({
          type: 'success',
          title: 'Đặt giá thành công',
          message: `Bạn đã đặt giá ${formatCurrency(bidAmount)}.`,
        });

        bidInputTouchedRef.current = false;
        await loadAuctionRoom({ keepBidValue: false, keepAutoBidValue: true });
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          'Đặt giá thất bại. Giá hiện tại có thể đã thay đổi.';

        resetConfirmState();

        pushNotification({
          type: 'error',
          title: 'Đặt giá thất bại',
          message,
        });

        await loadAuctionRoom({ keepBidValue: false, keepAutoBidValue: true });
      } finally {
        setPlacingBid(false);
      }

      return;
    }

    if (confirmState.mode === 'AUTO_BID') {
      try {
        setSavingAutoBid(true);
        await biddingApi.createOrUpdateAutoBid(
          auctionId,
          Number(autoBidAmount),
        );

        resetConfirmState();

        pushNotification({
          type: 'success',
          title: autoBidStatus?.enabled
            ? 'Cập nhật auto bid thành công'
            : 'Bật auto bid thành công',
          message: `Mức tối đa hiện tại là ${formatCurrency(autoBidAmount)}.`,
        });

        await loadAuctionRoom({ keepBidValue: true, keepAutoBidValue: true });
      } catch (error) {
        const message =
          error?.response?.data?.message || 'Không thể lưu cấu hình auto bid.';

        resetConfirmState();

        pushNotification({
          type: 'error',
          title: 'Auto bid thất bại',
          message,
        });

        await loadAuctionRoom({ keepBidValue: true, keepAutoBidValue: true });
      } finally {
        setSavingAutoBid(false);
      }

      return;
    }

    if (confirmState.mode === 'DISABLE_AUTO_BID') {
      try {
        setDisablingAutoBid(true);
        await biddingApi.disableAutoBid(auctionId);

        resetConfirmState();

        pushNotification({
          type: 'success',
          title: 'Đã tắt auto bid',
          message: 'Cấu hình auto bid của bạn đã được tắt.',
        });

        await loadAuctionRoom({ keepBidValue: true, keepAutoBidValue: false });
      } catch (error) {
        const message =
          error?.response?.data?.message || 'Không thể tắt auto bid lúc này.';

        resetConfirmState();

        pushNotification({
          type: 'error',
          title: 'Tắt auto bid thất bại',
          message,
        });
      } finally {
        setDisablingAutoBid(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-350 mx-auto animate-pulse space-y-6">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-12 w-96 rounded bg-slate-200" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="h-155 rounded-3xl border border-slate-200 bg-white" />
            <div className="h-155 rounded-3xl border border-slate-200 bg-white" />
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
          placingBid || savingAutoBid || disablingAutoBid
            ? 'Đang xử lý...'
            : confirmState.confirmText
        }
        cancelText="Hủy"
        isLoading={placingBid || savingAutoBid || disablingAutoBid}
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
              onBidAmountChange={handleBidAmountChange}
              placingBid={placingBid}
              autoBidAmount={autoBidAmount}
              onAutoBidAmountChange={handleAutoBidAmountChange}
              autoBidStatus={autoBidStatus}
              savingAutoBid={savingAutoBid}
              disablingAutoBid={disablingAutoBid}
              canBid={canBid}
              onOpenManualBidConfirm={openManualBidConfirm}
              onOpenAutoBidConfirm={openAutoBidConfirm}
              onDisableAutoBidConfirm={openDisableAutoBidConfirm}
            />
          </aside>
        </div>
      </div>

      <AuctionActivityPanel
        participantCount={auction.participantCount}
        auctionId={auction?.id}
        auctionStatus={auction?.status}
        currentUserId={user?.userId}
        bidHistory={realtimeBidHistory}
        messages={realtimeMessages}
        isSocketConnected={isSocketConnected}
        onSendMessage={sendChatMessage}
      />
    </div>
  );
}
