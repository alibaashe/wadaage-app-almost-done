import { Banknote, CheckCircle2, CreditCard, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import React, { useState } from 'react';
import { useRide } from '../../context/RideContext';
import { formatCurrency } from '../../utils/geo';
import { WadaageDriverWalletModal } from './WadaageDriverWalletModal';

export const DriverEarningsView: React.FC = () => {
  const { drivers, currentUser, getDriverSlshBalance, driverWalletTransactions } = useRide();
  const [showWalletModal, setShowWalletModal] = useState(false);
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
      {/* V2 Prepaid Driver SLSH Balance Card */}
      <div className="bg-gradient-to-br from-blue-900/90 via-slate-900 to-slate-900 text-white rounded-2xl p-6 border border-blue-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-blue-300 uppercase font-black tracking-wider flex items-center space-x-1">
              <CreditCard className="w-3.5 h-3.5 text-blue-400 inline mr-1" />
              <span>WADAAGE PREPAID SLSH BALANCE</span>
            </span>
            <div className="text-3xl font-black text-white tracking-tight mt-1 font-mono">
              {getDriverSlshBalance(currentUser?.id || 'drv_01').toLocaleString()} SLSH
            </div>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              ≈ ${(getDriverSlshBalance(currentUser?.id || 'drv_01') / 10000).toFixed(2)} USD
            </p>
          </div>
          <button
            onClick={() => setShowWalletModal(true)}
            className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg flex items-center space-x-1.5 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>TOP UP BALANCE</span>
          </button>
        </div>

        {getDriverSlshBalance(currentUser?.id || 'drv_01') < 0 && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold">
            ⚠️ Low / Negative Prepaid Balance lockout active! Please top up via ZAAD or eDahab to remain online.
          </div>
        )}
      </div>

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

      {/* Recent Driver Prepaid Transactions Ledger */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          Recent Commission & Top-Up Ledger
        </h4>
        <div className="space-y-2">
          {driverWalletTransactions
            .filter((tx) => tx.driverId === (currentUser?.id || 'drv_01') || tx.driverId === 'drv_01')
            .slice(0, 5)
            .map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                    tx.type === 'TOPUP' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {tx.type === 'TOPUP' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-white">{tx.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{tx.timestamp.substring(0, 16).replace('T', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black font-mono ${tx.type === 'TOPUP' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'TOPUP' ? '+' : '-'}{tx.amountSlsh.toLocaleString()} SLSH
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{tx.status}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <WadaageDriverWalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  );
};
