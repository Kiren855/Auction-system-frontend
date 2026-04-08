import { useMemo, useState } from 'react';
import { Wallet, History } from 'lucide-react';
import TopupTab from './TopupTab';
import TransactionHistoryTab from './TransactionHistoryTab';

const TABS = [
  {
    key: 'topup',
    label: 'Nạp tiền',
    icon: Wallet,
  },
  {
    key: 'history',
    label: 'Lịch sử giao dịch',
    icon: History,
  },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('topup');

  const activeTabContent = useMemo(() => {
    if (activeTab === 'history') {
      return <TransactionHistoryTab />;
    }

    return <TopupTab />;
  }, [activeTab]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex h-9 items-center gap-2 rounded-md px-5 text-sm font-bold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTabContent}
      </div>
    </div>
  );
}
