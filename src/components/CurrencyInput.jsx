import React from 'react';

const CurrencyInput = ({ value, onChange, label, disabled }) => {
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    let val = e.target.value;
    
    // 1. Restrict to numeric and decimal only
    val = val.replace(/[^0-9.]/g, '');
    
    // 2. Ensure only one decimal point
    const decimalCount = (val.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = val.split('.');
      val = parts[0] + '.' + parts.slice(1).join('');
    }

    // 3. Restrict length to 10
    if (val.length > 10) {
      val = val.substring(0, 10);
    }
    
    setInputValue(val);
    
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else if (val === '') {
      onChange(0);
    }
  };

  return (
    <div className="flex-1 min-w-[180px]">
      <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 mb-2 ml-1 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative group">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="0.00"
          className="w-full px-5 py-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl text-2xl font-black text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none focus:ring-0 focus:border-aurora-indigo/50 dark:focus:border-aurora-cyan/50 shadow-glass-light dark:shadow-glass-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed no-spinner selection:bg-aurora-indigo/20"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-all duration-300 transform scale-50 group-focus-within:scale-100">
          <div className="w-1.5 h-1.5 rounded-full bg-aurora-indigo dark:bg-aurora-cyan shadow-glow-indigo"></div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyInput;
