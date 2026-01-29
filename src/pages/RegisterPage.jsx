import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import { Lock, Mail, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      user_type: "USER" // Default value as requested
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError("");
    try {
      await authApi.register(data);
      setIsSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setServerError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-[440px] w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-500 rounded-full mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Account Created!</h1>
          <p className="text-slate-500 mt-2">Redirecting you to the login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-[480px] w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
        
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h1>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle size={18} />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1 uppercase">First Name</label>
              <input
                {...register("first_name", { required: "Required" })}
                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-slate-900 outline-none transition-all"
                placeholder="John"
              />
              {errors.first_name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Last Name</label>
              <input
                {...register("last_name", { required: "Required" })}
                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-slate-900 outline-none transition-all"
                placeholder="Doe"
              />
              {errors.last_name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.last_name.message}</p>}
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <User size={16} />
              </div>
              <input
                {...register("username", { required: "Username is required" })}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-slate-900 outline-none transition-all"
                placeholder="johndoe123"
              />
            </div>
            {errors.username && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.username.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Mail size={16} />
              </div>
              <input
                type="email"
                {...register("email", { 
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                })}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-slate-900 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Lock size={16} />
              </div>
              <input
                type="password"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 8, message: "Minimum 8 characters" }
                })}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-slate-900 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password.message}</p>}
          </div>

          {/* Hidden User Type */}
          <input type="hidden" {...register("user_type")} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-2xl transition-all shadow-md mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-slate-900 font-bold hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;