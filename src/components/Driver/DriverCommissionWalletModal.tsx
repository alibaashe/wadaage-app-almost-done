import { ArrowRight, AlertTriangle, Check, CheckCircle2, Copy, DollarSign, Lock, PhoneCall, RefreshCw, ShieldCheck, Wallet, X, FileText, ExternalLink } from 'lucide-react';
import React, { useState } from 'react';
import { useRide } from '../../context/RideContext';
import { formatCurrency, EXCHANGE_RATE_USD_TO_SLSH } from '../../utils/geo';

interface DriverCommissionWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriverCommissionWalletModal: React.FC<DriverCommissionWalletModalProps> = ({ isOpen, onClose }) => {
  const {
    driverWalletBalanceUsd,
    driverWalletTransactions,
    topUpDriverWallet,
    pricing,
    driverModeOnline,
  } = useRide();

  const [selectedAmount, setSelectedAmount] = useState<number>(1000); // Default 1,000 SOS ($0.10)
  const [provider, setProvider] = useState<'zaad' | 'evc' | 'edahab' | 'card'>('zaad');
  const [phone, setPhone] = useState<string>('0634112233');
  const [referenceId, setReferenceId] = useState<string>('');
  const [smsText, setSmsText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUSSD, setCopiedUSSD] = useState(false);

  if (!isOpen) return null;

  const minThresholdUsd = pricing.driverMinWalletThresholdUsd || 0.089;
  const minThresholdSos = Math.round(minThresholdUsd * EXCHANGE_RATE_USD_TO_SLSH); // 1,000 SLSH
  const currentSos = Math.round(driverWalletBalanceUsd * EXCHANGE_RATE_USD_TO_SLSH);
  const feeUsd = pricing.driverCommissionFeeUsd || 0.089;
  const feeSos = Math.round(feeUsd * EXCHANGE_RATE_USD_TO_SLSH); // 1,000 SLSH

  const isBelowMin = currentSos < minThresholdSos;

  // Dynamic USSD String Generator
  const merchantAccount = provider === 'zaad' ? '0636807814' : provider === 'edahab' ? '0656807814' : provider === 'evc' ? '0613680781' : '';
  const ussdCode = provider === 'zaad'
    ? `*880*0636807814*${selectedAmount}#`
    : provider === 'edahab'
    ? `*770*0656807814*${selectedAmount}#`
    : provider === 'evc'
    ? `*770*0613680781*${(selectedAmount / EXCHANGE_RATE_USD_TO_SLSH).toFixed(2)}#`
    : '';

