const BASE_URL = 'https://api.frankfurter.app';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cache = new Map();

/**
 * Fetch latest exchange rates from a given base currency.
 * Returns an object like { USD: 1.08, INR: 90.2, ... }
 */
export async function fetchRates(baseCurrency = 'USD') {
  const cacheKey = `rates_${baseCurrency}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`${BASE_URL}/latest?from=${baseCurrency}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const rates = { ...json.rates, [baseCurrency]: 1 };
    const result = { rates, date: json.date, base: json.base };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    // Save to localStorage for offline fallback
    localStorage.setItem(cacheKey, JSON.stringify({ data: result, timestamp: Date.now() }));
    
    return result;
  } catch (error) {
    // Attempt to load from localStorage if offline
    const localData = localStorage.getItem(cacheKey);
    if (localData) {
      console.warn('Network failed, using offline rates from localStorage');
      return JSON.parse(localData).data;
    }
    throw error;
  }
}

/**
 * Fetch historical rates for the last 30 days.
 */
export async function fetchHistoricalData(base, target, days = 30) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const cacheKey = `history_${base}_${target}_${days}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL * 2) return cached.data;

  const response = await fetch(`${BASE_URL}/${startDate}..${endDate}?from=${base}&to=${target}`);
  if (!response.ok) throw new Error('Failed to fetch historical data');
  
  const json = await response.json();
  
  // Format data for Recharts: [{ date: '2023-01-01', rate: 1.2 }, ...]
  const chartData = Object.entries(json.rates).map(([date, rates]) => ({
    date: date.split('-').slice(1).join('/'), // simplify date to MM/DD
    rate: rates[target]
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  cache.set(cacheKey, { data: chartData, timestamp: Date.now() });
  return chartData;
}

/**
 * Convert amount from one currency to another.
 */
export async function convertCurrency(amount, from, to) {
  if (from === to) {
    return { result: amount, rate: 1, date: new Date().toISOString().split('T')[0] };
  }

  const { rates, date } = await fetchRates(from);

  if (!rates[to]) {
    throw new Error(`Exchange rate for ${to} not available.`);
  }

  const rate = rates[to];
  const result = amount * rate;
  return { result, rate, date };
}

/**
 * Fetch rates for a list of popular pairs in one call.
 * Returns an object: { 'USD_INR': { rate, date }, ... }
 */
export async function fetchPopularRates(pairs) {
  const results = {};

  // Group by base currency to minimize API calls
  const byBase = {};
  pairs.forEach(({ from, to }) => {
    if (!byBase[from]) byBase[from] = [];
    byBase[from].push(to);
  });

  await Promise.all(
    Object.entries(byBase).map(async ([base, targets]) => {
      try {
        const { rates, date } = await fetchRates(base);
        targets.forEach(to => {
          if (rates[to]) {
            results[`${base}_${to}`] = { rate: rates[to], date };
          }
        });
      } catch {
        // silently ignore individual failures
      }
    })
  );

  return results;
}
