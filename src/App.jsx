import React, { useState, useEffect, useCallback } from 'react';
import CurrencyInput from './components/CurrencyInput';
import CurrencyDropdown from './components/CurrencyDropdown';
import SwapButton from './components/SwapButton';
import ConversionResult from './components/ConversionResult';
import HistoricalChart from './components/HistoricalChart';
import ComparisonList from './components/ComparisonList';
import { fetchRates, convertCurrency, fetchPopularRates, fetchHistoricalData } from './utils/fetchRates';
import { CURRENCIES, POPULAR_CURRENCIES, POPULAR_PAIRS, getCurrency } from './utils/currencyList';

const App = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [popularRates, setPopularRates] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [markup, setMarkup] = useState(0); // Bank fee markup
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [comparisonRates, setComparisonRates] = useState({});
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const loadInitialData = async () => {
    try {
      const rates = await fetchPopularRates(POPULAR_PAIRS);
      setPopularRates(rates);
    } catch (err) {
      console.error('Failed to fetch initial data', err);
    }
  };

  const loadHistoryAndComparison = useCallback(async () => {
    setChartLoading(true);
    try {
      // Fetch historical data
      const history = await fetchHistoricalData(fromCurrency, toCurrency);
      setChartData(history);
      
      // Fetch all rates for comparison list
      const baseRates = await fetchRates(fromCurrency);
      setComparisonRates(baseRates.rates);
    } catch (err) {
      console.error('Failed to fetch chart/comparison data', err);
    } finally {
      setChartLoading(false);
    }
  }, [fromCurrency, toCurrency]);

  const handleConversion = useCallback(async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await convertCurrency(parseFloat(amount), fromCurrency, toCurrency);
      
      // Apply bank markup if any
      const finalResult = data.result * (1 - markup / 100);
      const finalRate = data.rate * (1 - markup / 100);
      
      setResult(finalResult);
      setRate(finalRate);
      setLastUpdated(data.date);
      
      // Update history
      setHistory(prev => {
        const entry = {
          id: Date.now(),
          amount,
          from: fromCurrency,
          to: toCurrency,
          result: finalResult,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return [entry, ...prev].slice(0, 5);
      });
      
      // Load chart and comparison data
      loadHistoryAndComparison();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [amount, fromCurrency, toCurrency, markup, loadHistoryAndComparison]);

  // Initialize and Auto-sync theme
  useEffect(() => {
    // Only auto-sync if user hasn't manually set a preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handler);

    // PWA Install Prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    loadInitialData();
    handleConversion(); // Initial run
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [handleConversion]); // Added handleConversion to deps

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);



  useEffect(() => {
    const timer = setTimeout(() => {
      handleConversion();
    }, 500);
    return () => clearTimeout(timer);
  }, [handleConversion]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const setShortcut = (code) => {
    if (code === fromCurrency) return;
    setToCurrency(code);
  };

  return (
    <div className="min-h-screen mesh-gradient text-slate-900 dark:text-slate-100 selection:bg-brand-100 dark:selection:bg-brand-900/40 relative overflow-hidden transition-colors duration-500">
      {/* Aurora Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-aurora-indigo aurora-blob"></div>
      <div className="absolute top-[10%] right-[-5%] w-[35%] h-[35%] bg-aurora-violet aurora-blob" style={{ animationDelay: '-2s' }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-aurora-cyan aurora-blob" style={{ animationDelay: '-4s' }}></div>
      <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-aurora-pink aurora-blob" style={{ animationDelay: '-1s' }}></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-11 h-11 bg-gradient-to-br from-aurora-indigo to-aurora-cyan rounded-2xl flex items-center justify-center shadow-glow-indigo group-hover:scale-110 transition-all duration-500 rotate-3 group-hover:rotate-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
            Convert<span className="gradient-text">X</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Quick Install
            </button>
          )}

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3.5 rounded-2xl bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 hover:text-aurora-indigo dark:hover:text-aurora-cyan shadow-glass-light transition-all duration-300 group"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.636 7.636l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 group-hover:-rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 118.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-24 relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-16 sm:mb-24 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aurora-indigo/10 text-aurora-indigo dark:bg-aurora-cyan/10 dark:text-aurora-cyan text-xs font-bold uppercase tracking-widest mb-6 border border-aurora-indigo/20 dark:border-aurora-cyan/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-indigo dark:bg-aurora-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-aurora-indigo dark:bg-aurora-cyan"></span>
            </span>
            Live Market Rates
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
            Exchange money <br className="hidden sm:block" /> 
            <span className="gradient-text animate-pulse-soft">at the real rate.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Experience the future of currency conversion. Fast, transparent, and accurate market data with a premium interface.
          </p>
        </section>

        {/* Converter Card */}
        <div className="glass-card animate-slide-up border-white/40 dark:border-white/10">
          {/* Inner Glow Decorative - Wrapped to remain contained */}
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-aurora-indigo/5 dark:bg-aurora-cyan/5 blur-[100px] rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-end mb-12 relative z-30">
            <div className="flex flex-col gap-6">
              <CurrencyInput 
                label="Amount" 
                value={amount} 
                onChange={setAmount} 
                disabled={loading}
              />
              <CurrencyDropdown 
                label="From" 
                value={fromCurrency} 
                onChange={setFromCurrency} 
                disabled={loading}
              />
            </div>

            <div className="flex flex-col items-center gap-4">
              <SwapButton onClick={handleSwap} disabled={loading} />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between mb-1 ml-1">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Bank Fee
                </label>
                <div className="relative">
                  <select 
                    value={markup}
                    onChange={(e) => setMarkup(parseFloat(e.target.value))}
                    className="bg-slate-100 dark:bg-white/5 text-[10px] font-black text-aurora-indigo dark:text-aurora-cyan px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-white/5 focus:outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors uppercase tracking-tight"
                  >
                    <option value="0">Real Rate (0%)</option>
                    <option value="1">Typical (1%)</option>
                    <option value="3">Standard (3%)</option>
                    <option value="5">High (5%)</option>
                  </select>
                </div>
              </div>
              <CurrencyDropdown 
                label="To" 
                value={toCurrency} 
                onChange={setToCurrency} 
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-12 relative z-10">
            <ConversionResult 
              amount={amount}
              from={fromCurrency}
              to={toCurrency}
              result={result}
              rate={rate}
              lastUpdated={lastUpdated}
              loading={loading}
              error={error}
            />
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mr-2">Quick Select:</span>
            {POPULAR_CURRENCIES.map(code => (
              <button
                key={code}
                onClick={() => setShortcut(code)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 uppercase tracking-tight ${toCurrency === code ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105' : 'bg-white/40 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border border-white/20 dark:border-white/5 hover:bg-white/70 dark:hover:bg-white/[0.08] hover:scale-105'}`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Charts and Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <HistoricalChart 
            data={chartData} 
            from={fromCurrency} 
            to={toCurrency} 
            loading={chartLoading} 
          />
          <ComparisonList baseCode={fromCurrency} rates={comparisonRates} />
        </div>

        {/* ComparisonList fix - need to pass correct rates based on fromCurrency */}
        {/* Let's simplify and just use the fromCurrency's rates if available */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Popular Rates */}
          <section className="glass-card">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 tracking-tight">Popular Conversions</h3>
            <div className="space-y-4">
              {POPULAR_PAIRS.map(pair => {
                const key = `${pair.from}_${pair.to}`;
                const data = popularRates[key];
                const fromC = getCurrency(pair.from);
                const toC = getCurrency(pair.to);
                
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setFromCurrency(pair.from);
                      setToCurrency(pair.to);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/30 dark:bg-white/[0.03] hover:bg-white/60 dark:hover:bg-white/[0.08] border border-white/20 dark:border-white/5 hover:border-aurora-indigo/20 dark:hover:border-aurora-cyan/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        <span className="text-xl relative z-10 shadow-sm">{fromC?.flag}</span>
                        <span className="text-xl shadow-sm">{toC?.flag}</span>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                        {pair.from} <span className="text-slate-300 dark:text-slate-600 mx-1 group-hover:text-aurora-indigo transition-colors">→</span> {pair.to}
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {data ? data.rate.toFixed(3) : '---'}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* History or Info Section */}
          <div className="space-y-8">
            <section className="glass-card">
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 tracking-tight">Recent History</h3>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/30 dark:bg-white/[0.03] border border-white/20 dark:border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.time}</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {item.amount} {item.from} <span className="text-slate-300 mx-1">→</span> {item.to}
                        </span>
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {item.result.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 bg-slate-100/50 dark:bg-white/[0.02] rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-700 border border-slate-100 dark:border-white/5">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No recent history</p>
                </div>
              )}
            </section>

            <a 
              href="https://www.reuters.com/markets/currencies/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-slate-900 dark:bg-white rounded-[2.5rem] p-8 shadow-2xl text-white dark:text-slate-900 overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform duration-500"
            >
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4 tracking-tight">Financial Accuracy</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed mb-6">
                  We collect real-time data from major financial institutions to provide you with the mid-market rate — the fairest exchange rate possible.
                </p>
                <div className="flex items-center gap-2 group/btn">
                  <span className="text-xs font-black uppercase tracking-widest">Market Insights</span>
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
              {/* Decorative Glow */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-aurora-cyan/20 blur-[60px] rounded-full group-hover:bg-aurora-cyan/40 transition-colors duration-700"></div>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-16 text-center relative z-10">
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mx-auto mb-10"></div>
        <div className="flex justify-center gap-6 mt-6">
          <a href="https://github.com/naveenkumar752" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.472-4.041-1.472-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/naveenkumar-m-4024b7245/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5] transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
        </div>
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-8">
          &copy; 2026 ConvertX. Made by Naveenkumar.
        </p>
      </footer>
    </div>
  );
};

export default App;