  const handleCopyUSSD = () => {
    if (!ussdCode) return;
    navigator.clipboard.writeText(ussdCode);
    setCopiedUSSD(true);
    setTimeout(() => setCopiedUSSD(false), 2500);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAmount <= 0) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    setTimeout(() => {
      const result = topUpDriverWallet(selectedAmount, provider, phone, referenceId, smsText);
      setIsProcessing(false);
      if (result.success) {
        setSuccessMsg(result.message);
        setReferenceId('');
        setSmsText('');
        setTimeout(() => {
          setSuccessMsg(null);
        }, 4000);
      } else {
        setErrorMsg(result.message);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                Driver Prepaid Commission Wallet
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  Wadaage Driver
                </span>
              </h3>
              <p className="text-xs text-slate-400">1,000 SOS ($0.10 USD) per Trip • ZAAD 0636807814 / eDahab 0656807814</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Current Wallet Balance Card */}
          <div className={`p-4 rounded-2xl border ${
            isBelowMin
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Driver Prepaid Balance</span>
              {isBelowMin ? (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> BLOCKED (&lt; 1,000 SOS)
                </span>
              ) : (
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE / ONLINE ALLOWED
                </span>
              )}
            </div>

            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-black text-white font-mono">
                {currentSos.toLocaleString()} SOS
              </span>
              <span className="text-sm font-bold text-emerald-400">
                (${driverWalletBalanceUsd.toFixed(2)} USD)
              </span>
            </div>

            {/* Threshold Warning Banner if blocked */}
            {isBelowMin && (
              <div className="mt-3 p-3 bg-rose-500/20 rounded-xl border border-rose-500/30 text-xs text-rose-300 font-medium space-y-1">
                <div className="font-extrabold flex items-center gap-1 text-rose-200">
                  <Lock className="w-4 h-4 text-rose-400" />
                  Account Inactive / Online Lockout
                </div>
                <p className="text-[11px] text-rose-300/90">
                  Your prepaid balance is below <b>1,000 SOS ($0.10 USD)</b>. Dial USSD code below to transfer funds to <b>0636807814</b> (ZAAD) or <b>0656807814</b> (eDahab) to activate your account!
                </p>
              </div>
            )}
          </div>

          {/* Dedicated Account Deposit & Interactive USSD Dialer Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block">
                Official Merchant Payment Gateway:
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Verified Gateway Account
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 font-extrabold block text-xs">📱 Telesom ZAAD</span>
                  <span className="text-white font-mono font-black text-sm">0636807814</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded font-bold font-mono">*880#</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-yellow-500/30 flex items-center justify-between">
                <div>
                  <span className="text-yellow-400 font-extrabold block text-xs">📱 Somtel eDahab</span>
                  <span className="text-white font-mono font-black text-sm">0656807814</span>
                </div>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded font-bold font-mono">*770#</span>
              </div>
            </div>

            {/* DYNAMIC USSD DIALING BANNER (Matches user screenshot format) */}
            {provider !== 'card' && ussdCode && (
              <div className="p-3.5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 rounded-xl border border-emerald-500/50 space-y-2">
                <div className="text-[10px] uppercase font-extrabold text-slate-400 flex items-center justify-between">
                  <span>Dynamic USSD Dial Code (Selected {selectedAmount.toLocaleString()} SOS):</span>
                  {copiedUSSD && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Copied Code!
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-wider">
                    {ussdCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUSSD}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition text-xs font-bold flex items-center gap-1"
                    title="Copy USSD Code"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${encodeURIComponent(ussdCode)}`}
                    className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg uppercase tracking-wider"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Dial {ussdCode}</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyUSSD}
                    className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copy String to Phone</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Top-Up Form */}
          <form onSubmit={handleTopUpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Select Prepaid Amount to Add to Wallet:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { sos: 1000, usd: 0.089, trips: '1 Trip Charge' },
                  { sos: 5000, usd: 0.44, trips: '5 Trips' },
                  { sos: 10000, usd: 0.89, trips: '10 Trips' },
                  { sos: 50000, usd: 4.44, trips: '50 Trips' },
                ].map((item) => (
                  <button
                    key={item.sos}
                    type="button"
                    onClick={() => setSelectedAmount(item.sos)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black transition border text-center ${
                      selectedAmount === item.sos
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md scale-[1.02]'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <div>{item.sos.toLocaleString()} SOS</div>
                    <div className="text-[10px] opacity-80">${item.usd.toFixed(2)} ({item.trips})</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Select Payment Method:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setProvider('zaad')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition ${
                    provider === 'zaad'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-extrabold text-white text-xs">ZAAD</span>
                  <span className="text-[10px] text-emerald-400 font-mono">0636807814</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('edahab')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition ${
                    provider === 'edahab'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-extrabold text-white text-xs">eDahab</span>
                  <span className="text-[10px] text-yellow-400 font-mono">0656807814</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('evc')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition ${
                    provider === 'evc'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-extrabold text-white text-xs">EVC Plus</span>
                  <span className="text-[9px] text-amber-400">*770#</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('card')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition ${
                    provider === 'card'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-extrabold text-white text-xs">Card</span>
                  <span className="text-[9px] text-blue-400">Mastercard/Visa</span>
                </button>
              </div>
            </div>

            {/* Phone Number Input */}
            {provider !== 'card' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Driver Mobile Number ({provider === 'zaad' ? 'ZAAD 063...' : provider === 'edahab' ? 'eDahab 065...' : 'Mobile'}):
                  </label>
                  <div className="relative">
                    <PhoneCall className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={provider === 'zaad' ? '0634112233' : '0654112233'}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Transaction Ref ID / SMS Receipt:</span>
                    <span className="text-[10px] text-emerald-400">Auto-Verified</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      placeholder="e.g. 9812401 or Ref ID"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </span>
                <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 uppercase tracking-wider"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Mobile Gateway & Activating Driver...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify {selectedAmount.toLocaleString()} SOS (${(selectedAmount/10000).toFixed(2)}) & Activate Driver</span>
                </>
              )}
            </button>
          </form>

          {/* Wallet Transaction Log */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Commission Wallet Transactions Log</span>
              <span className="text-[10px] text-slate-500 font-mono">Merchant 0636807814</span>
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {driverWalletTransactions.map((tx) => {
                const isPending = tx.status === 'pending_verification';
                const isCompleted = tx.status === 'completed';
                const isRejected = tx.status === 'rejected';

                return (
                  <div
                    key={tx.id}
                    className={`p-2.5 rounded-xl border text-xs ${
                      isPending
                        ? 'bg-amber-950/30 border-amber-500/40'
                        : isRejected
                        ? 'bg-rose-950/30 border-rose-500/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-white block">{tx.title}</span>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isPending
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isCompleted ? 'VERIFIED' : isPending ? 'PENDING ADMIN CHECK' : 'REJECTED'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                          <span>{tx.date}</span>
                          {tx.referenceId && (
                            <span className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                              Ref: {tx.referenceId}
                            </span>
                          )}
                          {tx.adminNote && (
                            <span className="text-amber-300 font-medium">({tx.adminNote})</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-black font-mono block ${
                            tx.amountUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.amountUsd >= 0 ? '+' : ''}
                          {tx.amountSos.toLocaleString()} SOS
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          (${Math.abs(tx.amountUsd).toFixed(2)})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
