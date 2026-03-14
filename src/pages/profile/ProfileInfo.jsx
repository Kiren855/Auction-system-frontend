import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Mail,
  Phone,
  Pencil,
  Save,
  X,
  UserRound,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { profileApi } from '../../api/profileApi';

const keepDigitsOnly = (value) => value.replace(/\D/g, '');

const normalizeVietnamPhoneInput = (rawValue) => {
  const digits = keepDigitsOnly(rawValue || '');

  if (!digits) return '';

  if (digits.startsWith('84')) {
    return digits.slice(2);
  }

  if (digits.startsWith('0')) {
    return digits.slice(1);
  }

  return digits;
};

// Backend hiện tại đang trả kiểu: "899983823"
// nên gửi lại phần local number, không kèm +84
const buildPhoneForBackend = (phoneInput) => {
  return normalizeVietnamPhoneInput(phoneInput);
};

const formatPhoneDisplay = (phoneValue) => {
  const normalized = normalizeVietnamPhoneInput(phoneValue);

  if (!normalized) return 'Chưa cập nhật';

  return `+84 ${normalized}`;
};

const getResponseData = (response) =>
  response?.result || response?.data?.result;

const ProfileInfoPage = () => {
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    avatarFile: null,
    avatarPreview: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    phoneNumber: '',
  });

  const [submitError, setSubmitError] = useState('');

  const mapProfileData = (raw) => ({
    email: raw?.email || '',
    username: raw?.username || '',
    fullName: raw?.full_name || '',
    phoneNumber: raw?.phone_number || '',
    avatarUrl: raw?.avatar_url || '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setSubmitError('');

      const response = await profileApi.getProfile();
      const result = getResponseData(response);
      const mappedProfile = mapProfileData(result);

      setProfile(mappedProfile);

      setFormData({
        fullName: mappedProfile.fullName,
        phoneNumber: normalizeVietnamPhoneInput(mappedProfile.phoneNumber),
        avatarFile: null,
        avatarPreview: '',
      });
    } catch (error) {
      console.error('Get profile failed:', error);
      setSubmitError('Không thể tải thông tin cá nhân.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (formData.avatarPreview) {
        URL.revokeObjectURL(formData.avatarPreview);
      }
    };
  }, [formData.avatarPreview]);

  const avatarSrc = formData.avatarPreview || profile?.avatarUrl || '';

  const avatarFallback = useMemo(() => {
    const name = profile?.fullName || formData.fullName || 'U';
    return name.trim().charAt(0).toUpperCase();
  }, [profile?.fullName, formData.fullName]);

  const handleEdit = () => {
    setErrors({
      fullName: '',
      phoneNumber: '',
    });
    setSubmitError('');

    setFormData({
      fullName: profile?.fullName || '',
      phoneNumber: normalizeVietnamPhoneInput(profile?.phoneNumber || ''),
      avatarFile: null,
      avatarPreview: '',
    });

    setIsEditing(true);
  };

  const handleCancel = () => {
    setErrors({
      fullName: '',
      phoneNumber: '',
    });
    setSubmitError('');

    setFormData({
      fullName: profile?.fullName || '',
      phoneNumber: normalizeVietnamPhoneInput(profile?.phoneNumber || ''),
      avatarFile: null,
      avatarPreview: '',
    });

    setIsEditing(false);
  };

  const handleChangeFullName = (e) => {
    setFormData((prev) => ({
      ...prev,
      fullName: e.target.value,
    }));
  };

  const handleChangePhone = (e) => {
    const normalized = normalizeVietnamPhoneInput(e.target.value).slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      phoneNumber: normalized,
    }));
  };

  const handleChooseAvatar = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.avatarPreview) {
      URL.revokeObjectURL(formData.avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      avatarFile: file,
      avatarPreview: previewUrl,
    }));
  };

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      phoneNumber: '',
    };

    const trimmedName = formData.fullName.trim();
    const normalizedPhone = normalizeVietnamPhoneInput(formData.phoneNumber);

    if (!trimmedName) {
      newErrors.fullName = 'Vui lòng nhập họ và tên.';
    } else if (trimmedName.length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.';
    }

    if (normalizedPhone && !/^\d{9,10}$/.test(normalizedPhone)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ.';
    }

    setErrors(newErrors);

    return !newErrors.fullName && !newErrors.phoneNumber;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setSubmitError('');

      const multipartData = new FormData();
      multipartData.append('fullName', formData.fullName.trim());
      multipartData.append(
        'phoneNumber',
        buildPhoneForBackend(formData.phoneNumber),
      );

      if (formData.avatarFile) {
        multipartData.append('avatar', formData.avatarFile);
      }

      await profileApi.updateProfile(multipartData);

      await fetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile failed:', error);
      setSubmitError('Cập nhật thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-10 flex items-center justify-center text-slate-500">
            <Loader2 className="animate-spin mr-2" size={20} />
            Đang tải thông tin cá nhân...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 md:px-8 py-6 border-b border-slate-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Thông tin cá nhân
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Quản lý thông tin hồ sơ của bạn.
              </p>
            </div>

            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
              >
                <Pencil size={18} />
                Chỉnh sửa thông tin
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-60"
                >
                  <X size={18} />
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-amber-500 text-slate-900 font-semibold hover:bg-amber-600 transition disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            {submitError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              <div className="lg:w-72 flex flex-col items-center lg:items-start">
                <div className="relative">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      className="w-32 h-32 md:w-36 md:h-36 rounded-3xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-4xl font-bold">
                      {avatarFallback}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleChooseAvatar}
                    className={`absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center transition ${
                      isEditing
                        ? 'text-slate-700 hover:bg-slate-50'
                        : 'text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Camera size={18} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="mt-4 text-center lg:text-left">
                  <h2 className="text-xl font-bold text-slate-900">
                    {profile?.fullName || 'Chưa cập nhật'}
                  </h2>

                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                    <ShieldCheck size={16} />
                    Tài khoản hoạt động
                  </div>
                </div>
              </div>

              <div className="flex-1">
                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-3 text-slate-500">
                        <UserRound size={18} />
                        <span className="text-sm font-medium">Họ và tên</span>
                      </div>
                      <p className="mt-3 text-base font-semibold text-slate-900">
                        {profile?.fullName || 'Chưa cập nhật'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-3 text-slate-500">
                        <Mail size={18} />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <p className="mt-3 text-base font-semibold text-slate-900 break-all">
                        {profile?.email || 'Chưa cập nhật'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
                      <div className="flex items-center gap-3 text-slate-500">
                        <Phone size={18} />
                        <span className="text-sm font-medium">
                          Số điện thoại
                        </span>
                      </div>
                      <p className="mt-3 text-base font-semibold text-slate-900">
                        {formatPhoneDisplay(profile?.phoneNumber)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={handleChangeFullName}
                        placeholder="Nhập họ và tên"
                        className={`w-full h-12 rounded-2xl border px-4 outline-none transition ${
                          errors.fullName
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-slate-300 focus:border-amber-500'
                        }`}
                      />
                      {errors.fullName && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Số điện thoại
                      </label>

                      <div
                        className={`flex items-center h-12 rounded-2xl border overflow-hidden bg-white ${
                          errors.phoneNumber
                            ? 'border-red-300'
                            : 'border-slate-300 focus-within:border-amber-500'
                        }`}
                      >
                        <div className="h-full px-4 flex items-center bg-slate-50 border-r border-slate-200 text-slate-700 font-medium">
                          +84
                        </div>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={formData.phoneNumber}
                          onChange={handleChangePhone}
                          placeholder="899983823"
                          className="flex-1 h-full px-4 outline-none"
                        />
                      </div>

                      {errors.phoneNumber && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoPage;
