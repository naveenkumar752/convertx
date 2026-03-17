import React from 'react';
import { getCurrency, CURRENCIES } from '../utils/currencyList';

const ComparisonList = ({ baseCode, rates }) => {
  const baseCurrency = getCurrency(baseCode);
  
  // Select a mix of 8 major global currencies for comparison
  const COMPARISON_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF'].filter(c => c !== baseCode);

  return (
    <div className="glass-card">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 tracking-tight">Compare 1 {baseCode}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COMPARISON_CODES.map(code => {
          const currency = getCurrency(code);
          const rate = rates[code];
          
          return (
            <div 
              key={code} 
              className="group flex items-center justify-between p-4 rounded-2xl bg-white/30 dark:bg-white/[0.03] border border-white/20 dark:border-white/5 hover:border-aurora-indigo/20 dark:hover:border-aurora-cyan/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg group-hover:scale-110 transition-transform">{currency?.flag}</span>
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{code}</span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                {rate ? rate.toFixed(4) : '---'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonList;
