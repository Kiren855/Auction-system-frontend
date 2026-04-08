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
  Wallet,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { paymentApi } from '../api/paymentApi';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getResponseData = (response) =>
  response?.result || response?.data?.result;

const BidderLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';

    if (location.pathname === '/bidder/search') {
      setSearchKeyword(keyword);
    }
  }, [location.pathname, location.search]);

  // Tách API gọi ví ra một hàm riêng biệt để tái sử dụng nhiều nơi
  const fetchWallet = async () => {
    try {
      setWalletLoading(true);
      const response = await paymentApi.getMyWallet();
      const result = getResponseData(response);
      setWallet(result || null);
    } catch (error) {
      console.error('Get wallet failed:', error);
      setWallet(null);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const dropdownItems = [
    {
      label: 'Trang chủ',
      path: '/dashboard',
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

  const handleSearch = () => {
    const trimmed = searchKeyword.trim();
    if (!trimmed) return;

    navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-20 items-center justify-between gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex shrink-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-amber-400 shadow-sm">
                <Gavel size={20} />
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-lg font-extrabold tracking-tight text-slate-900">
                  Auction
                </p>
                <p className="-mt-1 text-xs text-slate-500">Bidder Platform</p>
              </div>
            </button>

            <div className="hidden max-w-2xl flex-1 md:block">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Tìm phiên đấu giá, sản phẩm, thương hiệu..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-28 text-sm text-slate-700 placeholder:text-slate-400 transition-all focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 h-9 -translate-y-1/2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Tìm
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button className="relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                <Bell size={20} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-amber-500" />
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-1.5 pl-2 pr-3 transition-all hover:bg-slate-50"
                >
                  <div className="h-10 w-10 overflow-hidden rounded-xl shadow-sm">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-900 font-bold text-amber-400">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  <div className="hidden min-w-0 text-left sm:block">
                    <p className="truncate text-sm font-bold leading-none text-slate-900">
                      {user?.username || 'Người dùng'}
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                      <Wallet size={12} />
                      {walletLoading ? (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Loader2 size={12} className="animate-spin" />
                          Đang tải ví...
                        </span>
                      ) : (
                        <span className="truncate font-medium">
                          {formatCurrency(wallet?.availableBalance || 0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl shadow-slate-200/60">
                    <div className="border-b border-slate-100 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-xl shadow-sm">
                          {user?.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt="avatar"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-900 font-bold text-amber-400">
                              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {user?.username || 'Người dùng'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      {dropdownItems.map((item) => {
                        const active = isActivePath(item.path);

                        return (
                          <button
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors ${
                              active
                                ? 'bg-amber-50 font-semibold text-amber-700'
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
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        <User size={16} />
                        Thông tin cá nhân
                      </button>

                      <button
                        onClick={handleGoManagement}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Gavel size={16} />
                        Trang quản lý
                      </button>
                    </div>

                    <div className="mx-3 my-1 h-px bg-slate-100" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pb-4 md:hidden">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm phiên đấu giá..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-24 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
              >
                Tìm
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Đẩy context xuống các trang con nằm trong Outlet */}
        <Outlet context={{ refreshWallet: fetchWallet }} />
      </main>
    </div>
  );
};

export default BidderLayout;
