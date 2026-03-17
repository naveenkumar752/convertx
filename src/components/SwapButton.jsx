import React from 'react';

const SwapButton = ({ onClick, disabled }) => {
  return (
    <div className="flex items-end justify-center pb-1">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label="Swap currencies"
        className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 text-slate-500 hover:text-aurora-indigo dark:hover:text-aurora-cyan shadow-glass-light dark:shadow-glass-dark hover:shadow-glow-indigo/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <svg 
          className="w-6 h-6 transform group-hover:rotate-180 transition-transform duration-700" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
          />
        </svg>
      </button>
    </div>
  );
};

export default SwapButton;
