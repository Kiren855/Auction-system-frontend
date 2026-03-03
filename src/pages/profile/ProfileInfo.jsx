import React, { useEffect, useState } from 'react';
import { profileApi } from '../../api/profileApi';

const ProfileInfo = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await profileApi.getProfile();
      const data = res.data.result;
      setProfile(data);

      setFullName(data.full_name || '');
      setPhoneNumber(data.phone_number || '');
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('phoneNumber', phoneNumber);

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await profileApi.updateProfile(formData);

      setIsEditing(false);
      setAvatarFile(null);
      setPreviewAvatar(null);

      await fetchProfile();
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen py-10 px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6">
            <div>
              <h2 className="text-2xl font-semibold">Thông tin cá nhân</h2>
              <p className="text-sm text-gray-500 mt-1">
                Quản lý thông tin hồ sơ của bạn
              </p>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition"
              >
                Chỉnh sửa
              </button>
            )}
          </div>

          <div className="border-t border-gray-200" />

          {/* Body */}
          <div className="px-8 py-8">
            {/* Avatar + Basic Info */}
            <div className="flex items-center gap-8 mb-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-200">
                  {previewAvatar ? (
                    <img
                      src={previewAvatar}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-black text-white flex items-center justify-center text-3xl font-semibold">
                      {profile?.username?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <label className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                      Thay đổi
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null);
                        setPreviewAvatar(null);
                      }}
                      className="text-sm px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      Huỷ
                    </button>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xl font-semibold text-gray-900">
                  {profile?.username}
                </p>
                <p className="text-gray-500 mt-1">{profile?.email}</p>
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-6 max-w-2xl">
              {/* Full Name */}
              <div>
                <label className="text-sm text-gray-500">Họ và tên</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition"
                  />
                ) : (
                  <div className="mt-2 px-4 py-3 bg-gray-50 rounded-xl text-gray-800">
                    {profile?.full_name || '—'}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-gray-500">Số điện thoại</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition"
                  />
                ) : (
                  <div className="mt-2 px-4 py-3 bg-gray-50 rounded-xl text-gray-800">
                    {profile?.phone_number || '—'}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="mt-10 flex gap-4">
                <button
                  onClick={handleSave}
                  className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition"
                >
                  Lưu thay đổi
                </button>

                <button
                  onClick={() => {
                    setIsEditing(false);
                    setAvatarFile(null);
                    setPreviewAvatar(null);
                    setFullName(profile.full_name || '');
                    setPhoneNumber(profile.phone_number || '');
                  }}
                  className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
                >
                  Huỷ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
