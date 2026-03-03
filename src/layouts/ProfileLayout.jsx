import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { User, MapPin, Settings, Menu } from 'lucide-react';

const ProfileLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      icon: <User size={20} />,
      label: 'Thông tin cá nhân',
      path: '/profile',
    },
    {
      icon: <MapPin size={20} />,
      label: 'Địa chỉ',
      path: '/profile/address',
    },
    {
      icon: <Settings size={20} />,
      label: 'Cài đặt',
      path: '/profile/settings',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-slate-900 transition-all duration-300 flex flex-col fixed inset-y-0 z-50`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          {!isCollapsed && (
            <span className="text-white font-bold tracking-tight text-lg">
              TÀI KHOẢN
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
        </div>

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

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center">
          <h2 className="text-lg font-bold text-slate-800">
            Tài khoản của tôi
          </h2>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProfileLayout;
