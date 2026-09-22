import React, { useState } from 'react';
import { Check, X, CreditCard, Search, ArrowUpRight, ArrowDownLeft, Sliders, ShieldCheck } from 'lucide-react';
import { useRide } from '../../context/RideContext';

export const DriverTopUpControlTable: React.FC = () => {
  const {
    drivers,
    driverWallets,
    driverWalletTransactions,
    approveDriverTopUp,
    rejectDriverTopUp,
    adminAdjustDriverBalance,
    getDriverSlshBalance,
  } = useRide();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [adjustAmountInput, setAdjustAmountInput] = useState<string>('');
  const [adjustNote, setAdjustNote] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const filteredTransactions = driverWalletTransactions.filter((tx) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const d = drivers.find((drv) => drv.id === tx.driverId);
    return (
      tx.driverId.toLowerCase().includes(query) ||
      tx.id.toLowerCase().includes(query) ||
      (tx.referenceId && tx.referenceId.toLowerCase().includes(query)) ||
      (d && d.name.toLowerCase().includes(query)) ||
      (d && d.phone.toLowerCase().includes(query))
    );
  });

  const pendingTopUps = filteredTransactions.filter((tx) => tx.status === 'PENDING');

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId) {
      setFeedbackMsg('Please select a driver first.');
      return;
    }
    const val = parseInt(adjustAmountInput, 10);
    if (isNaN(val) || val < 0) {
      setFeedbackMsg('Please enter a valid non-negative SLSH balance.');
      return;
    }

    adminAdjustDriverBalance(selectedDriverId, val, adjustNote || 'Admin Control Manual Override');
    setFeedbackMsg(`Successfully updated driver balance to ${val.toLocaleString()} SLSH!`);
    setAdjustAmountInput('');
    setAdjustNote('');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-black uppercase">Pending Top-Ups</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <p className="text-3xl font-black text-amber-400 font-mono">
            {driverWalletTransactions.filter((tx) => tx.status === 'PENDING').length} Requests
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting manual admin verification</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-black uppercase">Total Fleet Float</span>
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-400 font-mono">
            {Object.values(driverWallets).reduce((acc, curr) => acc + (Number(curr) || 0), 0).toLocaleString()} SLSH
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Total driver prepaid float on platform</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-black uppercase">Commission Deductions</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono">
            {driverWalletTransactions.filter((tx) => tx.type === 'COMMISSION_DEDUCTION').length} Trips
          </p>
          <p className="text-[11px] text-slate-400 mt-1">1,000 SLSH per drop-off collected</p>
        </div>
      </div>

      {/* Manual Driver Balance Override Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Manual Driver Prepaid Balance Override (SLSH)</span>
        </h3>

        {feedbackMsg && (
          <div className="p-3 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold">
            {feedbackMsg}
          </div>
        )}

        <form onSubmit={handleAdjustBalance} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Driver</label>
            <select
              value={selectedDriverId}
              onChange={(e) => {
                setSelectedDriverId(e.target.value);
                if (e.target.value) {
                  setAdjustAmountInput(getDriverSlshBalance(e.target.value).toString());
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Choose Driver --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone}) - {getDriverSlshBalance(d.id).toLocaleString()} SLSH
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">New Balance (SLSH)</label>
            <input
              type="number"
              placeholder="e.g. 150000"
              value={adjustAmountInput}
              onChange={(e) => setAdjustAmountInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Admin Audit Note</label>
            <input
              type="text"
              placeholder="Reason for adjustment"
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-black py-2 rounded-xl transition active:scale-95"
            >
              Set Driver Balance
            </button>
          </div>
        </form>
      </div>

      {/* Pending Top-Up Verification Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
            Pending Top-Up Approvals ({pendingTopUps.length})
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by driver name, phone, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
          </div>
        </div>

        {pendingTopUps.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No pending top-up verification requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
                <tr>
                  <th className="py-2.5 px-3">Transaction Ref</th>
                  <th className="py-2.5 px-3">Driver Details</th>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Amount (SLSH)</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-bold">
                {pendingTopUps.map((tx) => {
                  const drv = drivers.find((d) => d.id === tx.driverId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono text-amber-400">{tx.referenceId || tx.id}</td>
                      <td className="py-3 px-3">
                        <p className="text-white">{drv?.name || tx.driverId}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{drv?.phone}</p>
                      </td>
                      <td className="py-3 px-3 uppercase text-slate-300">{tx.paymentProvider || 'ZAAD'}</td>
                      <td className="py-3 px-3 text-emerald-400 font-mono text-sm">
                        +{tx.amountSlsh.toLocaleString()} SLSH
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                        {tx.timestamp.substring(0, 16).replace('T', ' ')}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => approveDriverTopUp(tx.id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => rejectDriverTopUp(tx.id, 'Rejected by Admin Control')}
                          className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Master Driver Wallet Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
          All Wallet Activity Logs ({filteredTransactions.length})
        </h3>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black sticky top-0 bg-slate-900">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Title / Note</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-bold">
              {filteredTransactions.map((tx) => {
                const drv = drivers.find((d) => d.id === tx.driverId);
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        tx.type === 'TOPUP' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="text-white">{drv?.name || tx.driverId}</p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{tx.title}</td>
                    <td className={`py-2.5 px-3 font-mono ${tx.type === 'TOPUP' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'TOPUP' ? '+' : '-'}{tx.amountSlsh.toLocaleString()} SLSH
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] text-slate-400">{tx.status}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                      {tx.timestamp.substring(0, 16).replace('T', ' ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
