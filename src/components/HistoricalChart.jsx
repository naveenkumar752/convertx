import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const HistoricalChart = ({ data, from, to, loading }) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl animate-pulse">
        <span className="text-slate-400 text-sm">Loading trend data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{from}/{to} Trend</h3>
          <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">30 Day Performance</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-aurora-indigo/10 text-[10px] font-black text-aurora-indigo dark:text-aurora-cyan uppercase tracking-widest border border-aurora-indigo/20">
          Live Market
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.05} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 700 }}
              interval="preserveStartEnd"
              dy={10}
            />
            <YAxis 
              hide={false} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 700 }}
              domain={['auto', 'auto']}
              dx={-5}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '16px',
                fontSize: '11px',
                padding: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#818cf8', fontWeight: '900' }}
            />
            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke="#6366f1" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorRate)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoricalChart;
