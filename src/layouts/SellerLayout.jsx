import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Gavel,
  LogOut,
  ChevronLeft,
  Menu,
  Bell,
  User,
  Package,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SellerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const menuItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: 'Tổng quan',
      path: '/seller/dashboard',
    },
    {
      icon: <Gavel size={20} />,
      label: 'Phiên đấu giá của tôi',
      path: '/seller/auctions',
    },
    {
      icon: <Package size={20} />,
      label: 'Sản phẩm',
      path: '/seller/products',
    },
    {
      icon: <DollarSign size={20} />,
      label: 'Doanh thu',
      path: '/seller/revenue',
    },
  ];

  const handleGoDashboard = () => {
    setIsProfileOpen(false);
    navigate('/home/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* --- Sidebar --- */}
      <aside
        className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 transition-all duration-300 flex flex-col fixed inset-y-0 z-50`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          {!isCollapsed && (
            <span className="text-white font-bold tracking-tighter text-xl">
              MENU
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 space-y-2 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-900 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* --- Main Content Area --- */}
      <main
        className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}
      >
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Seller Dashboard
          </h2>

          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
              >
                {/* Avatar Circle */}
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Username & Role */}
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    {user?.username}
                  </p>
                </div>

                <ChevronLeft
                  size={14}
                  className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? '-rotate-90' : ''}`}
                />
              </button>

              {/* Dropdown Menu Items */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 py-2 z-50 animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={handleGoDashboard}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Gavel size={16} />
                    Trang đấu giá
                  </button>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <User size={16} />
                    Thông tin cá nhân
                  </button>

                  <div className="h-px bg-slate-50 my-1 mx-2"></div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:font-bold transition-all"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SellerLayout;
