import { Banknote, CheckCircle2, DollarSign, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { useRide } from '../../context/RideContext';
import { formatCurrency } from '../../utils/geo';

export const DriverEarningsView: React.FC = () => {
  const { drivers, currentUser } = useRide();
  const driver = drivers.find((d) => d.phone === currentUser?.phone || d.id === currentUser?.id) || drivers[0] || {
    id: currentUser?.id || 'drv_live',
    name: currentUser?.name || 'Driver Partner',
    phone: currentUser?.phone || '',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    totalTrips: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    hoursOnline: 0,
    acceptanceRate: 100,
  };
  const [cashoutSuccess, setCashoutSuccess] = useState(false);

  const handleCashout = () => {
    setCashoutSuccess(true);
    setTimeout(() => setCashoutSuccess(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Earnings Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              Weekly Gross Driver Revenue
            </span>
            <div className="text-3xl font-black text-emerald-400 tracking-tight mt-1">
              {formatCurrency(driver.weeklyEarnings)}
            </div>
          </div>
          <button
            onClick={handleCashout}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg flex items-center space-x-1.5 transition-transform active:scale-95"
          >
            <Banknote className="w-4 h-4" />
            <span>ZAAD / eDAHAB CASHOUT</span>
          </button>
        </div>

        {cashoutSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{formatCurrency(driver.weeklyEarnings)} transferred via ZAAD Services!</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/80 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Today's Net</span>
            <span className="font-bold text-white text-sm">{formatCurrency(driver.todayEarnings)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Trips Done</span>
            <span className="font-bold text-white text-sm">{driver.totalTrips} rides</span>
          </div>
        </div>
      </div>
    </div>
  );
};
