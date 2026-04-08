import { useEffect, useMemo, useState } from 'react';
import { X, MapPinned, Phone, User, CheckCircle2 } from 'lucide-react';
import { profileApi } from '../../api/profileApi';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  receiverName: '',
  phoneNumber: '',
  provinceCode: '',
  wardCode: '',
  addressLine: '',
  note: '',
  isDefault: false,
};

export default function AddressFormModal({
  open,
  mode = 'create',
  initialData = null,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!open) return;

    const loadProvinces = async () => {
      try {
        setLoadingOptions(true);
        const res = await profileApi.getAdministrativeProvinces();
        setProvinces(Array.isArray(res?.data?.result) ? res.data.result : []);
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải danh sách tỉnh / thành');
      } finally {
        setLoadingOptions(false);
      }
    };

    loadProvinces();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (isEdit && initialData) {
      setForm({
        receiverName: initialData.receiverName || '',
        phoneNumber: initialData.phoneNumber || '',
        provinceCode: initialData.provinceCode || '',
        wardCode: initialData.wardCode || '',
        addressLine: initialData.addressLine || '',
        note: initialData.note || '',
        isDefault: !!initialData.isDefault,
      });
    } else {
      setForm(EMPTY_FORM);
      setWards([]);
    }
  }, [open, isEdit, initialData]);

  useEffect(() => {
    if (!open || !form.provinceCode) {
      setWards([]);
      return;
    }

    const loadWards = async () => {
      try {
        setLoadingOptions(true);
        const res = await profileApi.getAdministrativeWards(form.provinceCode);
        const wardList = Array.isArray(res?.data?.result)
          ? res.data.result
          : [];
        setWards(wardList);
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải danh sách xã / phường');
        setWards([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadWards();
  }, [open, form.provinceCode]);

  const selectedProvinceName = useMemo(() => {
    return (
      provinces.find((item) => item.code === form.provinceCode)?.name || ''
    );
  }, [provinces, form.provinceCode]);

  const selectedWardName = useMemo(() => {
    return wards.find((item) => item.code === form.wardCode)?.name || '';
  }, [wards, form.wardCode]);

  const previewAddress = useMemo(() => {
    return [form.addressLine?.trim(), selectedWardName, selectedProvinceName]
      .filter(Boolean)
      .join(', ');
  }, [form.addressLine, selectedWardName, selectedProvinceName]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProvinceChange = (value) => {
    setForm((prev) => ({
      ...prev,
      provinceCode: value,
      wardCode: '',
    }));
    setWards([]);
  };

  const validateForm = () => {
    if (!form.receiverName.trim()) {
      toast.error('Vui lòng nhập tên người nhận');
      return false;
    }
    if (!form.phoneNumber.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!form.provinceCode) {
      toast.error('Vui lòng chọn tỉnh / thành');
      return false;
    }
    if (!form.wardCode) {
      toast.error('Vui lòng chọn xã / phường');
      return false;
    }
    if (!form.addressLine.trim()) {
      toast.error('Vui lòng nhập địa chỉ chi tiết');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      receiverName: form.receiverName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      provinceCode: form.provinceCode,
      wardCode: form.wardCode,
      addressLine: form.addressLine.trim(),
      note: form.note.trim(),
      isDefault: form.isDefault,
    };

    try {
      setSubmitting(true);

      if (isEdit && initialData?.id) {
        await profileApi.updateAddress(initialData.id, payload);
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await profileApi.createAddress(payload);
        toast.success('Thêm địa chỉ thành công');
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          (isEdit
            ? 'Không thể cập nhật địa chỉ'
            : 'Không thể thêm địa chỉ mới'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 sm:px-7">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isEdit ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Điền đầy đủ thông tin để thuận tiện cho việc giao hàng.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-6 sm:px-7">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <User size={16} />
                Người nhận
              </span>
              <input
                type="text"
                value={form.receiverName}
                onChange={(e) => handleChange('receiverName', e.target.value)}
                placeholder="Nhập họ tên người nhận"
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Phone size={16} />
                Số điện thoại
              </span>
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="Nhập số điện thoại"
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 text-sm font-semibold text-slate-700">
                Tỉnh / Thành phố
              </span>
              <select
                value={form.provinceCode}
                onChange={(e) => handleProvinceChange(e.target.value)}
                disabled={loadingOptions}
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
              >
                <option value="">Chọn tỉnh / thành</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 text-sm font-semibold text-slate-700">
                Xã / Phường
              </span>
              <select
                value={form.wardCode}
                onChange={(e) => handleChange('wardCode', e.target.value)}
                disabled={!form.provinceCode || loadingOptions}
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
              >
                <option value="">Chọn xã / phường</option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPinned size={16} />
                Địa chỉ chi tiết
              </span>
              <textarea
                rows={3}
                value={form.addressLine}
                onChange={(e) => handleChange('addressLine', e.target.value)}
                placeholder="Ví dụ: Số 12, ngõ 5, tổ dân phố Đông..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 text-sm font-semibold text-slate-700">
                Ghi chú giao hàng
              </span>
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="Ví dụ: Gọi trước khi giao, giao giờ hành chính..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </label>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <CheckCircle2 size={16} className="text-slate-600" />
              Xem trước địa chỉ
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {previewAddress || 'Địa chỉ hoàn chỉnh sẽ hiển thị ở đây'}
            </p>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => handleChange('isDefault', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">
              Đặt làm địa chỉ mặc định
            </span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-11 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? isEdit
                ? 'Đang cập nhật...'
                : 'Đang lưu...'
              : isEdit
                ? 'Lưu thay đổi'
                : 'Thêm địa chỉ'}
          </button>
        </div>
      </div>
    </div>
  );
}
