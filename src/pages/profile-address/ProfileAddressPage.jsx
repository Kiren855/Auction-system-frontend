import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Phone,
  User,
  RefreshCw,
  Home,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { profileApi } from '../../api/profileApi';
import AddressFormModal from './AddressFormModal';
import ConfirmModal from '../../components/common/ConfirmModal';

function normalizeAddress(item) {
  return {
    id: item?.id,
    fullAddress: item?.fullAddress ?? item?.full_address ?? '',
    receiverName: item?.receiverName ?? item?.receiver_name ?? '',
    phoneNumber: item?.phoneNumber ?? item?.phone_number ?? '',
    provinceCode: item?.provinceCode ?? item?.province_code ?? '',
    provinceName: item?.provinceName ?? item?.province_name ?? '',
    wardCode: item?.wardCode ?? item?.ward_code ?? '',
    wardName: item?.wardName ?? item?.ward_name ?? '',
    addressLine: item?.addressLine ?? item?.address_line ?? '',
    note: item?.note ?? '',
    isDefault: Boolean(item?.default ?? item?.is_default ?? false),
    addressData: item?.addressData ?? item?.address_data ?? {},
    createdAt: item?.createdAt ?? item?.created_at ?? null,
    updatedAt: item?.updatedAt ?? item?.updated_at ?? null,
  };
}

function formatAddressMeta(address) {
  const items = [address?.wardName, address?.provinceName].filter(Boolean);
  return items.join(', ');
}

export default function ProfileAddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalState, setModalState] = useState({
    open: false,
    mode: 'create',
    address: null,
  });

  const [confirmState, setConfirmState] = useState({
    open: false,
    type: '', // delete | default
    address: null,
    loading: false,
  });

  const sortedAddresses = useMemo(() => {
    return [...addresses].sort(
      (a, b) => Number(b.isDefault) - Number(a.isDefault),
    );
  }, [addresses]);

  const defaultAddress = useMemo(() => {
    return sortedAddresses.find((item) => item.isDefault) || null;
  }, [sortedAddresses]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await profileApi.getAddresses();
      const raw = Array.isArray(res?.data?.result) ? res.data.result : [];
      setAddresses(raw.map(normalizeAddress));
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || 'Không thể tải danh sách địa chỉ',
      );
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openCreateModal = () => {
    setModalState({
      open: true,
      mode: 'create',
      address: null,
    });
  };

  const openEditModal = (address) => {
    setModalState({
      open: true,
      mode: 'edit',
      address,
    });
  };

  const closeModal = () => {
    setModalState({
      open: false,
      mode: 'create',
      address: null,
    });
  };

  const openDeleteConfirm = (address) => {
    setConfirmState({
      open: true,
      type: 'delete',
      address,
      loading: false,
    });
  };

  const openSetDefaultConfirm = (address) => {
    if (address?.isDefault) return;

    setConfirmState({
      open: true,
      type: 'default',
      address,
      loading: false,
    });
  };

  const closeConfirmModal = () => {
    if (confirmState.loading) return;

    setConfirmState({
      open: false,
      type: '',
      address: null,
      loading: false,
    });
  };

  const handleConfirmAction = async () => {
    const selectedAddress = confirmState.address;
    if (!selectedAddress?.id) return;

    try {
      setConfirmState((prev) => ({ ...prev, loading: true }));

      if (confirmState.type === 'delete') {
        await profileApi.deleteAddress(selectedAddress.id);
        toast.success('Xoá địa chỉ thành công');
      }

      if (confirmState.type === 'default') {
        await profileApi.setDefaultAddress(selectedAddress.id);
        toast.success('Đã cập nhật địa chỉ mặc định');
      }

      closeConfirmModal();
      fetchAddresses();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          (confirmState.type === 'delete'
            ? 'Không thể xoá địa chỉ lúc này'
            : 'Không thể cập nhật địa chỉ mặc định'),
      );
      setConfirmState((prev) => ({ ...prev, loading: false }));
    }
  };

  const confirmTitle =
    confirmState.type === 'delete'
      ? 'Xác nhận xoá địa chỉ'
      : 'Đặt làm địa chỉ mặc định';

  const confirmMessage =
    confirmState.type === 'delete'
      ? `Bạn có chắc muốn xoá địa chỉ "${confirmState.address?.fullAddress || ''}" không?`
      : `Bạn có chắc muốn đặt địa chỉ "${confirmState.address?.fullAddress || ''}" làm mặc định không?`;

  const confirmText =
    confirmState.type === 'delete' ? 'Xoá địa chỉ' : 'Đặt mặc định';

  const confirmVariant = confirmState.type === 'delete' ? 'warning' : 'default';

  return (
    <>
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-7">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Danh sách địa chỉ
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={fetchAddresses}
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCw size={16} />
                  Làm mới
                </button>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Plus size={16} />
                  Thêm địa chỉ
                </button>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-7">
              {loading ? (
                <div className="py-16 text-center text-sm text-slate-500">
                  Đang tải danh sách địa chỉ...
                </div>
              ) : sortedAddresses.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                    <MapPin size={26} className="text-slate-400" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    Bạn chưa có địa chỉ nào
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Hãy thêm địa chỉ để việc thanh toán và giao hàng sau đấu giá
                    diễn ra nhanh hơn.
                  </p>

                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Plus size={16} />
                    Thêm địa chỉ đầu tiên
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {sortedAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`rounded-3xl border p-5 transition ${
                        address.isDefault
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {address.receiverName || 'Chưa có tên người nhận'}
                            </h3>

                            {address.isDefault && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                                <Star size={12} />
                                Mặc định
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                            <div className="inline-flex items-center gap-2">
                              <Phone size={14} className="text-slate-400" />
                              <span>{address.phoneNumber || '--'}</span>
                            </div>
                            <div className="inline-flex items-center gap-2">
                              <MapPin size={14} className="text-slate-400" />
                              <span>{formatAddressMeta(address) || '--'}</span>
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-6 text-slate-700">
                            {address.fullAddress}
                          </p>

                          {address.note ? (
                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                              <span className="font-semibold text-slate-700">
                                Ghi chú:
                              </span>{' '}
                              {address.note}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(address)}
                            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil size={15} />
                            Sửa
                          </button>

                          {!address.isDefault && (
                            <button
                              type="button"
                              onClick={() => openSetDefaultConfirm(address)}
                              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                            >
                              <Star size={15} />
                              Đặt mặc định
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openDeleteConfirm(address)}
                            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 size={15} />
                            Xoá
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddressFormModal
        open={modalState.open}
        mode={modalState.mode}
        initialData={modalState.address}
        onClose={closeModal}
        onSuccess={fetchAddresses}
      />

      <ConfirmModal
        isOpen={confirmState.open}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        loading={confirmState.loading}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmText}
        cancelText="Hủy"
        variant={confirmVariant}
      />
    </>
  );
}
