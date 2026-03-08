import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  Search,
  Gavel,
  History,
  LayoutDashboard,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BidderLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownItems = [
    {
      label: 'Trang chủ',
      path: '/bidder/dashboard',
      icon: <LayoutDashboard size={16} />,
    },
    {
      label: 'Phiên tham gia',
      path: '/bidder/auctions',
      icon: <Gavel size={16} />,
    },
    {
      label: 'Lịch sử đấu giá',
      path: '/bidder/history',
      icon: <History size={16} />,
    },
    // {
    //   label: 'Đã thắng đấu giá',
    //   path: '/bidder/won',
    //   icon: <Trophy size={16} />,
    // },
  ];

  const isActivePath = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    setIsProfileOpen(false);
  };

  const handleGoManagement = () => {
    setIsProfileOpen(false);
    navigate('/seller/dashboard');
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="h-20 flex items-center justify-between gap-4">
            {/* Logo */}
            <button
              onClick={() => navigate('/bidder/dashboard')}
              className="flex items-center gap-3 shrink-0"
            >
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-sm">
                <Gavel size={20} />
              </div>

              <div className="text-left hidden sm:block">
                <p className="text-lg font-extrabold tracking-tight text-slate-900">
                  Auction
                </p>
                <p className="text-xs text-slate-500 -mt-1">Bidder Platform</p>
              </div>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Tìm phiên đấu giá, sản phẩm, thương hiệu..."
                  className="w-full h-12 pl-11 pr-28 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm text-slate-700 placeholder:text-slate-400 transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
                  Tìm
                </button>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 border-2 border-white" />
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white pl-2 pr-3 py-1.5 hover:bg-slate-50 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-slate-900 leading-none">
                      {user?.username || 'Người dùng'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Bidder</p>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60 py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">
                        {user?.username || 'Người dùng'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Tài khoản bidder
                      </p>
                    </div>

                    <div className="py-2">
                      {dropdownItems.map((item) => {
                        const active = isActivePath(item.path);

                        return (
                          <button
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                              active
                                ? 'bg-amber-50 text-amber-700 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            {item.icon}
                            {item.label}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handleNavigate('/profile')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <User size={16} />
                        Thông tin cá nhân
                      </button>

                      <button
                        onClick={handleGoManagement}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Gavel size={16} />
                        Trang quản lý
                      </button>
                    </div>

                    <div className="h-px bg-slate-100 my-1 mx-3" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <div className="pb-4 md:hidden">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Tìm phiên đấu giá..."
                className="w-full h-11 pl-11 pr-24 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold">
                Tìm
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default BidderLayout;
