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
    <div className="bg-[rgba(20,14,50,0.65)] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Volatility Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white">{asset.symbol} Live Market</h2>
            {asset.region && (
              <span className="px-2.5 py-0.5 bg-[#5E6CE7]/20 text-[#5E6CE7] text-[10px] font-bold rounded-full border border-[#5E6CE7]/30 uppercase font-sans">
                {asset.region} • {asset.exchange || 'EXCHANGE'}
              </span>
            )}
            {marketData.volumeSpike && (
              <span className="px-2.5 py-0.5 bg-[#FF3B30]/20 text-[#FF3B30] text-[10px] font-bold rounded-full border border-[#FF3B30]/30 animate-pulse uppercase">Vol Spike</span>
            )}
          </div>
          <p className="text-[#9A9DBE] text-xs flex items-center gap-2 mt-1 font-mono tabular-nums">
            <span>VIX Est: {marketData.vixEstimate.toFixed(1)}</span>
            <span>•</span>
            <span>Spread: {currency}{marketData.spread.toFixed(4)}</span>
          </p>
        </div>
        
        <div className="flex items-center bg-[#08021A] rounded-full p-1 border border-white/10">
          <span className="text-xs text-[#9A9DBE] px-2.5 flex items-center gap-1"><Settings className="w-3 h-3 text-[#C645F9]"/> Volatility:</span>
          {(['low', 'normal', 'high'] as VolatilityProfile[]).map(v => (
            <button
              key={v}
              onClick={() => setVolatility(v)}
              className={`px-3 py-1 text-xs font-bold rounded-full capitalize transition-all ${
                volatility === v 
                  ? (v === 'high' ? 'bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/40 shadow-[0_0_10px_rgba(255,59,48,0.3)]' : v === 'low' ? 'bg-[#5E6CE7]/20 text-[#5E6CE7] border border-[#5E6CE7]/40 shadow-[0_0_10px_rgba(94,108,231,0.3)]' : 'bg-gradient-to-r from-[#5E6CE7] to-[#C645F9] text-white shadow-[0_0_10px_rgba(198,69,249,0.3)]')
                  : 'text-[#9A9DBE] hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#08021A] p-4 rounded-2xl border border-white/10 font-mono tabular-nums">
          <div className="text-[#9A9DBE] text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">LTP</div>
          <div className={`text-lg font-bold flex items-center gap-1 ${marketData.isUp ? 'text-[#00FF66]' : 'text-[#FF3B30]'}`}>
            {currency}{marketData.currentPrice.toFixed(2)}
            {marketData.isUp ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
          </div>
        </div>
        <div className="bg-[#08021A] p-4 rounded-2xl border border-white/10 font-mono tabular-nums">
          <div className="text-[#9A9DBE] text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">24h High</div>
          <div className="text-lg font-bold text-white">{currency}{marketData.high24h.toFixed(2)}</div>
        </div>
        <div className="bg-[#08021A] p-4 rounded-2xl border border-white/10 font-mono tabular-nums">
          <div className="text-[#9A9DBE] text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">24h Low</div>
          <div className="text-lg font-bold text-white">{currency}{marketData.low24h.toFixed(2)}</div>
        </div>
        <div className="bg-[#08021A] p-4 rounded-2xl border border-white/10 font-mono tabular-nums">
          <div className="text-[#9A9DBE] text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">ATR</div>
          <div className="text-lg font-bold text-white">{currency}{marketData.atr.toFixed(4)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tick Chart */}
        <div className="bg-[#08021A] border border-white/10 rounded-2xl p-4 flex flex-col min-h-[300px]">
          <h3 className="text-xs font-bold text-[#9A9DBE] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <Activity className="w-4 h-4 text-[#C645F9]"/> Live Tick Chart
          </h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={marketData.isUp ? "#00FF66" : "#FF3B30"} stopOpacity={0.35}/>
                    <stop offset="95%" stopColor={marketData.isUp ? "#00FF66" : "#FF3B30"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D0425', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', borderRadius: '12px' }}
                  itemStyle={{ color: marketData.isUp ? "#00FF66" : "#FF3B30" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={marketData.isUp ? "#00FF66" : "#FF3B30"} 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level 2 Order Book */}
        <div className="bg-[#08021A] border border-white/10 rounded-2xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-[#9A9DBE] uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <BarChart2 className="w-4 h-4 text-[#5E6CE7]"/> Market Depth (Level 2)
          </h3>
          
          <div className="flex flex-col gap-1 w-full text-xs flex-1">
            <div className="flex justify-between text-[#9A9DBE] font-semibold mb-2 uppercase text-[10px] tracking-wider px-1 font-mono">
              <span>Bid Qty</span>
              <span>Bid Price</span>
              <span>Ask Price</span>
              <span>Ask Qty</span>
            </div>
            
            <div className="space-y-1 relative font-mono tabular-nums">
              {marketData.bids.map((bid, i) => {
                const ask = marketData.asks[i];
                if (!ask) return null;

                const maxVol = Math.max(...marketData.bids.map(b => b.volume), ...marketData.asks.map(a => a.volume));
                const bidWidth = (bid.volume / maxVol) * 100;
                const askWidth = (ask.volume / maxVol) * 100;

                return (
                  <div key={i} className="flex justify-between items-center relative py-1 px-1">
                    {/* Background Bars */}
                    <div className="absolute left-0 top-0 bottom-0 bg-[#00FF66]/10 rounded-l" style={{ width: `${bidWidth / 2}%` }} />
                    <div className="absolute right-0 top-0 bottom-0 bg-[#FF3B30]/10 rounded-r" style={{ width: `${askWidth / 2}%` }} />
                    
                    <div className="flex w-1/2 justify-between pr-4 relative z-10 text-[#00FF66]">
                      <span>{bid.volume}</span>
                      <span className="font-mono">{bid.price.toFixed(2)}</span>
                    </div>
                    <div className="flex w-1/2 justify-between pl-4 relative z-10 text-[#FF3B30]">
                      <span className="font-mono">{ask.price.toFixed(2)}</span>
                      <span>{ask.volume}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[10px] text-[#9A9DBE] font-mono tabular-nums">
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
