import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Settings, TrendingUp, TrendingDown, Clock, BarChart2 } from 'lucide-react';
import { LiveMarketData, VolatilityProfile } from '../hooks/useMarketEngine';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  asset: any;
  marketData: LiveMarketData;
  volatility: VolatilityProfile;
  setVolatility: (v: VolatilityProfile) => void;
}

export const LiveMarketPanel: React.FC<Props> = ({ asset, marketData, volatility, setVolatility }) => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev, { time: new Date().toLocaleTimeString(), price: marketData.currentPrice }];
      if (newHistory.length > 30) newHistory.shift();
      return newHistory;
    });
  }, [marketData.currentPrice]);

  const currency = asset?.currency || '$';

  return (
    <div className="bg-[#111114] border border-[#2A2A2D] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Volatility Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2A2A2D] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{asset.symbol} Live Market</h2>
            {asset.region && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/30 uppercase">
                {asset.region} • {asset.exchange || 'EXCHANGE'}
              </span>
            )}
            {marketData.volumeSpike && (
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded animate-pulse uppercase">Vol Spike</span>
            )}
          </div>
          <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
            <span>VIX Est: {marketData.vixEstimate.toFixed(1)}</span>
            <span>•</span>
            <span>Spread: {currency}{marketData.spread.toFixed(4)}</span>
          </p>
        </div>
        
        <div className="flex items-center bg-[#18181B] rounded-lg p-1 border border-[#2A2A2D]">
          <span className="text-xs text-gray-500 px-2 flex items-center gap-1"><Settings className="w-3 h-3"/> Volatility:</span>
          {(['low', 'normal', 'high'] as VolatilityProfile[]).map(v => (
            <button
              key={v}
              onClick={() => setVolatility(v)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-colors ${
                volatility === v 
                  ? (v === 'high' ? 'bg-rose-500/20 text-rose-400' : v === 'low' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#2A2A2D] text-white')
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#18181B] p-4 rounded-xl border border-[#2A2A2D]">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">LTP</div>
          <div className={`text-lg font-bold flex items-center gap-1 ${marketData.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {currency}{marketData.currentPrice.toFixed(2)}
            {marketData.isUp ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
          </div>
        </div>
        <div className="bg-[#18181B] p-4 rounded-xl border border-[#2A2A2D]">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">24h High</div>
          <div className="text-lg font-bold text-white">{currency}{marketData.high24h.toFixed(2)}</div>
        </div>
        <div className="bg-[#18181B] p-4 rounded-xl border border-[#2A2A2D]">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">24h Low</div>
          <div className="text-lg font-bold text-white">{currency}{marketData.low24h.toFixed(2)}</div>
        </div>
        <div className="bg-[#18181B] p-4 rounded-xl border border-[#2A2A2D]">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">ATR</div>
          <div className="text-lg font-bold text-white">{currency}{marketData.atr.toFixed(4)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tick Chart */}
        <div className="bg-[#18181B] border border-[#2A2A2D] rounded-xl p-4 flex flex-col min-h-[300px]">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4"/> Live Tick Chart
          </h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={marketData.isUp ? "#10B981" : "#F43F5E"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={marketData.isUp ? "#10B981" : "#F43F5E"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111114', borderColor: '#2A2A2D', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: marketData.isUp ? "#10B981" : "#F43F5E" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={marketData.isUp ? "#10B981" : "#F43F5E"} 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level 2 Order Book */}
        <div className="bg-[#18181B] border border-[#2A2A2D] rounded-xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4"/> Market Depth (Level 2)
          </h3>
          
          <div className="flex flex-col gap-1 w-full text-xs flex-1">
            <div className="flex justify-between text-gray-500 font-semibold mb-2 uppercase text-[10px] tracking-wider px-1">
              <span>Bid Qty</span>
              <span>Bid Price</span>
              <span>Ask Price</span>
              <span>Ask Qty</span>
            </div>
            
            <div className="space-y-1 relative">
              {marketData.bids.map((bid, i) => {
                const ask = marketData.asks[i];
                if (!ask) return null;

                const maxVol = Math.max(...marketData.bids.map(b => b.volume), ...marketData.asks.map(a => a.volume));
                const bidWidth = (bid.volume / maxVol) * 100;
                const askWidth = (ask.volume / maxVol) * 100;

                return (
                  <div key={i} className="flex justify-between items-center relative py-1 px-1">
                    {/* Background Bars */}
                    <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/10" style={{ width: `${bidWidth / 2}%` }} />
                    <div className="absolute right-0 top-0 bottom-0 bg-rose-500/10" style={{ width: `${askWidth / 2}%` }} />
                    
                    <div className="flex w-1/2 justify-between pr-4 relative z-10 text-emerald-400">
                      <span>{bid.volume}</span>
                      <span className="font-mono">{bid.price.toFixed(2)}</span>
                    </div>
                    <div className="flex w-1/2 justify-between pl-4 relative z-10 text-rose-400">
                      <span className="font-mono">{ask.price.toFixed(2)}</span>
                      <span>{ask.volume}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-[#2A2A2D] flex justify-between text-[10px] text-gray-500 font-mono">
              <div>Total Bid: {marketData.bids.reduce((a,b)=>a+b.volume, 0)}</div>
              <div>Spread: {((marketData.spread / marketData.currentPrice) * 100).toFixed(3)}%</div>
              <div>Total Ask: {marketData.asks.reduce((a,b)=>a+b.volume, 0)}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
