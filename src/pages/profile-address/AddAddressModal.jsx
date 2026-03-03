import { useState } from 'react';
import { profileApi } from '../../api/profileApi';

export default function AddAddressModal({ open, onClose, onSuccess }) {
  const [fullAddress, setFullAddress] = useState('');

  if (!open) return null;

  const handleSubmit = async () => {
    if (!fullAddress.trim()) return;

    await profileApi.addAddress({ fullAddress });
    setFullAddress('');
    onClose();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-100">
        <h3 className="text-lg font-semibold mb-4">Thêm địa chỉ mới</h3>

        <input
          type="text"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          placeholder="Nhập địa chỉ..."
          className="w-full border p-2 rounded-lg mb-4"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Huỷ</button>
          <button
            onClick={handleSubmit}
            className="bg-black text-white px-4 py-2 rounded-xl"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
