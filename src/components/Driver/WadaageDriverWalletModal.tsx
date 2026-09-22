import React, { useState } from 'react';
import { X, CreditCard, ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, AlertCircle, Send, DollarSign } from 'lucide-react';
import { useRide } from '../../context/RideContext';

interface WadaageDriverWalletModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const WadaageDriverWalletModal: React.FC<WadaageDriverWalletModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, driverWallets, getDriverSlshBalance, driverWalletTransactions, requestDriverTopUp } = useRide();
  const [topUpAmountSlsh, setTopUpAmountSlsh] = useState<number>(50000);
  const [paymentProvider, setPaymentProvider] = useState<'zaad' | 'edahab' | 'evc'>('zaad');
  const [referenceId, setReferenceId] = useState<string>('');
  const [submittedTxId, setSubmittedTxId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'topup' | 'history'>('topup');

  if (!isOpen) return null;

  const driverId = currentUser?.id || 'drv_01';
  const currentBalanceSlsh =
    driverWallets[currentUser?.id || ''] ??
    driverWallets[currentUser?.phone || ''] ??
    getDriverSlshBalance(driverId);
  const currentBalanceUsd = currentBalanceSlsh / 10000;

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceId.trim()) {
      alert('Please enter your ZAAD/eDahab transaction reference number.');
      return;
    }

    const tx = requestDriverTopUp(driverId, topUpAmountSlsh, paymentProvider, referenceId.trim());
    setSubmittedTxId(tx.id);
    setReferenceId('');
    setTimeout(() => {
      setSubmittedTxId(null);
      setActiveTab('history');
    }, 2000);
  };

  const driverTxs = driverWalletTransactions.filter(
    (tx) => tx.driverId === driverId || tx.driverId === 'drv_01' || tx.driverId === 'live_driver'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide">Driver Prepaid SLSH Wallet</h3>
              <p className="text-xs text-slate-400 font-medium">Real-time Commission & Top-Up Center</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Balance Display Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/80 via-slate-900 to-slate-900 border border-blue-500/30 text-white space-y-2">
            <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider">
              Wadaage Prepaid Balance
            </span>
            <div className="text-3xl font-black font-mono text-white tracking-tight">
              {Number(currentBalanceSlsh).toLocaleString()} SLSH
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold pt-1 border-t border-slate-800">
              <span>Equivalent USD Value:</span>
              <span className="text-emerald-400 font-mono text-sm">${currentBalanceUsd.toFixed(2)} USD</span>
            </div>
            {currentBalanceSlsh < 0 && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Account locked! Top up at least 1,000 SLSH to go online.</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/60">
            <button
              onClick={() => setActiveTab('topup')}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                activeTab === 'topup' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top Up Balance
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Transaction History ({driverTxs.length})
            </button>
          </div>

          {activeTab === 'topup' ? (
            /* Top Up Form */
            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Select Payment Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('zaad')}
                    className={`p-3 rounded-xl border text-xs font-black transition-all flex flex-col items-center space-y-1 ${
                      paymentProvider === 'zaad'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>ZAAD Services</span>
                    <span className="text-[10px] text-slate-400 font-mono">*388#</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('edahab')}
                    className={`p-3 rounded-xl border text-xs font-black transition-all flex flex-col items-center space-y-1 ${
                      paymentProvider === 'edahab'
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>eDahab</span>
                    <span className="text-[10px] text-slate-400 font-mono">*712#</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('evc')}
                    className={`p-3 rounded-xl border text-xs font-black transition-all flex flex-col items-center space-y-1 ${
                      paymentProvider === 'evc'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>EVC Plus</span>
                    <span className="text-[10px] text-slate-400 font-mono">*770#</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  2. Select Top-Up Amount (SLSH)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[20000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmountSlsh(amt)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black font-mono transition-all ${
                        topUpAmountSlsh === amt
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {amt.toLocaleString()} SLSH
                      <span className="block text-[9px] text-slate-400 font-sans font-normal">
                        (${(amt / 10000).toFixed(2)})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  3. Payment Reference Number
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. REF-829104 or Mobile Tx ID"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {submittedTxId ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Top-Up request submitted! Pending admin verification.</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Top-Up Request</span>
                </button>
              )}
            </form>
          ) : (
            /* Transaction History List */
            <div className="space-y-2">
              {driverTxs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-medium">
                  No driver transactions recorded yet.
                </div>
              ) : (
                driverTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          tx.type === 'TOPUP'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tx.type === 'TOPUP' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-white">{tx.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {tx.timestamp.substring(0, 16).replace('T', ' ')}
                          {tx.referenceId && ` • Ref: ${tx.referenceId}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-black font-mono ${
                          tx.type === 'TOPUP' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'TOPUP' ? '+' : '-'}{tx.amountSlsh.toLocaleString()} SLSH
                      </p>
                      <div className="flex items-center justify-end space-x-1 text-[10px] mt-0.5">
                        {tx.status === 'APPROVED' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                        {tx.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-400 animate-spin" />}
                        {tx.status === 'REJECTED' && <AlertCircle className="w-3 h-3 text-rose-400" />}
                        <span
                          className={`font-bold uppercase ${
                            tx.status === 'APPROVED'
                              ? 'text-emerald-400'
                              : tx.status === 'PENDING'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
