import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gavel, User, LogOut, ChevronDown } from 'lucide-react';

const MainLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      {/* --- Navigation Bar --- */}
      <nav className="h-20 border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
          <div className="bg-slate-900 text-amber-400 p-2 rounded-xl group-hover:scale-105 transition-transform">
            <Gavel size={24} />
          </div>
          <span className="text-xl font-bold tracking-tighter">SUNNY<span className="text-amber-500">BID</span></span>
        </div>

        {/* Search & Links (Optional for later) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <button className="hover:text-slate-900 transition-colors">Auctions</button>
          <button className="hover:text-slate-900 transition-colors">Categories</button>
          <button className="hover:text-slate-900 transition-colors">How it works</button>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              {/* Seller Mode Button */}
              <button 
                onClick={() => navigate('/seller/dashboard')}
                className="hidden sm:block text-sm font-bold bg-slate-100 hover:bg-slate-200 py-2.5 px-5 rounded-full transition-all"
              >
                Seller Center
              </button>

              {/* User Dropdown/Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">{user?.username}</p>
                  <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Member</p>
                </div>
                <button className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </button>
                <button 
                  onClick={logout}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/login')}
                className="text-sm font-bold px-6 py-2.5 hover:text-slate-600 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
              >
                Join Now
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* --- Simple Footer --- */}
      <footer className="py-10 border-t border-slate-100 text-center text-slate-400 text-xs">
        © 2026 SunnyBid Auction Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;