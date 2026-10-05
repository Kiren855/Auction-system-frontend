import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const GOOGLE_LOGIN_URL =
  'http://localhost:8081/identity/api/v1/auth/google/login';

const GoogleIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4A9.6 9.6 0 0 0 2.4 12 9.6 9.6 0 0 0 12 21.6c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.5H12Z"
    />
    <path
      fill="#4285F4"
      d="M3.5 6.4 6.7 8.7C7.6 6.9 9.6 5.6 12 5.6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4c-3.7 0-6.9 2.1-8.5 5.2Z"
    />
    <path
      fill="#FBBC05"
      d="M2.4 12c0 1.5.4 2.9 1.1 4.1l3.7-2.8c-.2-.5-.4-.9-.4-1.3s.1-.9.4-1.3L3.5 7.9A9.5 9.5 0 0 0 2.4 12Z"
    />
    <path
      fill="#34A853"
      d="M12 21.6c2.6 0 4.8-.8 6.4-2.3l-3.1-2.5c-.8.6-1.9 1-3.3 1-2.4 0-4.4-1.5-5.2-3.6l-3.7 2.8c1.6 3.1 4.8 5.1 8.9 5.1Z"
    />
  </svg>
);

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setAuthError('');

    try {
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      setAuthError(
        error?.response?.data?.message ||
          'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.',
      );
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setAuthError('');
    setIsGoogleLoading(true);
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-slate-500 mb-2">
            Chào mừng trở lại
          </p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Đăng nhập
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Đăng nhập để tham gia đấu giá và theo dõi phiên của bạn.
          </p>
        </div>

        {authError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3 text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Vui lòng nhập email',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ',
                  },
                })}
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="name@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs font-semibold mt-1 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-slate-700">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Lock size={18} />
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password', {
                  required: 'Vui lòng nhập mật khẩu',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                  },
                })}
                className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs font-semibold mt-1 ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-2xl transition-all shadow-sm active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Đang đăng nhập...
              </>
            ) : (
              <>
                Tiếp tục
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="flex items-center gap-4 py-1">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold tracking-wider text-slate-400">
              HOẶC
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 rounded-2xl font-semibold text-slate-700 transition-all"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Đang chuyển hướng...
              </>
            ) : (
              <>
                <GoogleIcon />
                Đăng nhập với Google
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-slate-900 font-bold hover:underline underline-offset-4"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
