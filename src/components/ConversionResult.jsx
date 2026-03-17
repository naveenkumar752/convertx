import React, { useState } from 'react';
import { getCurrency } from '../utils/currencyList';

const ConversionResult = ({ amount, from, to, result, rate, lastUpdated, loading, error }) => {
  const [copied, setCopied] = useState(false);
  
  const fromCurrency = getCurrency(from);
  const toCurrency = getCurrency(to);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center animate-pulse-soft">
        <p className="text-slate-400 font-bold tracking-tight">Syncing Market Rates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-700 dark:text-red-400 font-medium text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm font-semibold text-red-600 hover:text-red-700 underline"
        >
          Try refreshing
        </button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="animate-fade-in">
      <div className="relative group p-8 sm:p-10 bg-white/30 dark:bg-white/[0.03] backdrop-blur-xxl border border-white/40 dark:border-white/5 rounded-[2.5rem] transition-all duration-500 hover:shadow-glow-indigo/10">
        {/* Glowing Background Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-aurora-indigo/5 dark:bg-aurora-cyan/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-2 mb-8">
          <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">
            Market Exchange
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
            <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              <span className="opacity-40 font-bold mr-2">{amount} {fromCurrency?.code}</span>
              <span className="block sm:inline mt-2 sm:mt-0 gradient-text">
                {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-2xl sm:text-3xl ml-2 font-black opacity-30">{toCurrency?.code}</span>
            </h2>
            
            <button
              onClick={handleCopy}
              className={`inline-flex items-center justify-center p-3 rounded-2xl transition-all duration-300 self-start sm:self-auto mb-1 ${copied ? 'bg-emerald-500 text-white shadow-glow-indigo' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-110 shadow-xl'}`}
              title="Copy result"
            >
              {copied ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-glow-indigo"></div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-tight">
              1 {from} = <span className="text-slate-900 dark:text-white font-black">{rate.toFixed(4)} {to}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Updated: {lastUpdated}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionResult;
