import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setAuthError(''); // Reset error
    try {
      // data will now contain { email, password }
      await login(data);
      console.log('login success');
      navigate('/seller/dashboard');
    } catch (error) {
      setAuthError('Invalid email or password. Please try again.');
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-110 w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
        {/* Header Section */}
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Đăng Nhập
          </h1>
        </div>

        {/* Global Error Message */}
        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle size={18} />
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
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
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="name@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-[11px] font-bold mt-1 ml-1 uppercase tracking-wider">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-slate-700">
                Mật khẩu
              </label>
              <button
                type="button"
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
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-[11px] font-bold mt-1 ml-1 uppercase tracking-wider">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-2xl transition-all shadow-md active:scale-[0.98] mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Tiếp tục'
            )}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Create Account Link */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Chưa có tài khoản?{' '}
            <button
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
