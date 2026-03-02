import React from 'react';
import { DollarSign, Package, Users, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${color}`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1 text-green-500 text-xs font-bold">
      <TrendingUp size={14} />
      <span>+12.5% from last month</span>
    </div>
  </div>
);

const SellerDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Welcome back, Seller!</h1>
        <p className="text-slate-500">Here's what's happening with your auctions today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="$45,200" icon={<DollarSign size={20}/>} color="bg-green-100 text-green-600" />
        <StatCard title="Active Auctions" value="12" icon={<Package size={20}/>} color="bg-blue-100 text-blue-600" />
        <StatCard title="Total Bidders" value="1,240" icon={<Users size={20}/>} color="bg-purple-100 text-purple-600" />
        <StatCard title="Avg. Bid Increase" value="24%" icon={<TrendingUp size={20}/>} color="bg-amber-100 text-amber-600" />
      </div>

      {/* Placeholder for Recent Activity */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8">
        <h3 className="text-lg font-bold mb-4">Recent Auctions</h3>
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
          No recent activity found. Start by creating a new auction!
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;