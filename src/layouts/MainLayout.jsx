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
          <span className="text-xl font-bold tracking-tighter">
            SUNNY<span className="text-amber-500">BID</span>
          </span>
        </div>

        {/* Search & Links (Optional for later) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <button className="hover:text-slate-900 transition-colors">
            Auctions
          </button>
          <button className="hover:text-slate-900 transition-colors">
            Categories
          </button>
          <button className="hover:text-slate-900 transition-colors">
            How it works
          </button>
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
