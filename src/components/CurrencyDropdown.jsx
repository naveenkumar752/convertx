import React, { useState, useRef, useEffect } from 'react';
import { CURRENCIES } from '../utils/currencyList';

const CurrencyDropdown = ({ label, value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedCurrency = CURRENCIES.find(c => c.code === value) || CURRENCIES[0];

  const filteredCurrencies = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 min-w-[140px]" ref={dropdownRef}>
      <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 mb-2 ml-1 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl shadow-glass-light dark:shadow-glass-dark hover:border-aurora-indigo/30 dark:hover:border-aurora-cyan/30 transition-all duration-300 focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl shadow-sm">{selectedCurrency.flag}</span>
            <span className="font-black text-slate-800 dark:text-white tracking-tight">{selectedCurrency.code}</span>
          </div>
          <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-aurora-indigo' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xxl border border-white/20 dark:border-white/10 rounded-[2rem] shadow-glass-dark dark:shadow-2xl overflow-hidden animate-slide-up ring-1 ring-slate-900/5">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-aurora-indigo/20 focus:border-aurora-indigo/40 focus:outline-none placeholder:text-slate-400 text-slate-700 dark:text-slate-200 transition-all"
              />
            </div>
            <div className="max-h-60 overflow-y-auto scrollbar-hide p-2">
              {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => {
                      onChange(currency.code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-aurora-indigo/10 dark:hover:bg-aurora-cyan/10 transition-all duration-200 group ${value === currency.code ? 'bg-aurora-indigo/5 dark:bg-aurora-cyan/5 text-aurora-indigo dark:text-aurora-cyan font-black' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{currency.flag}</span>
                    <div className="text-left">
                      <div className="text-sm font-black uppercase tracking-tight">{currency.code}</div>
                      <div className="text-[11px] opacity-60 font-medium truncate max-w-[120px]">{currency.name}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-slate-400 font-medium">No results found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyDropdown;
