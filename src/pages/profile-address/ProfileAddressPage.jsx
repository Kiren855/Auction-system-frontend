import { useEffect, useState } from 'react';
import { profileApi } from '../../api/profileApi';
import AddAddressModal from './AddAddressModal';

export default function ProfileAddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await profileApi.getAddresses();
      setAddresses(res.data.result);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá địa chỉ này?')) return;
    await profileApi.deleteAddress(id);
    fetchAddresses();
  };

  const handleSetDefault = async (id) => {
    if (!window.confirm('Đặt làm địa chỉ mặc định?')) return;
    await profileApi.setDefaultAddress(id);
    fetchAddresses();
  };

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen py-10 px-4">
      <div className="w-full max-w-4xl">
        {/* Content Wrapper */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {/* Header Section */}
          <div className="flex items-center justify-between px-8 py-6">
            <div>
              <h2 className="text-2xl font-semibold">Địa chỉ của tôi</h2>
              <p className="text-sm text-gray-500 mt-1">
                Quản lý thông tin địa chỉ giao hàng
              </p>
            </div>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition"
            >
              + Thêm địa chỉ
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Body */}
          <div className="px-8 py-6">
            {/* Loading */}
            {loading && (
              <div className="text-center py-10 text-gray-500">
                Đang tải dữ liệu...
              </div>
            )}

            {/* Empty State */}
            {!loading && addresses.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ nào.</p>
                <button
                  onClick={() => setOpenModal(true)}
                  className="bg-black text-white px-4 py-2 rounded-lg"
                >
                  Thêm địa chỉ đầu tiên
                </button>
              </div>
            )}

            {/* Address List */}
            <div className="space-y-6">
              {[...addresses]
                .sort((a, b) => b.is_default - a.is_default)
                .map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-5 rounded-xl border transition
                  ${
                    addr.is_default
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="max-w-lg">
                        <p className="text-base font-medium text-gray-800">
                          {addr.full_address}
                        </p>

                        {addr.is_default && (
                          <span className="inline-block mt-3 text-xs font-semibold bg-black text-white px-3 py-1 rounded-full">
                            Mặc định
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3">
                        {!addr.is_default && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                          >
                            Đặt mặc định
                          </button>
                        )}

                        {!addr.is_default && (
                          <button
                            onClick={() => handleDelete(addr.id)}
                            className="text-sm px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                          >
                            Xoá
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <AddAddressModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={fetchAddresses}
      />
    </div>
  );
}
