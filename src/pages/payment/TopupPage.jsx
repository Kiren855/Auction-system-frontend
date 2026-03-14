import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Wallet,
  Gift,
  Sparkles,
  CheckCircle2,
  Loader2,
  CreditCard,
  Landmark,
  Lock,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { paymentApi } from '../../api/paymentApi';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getResponseData = (response) =>
  response?.result || response?.data?.result;

const ResultModal = ({ isOpen, type, title, message, onClose }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-950/55 px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isSuccess
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {isSuccess ? (
                <CheckCircle size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className={`h-11 rounded-2xl px-5 text-sm font-bold text-white transition-colors ${
              isSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const TopupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [wallet, setWallet] = useState(null);

  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [resultModal, setResultModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === selectedPackageId) || null,
    [packages, selectedPackageId],
  );

  const fetchTopupData = async () => {
    try {
      setLoading(true);
      setWalletLoading(true);
      setError('');

      const [packagesResponse, walletResponse] = await Promise.all([
        paymentApi.getTopupPackages(),
        paymentApi.getMyWallet(),
      ]);

      const packageList = getResponseData(packagesResponse) || [];
      const walletData = getResponseData(walletResponse) || null;

      const sortedPackages = [...packageList].sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
      );

      setPackages(sortedPackages);
      setWallet(walletData);

      setSelectedPackageId((prev) => {
        if (prev && sortedPackages.some((item) => item.id === prev)) {
          return prev;
        }

        if (sortedPackages.length > 0) {
          const featured = sortedPackages.find((item) => item.featured);
          return featured?.id || sortedPackages[0].id;
        }

        return null;
      });
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu nạp tiền. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    fetchTopupData();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get('paymentStatus');
    const paymentType = searchParams.get('paymentType');

    if (paymentType !== 'topup' || !paymentStatus) return;

    if (paymentStatus === 'completed') {
      setResultModal({
        isOpen: true,
        type: 'success',
        title: 'Nạp ví thành công',
        message: 'Số dư ví của bạn đã được cập nhật thành công.',
      });

      fetchTopupData();
    } else {
      setResultModal({
        isOpen: true,
        type: 'error',
        title: 'Nạp ví thất bại',
        message:
          'Giao dịch nạp ví chưa thành công. Vui lòng kiểm tra lại và thử lại.',
      });
    }

    navigate(location.pathname, { replace: true });
  }, [location.search, location.pathname, navigate]);

  const handleTopup = async () => {
    if (!selectedPackage) return;

    try {
      setSubmitting(true);
      setError('');

      const response = await paymentApi.createTopupOrder(selectedPackage.id);
      const result = getResponseData(response);

      if (!result?.paymentUrl) {
        throw new Error('Không tìm thấy đường dẫn thanh toán');
      }

      window.location.href = result.paymentUrl;
    } catch (err) {
      console.error(err);
      setError('Tạo thanh toán thất bại. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-80px)] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <div className="rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-sm md:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20">
                    <Wallet className="text-amber-300" size={28} />
                  </div>

                  <div className="flex-1">
                    <h1 className="text-2xl font-bold md:text-3xl">
                      Nạp tiền vào ví
                    </h1>
                    <p className="mt-2 leading-relaxed text-slate-300">
                      Chọn gói nạp phù hợp để tăng số dư ví và tham gia đấu giá
                      thuận tiện hơn. Một số gói sẽ có ưu đãi tiền thưởng thêm.
                    </p>

                    <div className="mt-5">
                      {walletLoading ? (
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm text-slate-200">
                          <Loader2 size={16} className="animate-spin" />
                          Đang tải thông tin ví...
                        </div>
                      ) : wallet ? (
                        <div className="mt-5 flex flex-wrap gap-4">
                          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <Landmark size={16} />
                              Số dư khả dụng
                            </div>
                            <p className="mt-2 text-lg font-bold text-white">
                              {formatCurrency(wallet.availableBalance)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <Lock size={16} />
                              Số dư đang khóa
                            </div>
                            <p className="mt-2 text-lg font-bold text-white">
                              {formatCurrency(wallet.lockedBalance)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2 text-sm text-red-200">
                          Không tải được thông tin ví
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Sparkles className="text-amber-500" size={22} />
                  <h2 className="text-lg font-bold text-slate-900 md:text-xl">
                    Chọn gói nạp
                  </h2>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16 text-slate-500">
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Đang tải gói nạp...
                  </div>
                ) : packages.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    Hiện chưa có gói nạp nào.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      const totalReceive =
                        Number(pkg.amount || 0) + Number(pkg.bonusAmount || 0);

                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`relative rounded-2xl border p-5 text-left transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-200'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          {pkg.featured && (
                            <div className="absolute right-4 top-4">
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                <Sparkles size={14} />
                                Nổi bật
                              </span>
                            </div>
                          )}

                          <div className="pr-20">
                            <h3 className="text-lg font-bold text-slate-900">
                              {pkg.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {pkg.description || 'Gói nạp dành cho ví của bạn'}
                            </p>
                          </div>

                          <div className="mt-5">
                            <div className="text-2xl font-extrabold text-slate-900">
                              {formatCurrency(pkg.amount)}
                            </div>

                            {Number(pkg.bonusAmount) > 0 ? (
                              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                                <Gift size={16} />
                                Tặng thêm {formatCurrency(pkg.bonusAmount)}
                              </div>
                            ) : (
                              <div className="mt-3 text-sm text-slate-400">
                                Không kèm ưu đãi thêm
                              </div>
                            )}
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">
                                Tổng nhận
                              </p>
                              <p className="text-base font-bold text-slate-800">
                                {formatCurrency(totalReceive)}
                              </p>
                            </div>

                            {isSelected && (
                              <div className="text-amber-600">
                                <CheckCircle2 size={22} />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="xl:col-span-1">
              <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Thông tin thanh toán
                </h2>

                {!selectedPackage ? (
                  <div className="mt-6 text-sm text-slate-500">
                    Vui lòng chọn một gói nạp.
                  </div>
                ) : (
                  <>
                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Gói đã chọn</p>
                        <p className="mt-1 text-base font-semibold text-slate-900">
                          {selectedPackage.name}
                        </p>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Số tiền nạp</span>
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(selectedPackage.amount)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Ưu đãi thêm</span>
                          <span className="font-semibold text-emerald-600">
                            + {formatCurrency(selectedPackage.bonusAmount)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                          <span className="font-medium text-slate-700">
                            Tổng vào ví
                          </span>
                          <span className="text-lg font-bold text-slate-900">
                            {formatCurrency(
                              Number(selectedPackage.amount || 0) +
                                Number(selectedPackage.bonusAmount || 0),
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                          <span className="font-medium text-slate-700">
                            Số dư sau nạp
                          </span>
                          <span className="text-lg font-bold text-emerald-600">
                            {formatCurrency(
                              Number(wallet?.availableBalance || 0) +
                                Number(selectedPackage.amount || 0) +
                                Number(selectedPackage.bonusAmount || 0),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleTopup}
                      disabled={submitting || loading || !selectedPackage}
                      className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 font-bold text-slate-900 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Đang chuyển hướng...
                        </>
                      ) : (
                        <>
                          <Wallet size={18} />
                          Nạp tiền ngay
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResultModal
        isOpen={resultModal.isOpen}
        type={resultModal.type}
        title={resultModal.title}
        message={resultModal.message}
        onClose={() =>
          setResultModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />
    </>
  );
};

export default TopupPage;
