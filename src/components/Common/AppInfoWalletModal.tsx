import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, DollarSign, Info, Phone,
  ShieldCheck, Smartphone, User, Users, Wallet, X, Car, Award, Zap, RefreshCw, CreditCard, Copy, FileText, Check
} from 'lucide-react';
import { useRide } from '../../context/RideContext';
import { formatCurrency } from '../../utils/geo';

interface AppInfoWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppInfoWalletModal: React.FC<AppInfoWalletModalProps> = ({ isOpen, onClose }) => {
  const {
    driverModeOnline,
    toggleDriverOnline,
    drivers,
    language,
    currentUser,
  } = useRide();

  if (!isOpen) return null;

  const currentDriver = drivers.find((d) => d.phone === currentUser?.phone || d.id === currentUser?.id) || drivers[0] || {
    id: currentUser?.id || 'drv_live',
    name: currentUser?.name || 'Driver Partner',
    phone: currentUser?.phone || '+252 63 6807814',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    totalTrips: 0,
    vehicle: { model: 'Toyota Vitz', licensePlate: 'SL-39201', color: 'White' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-1.5 font-serif">
                Wadaage App & Driver Wallet Info
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'so' ? 'Hogaanka Akoonka & Zaad-ka Darawalka' : 'Fleet Activation Wallet & System Status'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar text-xs">

          {/* Driver Profile & Online Activation Banner */}
          <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img
                  src={currentDriver.avatar}
                  alt={currentDriver.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-white">{currentDriver.name}</h4>
                  <p className="text-[10px] text-slate-400">
                    {currentDriver.vehicle.model} • <span className="font-mono text-emerald-400">{currentDriver.vehicle.licensePlate}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-400 flex items-center justify-end gap-1">
                  ★ {currentDriver.rating}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Verified Driver</span>
              </div>
            </div>

            {/* Online Status Toggle inside 3-dots */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span className="text-slate-300 font-bold">
                {language === 'so' ? 'Xaalada Darawalka:' : 'Driver Trip Status:'}
              </span>
              <button
                onClick={() => toggleDriverOnline(!driverModeOnline)}
                className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition flex items-center space-x-1.5 ${
                  driverModeOnline
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'bg-rose-500 text-white'
                }`}
              >
                <span>{driverModeOnline ? '● ONLINE (ACTIVATED)' : '○ OFFLINE'}</span>
              </button>
            </div>
          </div>

          {/* TRIP ORDERS & SERVICE TYPES GUIDE */}
          <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-2">
            <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-400" />
              {language === 'so' ? 'Qeexida Dalbadyada Wadaage' : 'Wadaage Trip Order Categories'}
            </h4>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 bg-slate-900 rounded-xl flex items-center justify-between border border-indigo-500/30">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="font-bold text-white block">Wadaage Share (Gaadhi Wadaag Engine)</span>
                    <span className="text-[10px] text-slate-400">Vector matching (&lt;30°) • 1.0km dest radius • 0.5km share lock</span>
                  </div>
                </div>
                <span className="bg-indigo-600 text-white font-black text-[9px] px-2 py-0.5 rounded">
                  Carpool
                </span>
              </div>

              <div className="p-2 bg-slate-900 rounded-xl flex items-center justify-between border border-emerald-500/30">
                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white block">Wadaage Normal Taxi</span>
                    <span className="text-[10px] text-slate-400">Standard private city ride</span>
                  </div>
                </div>
                <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded">
                  Taxi
                </span>
              </div>

              <div className="p-2 bg-slate-900 rounded-xl flex items-center justify-between border border-amber-500/30">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-white block">Wadaage VIP</span>
                    <span className="text-[10px] text-slate-400">Executive sedan & luxury SUV</span>
                  </div>
                </div>
                <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded">
                  VIP
                </span>
              </div>

              <div className="p-2 bg-slate-900 rounded-xl flex items-center justify-between border border-purple-500/30">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="font-bold text-white block">Wadaage Moto / Bajaj</span>
                    <span className="text-[10px] text-slate-400">Fast 2/3 wheeler bajaj ride</span>
                  </div>
                </div>
                <span className="bg-purple-600 text-white font-black text-[9px] px-2 py-0.5 rounded">
                  Moto
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center text-[10px] text-slate-400 space-y-1">
            <p className="flex items-center justify-center gap-1 font-bold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Wadaage Somaliland Transport Platform
            </p>
            <p>Support Hotline: *999# or +252 63 4443322</p>
          </div>
        </div>
      </div>
    </div>
  );
};
