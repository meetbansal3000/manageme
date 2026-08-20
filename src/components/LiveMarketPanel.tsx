import React, { useState, useEffect } from 'react';
import { Activity, Settings, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
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
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-card-base space-y-6 transition-all duration-300 ease-out">
      
      {/* Header & Volatility Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-textPrimary tracking-tight">{asset.symbol} Live Market</h2>
            {asset.region && (
              <span className="px-2.5 py-0.5 bg-actionBlue/10 text-actionBlue text-[10px] font-bold rounded-full border border-actionBlue/20 uppercase font-sans">
                {asset.region} • {asset.exchange || 'EXCHANGE'}
              </span>
            )}
            {marketData.volumeSpike && (
              <span className="px-2.5 py-0.5 bg-lossRed/10 text-lossRed text-[10px] font-bold rounded-full border border-lossRed/30 animate-pulse uppercase">
                Vol Spike
              </span>
            )}
          </div>
          <p className="text-textMuted text-xs flex items-center gap-2 mt-1 font-mono tabular-nums">
            <span>VIX Est: {marketData.vixEstimate.toFixed(1)}</span>
            <span>•</span>
            <span>Spread: {currency}{marketData.spread.toFixed(4)}</span>
          </p>
        </div>
        
        <div className="flex items-center bg-surface-elevated rounded-xl p-1 border border-border">
          <span className="text-xs text-textMuted px-2.5 flex items-center gap-1">
            <Settings className="w-3.5 h-3.5 text-actionBlue"/> Volatility:
          </span>
          {(['low', 'normal', 'high'] as VolatilityProfile[]).map(v => (
            <button
              key={v}
              onClick={() => setVolatility(v)}
              className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all duration-300 ease-out cursor-pointer active:scale-95 ${
                volatility === v 
                  ? (v === 'high' ? 'bg-lossRed/20 text-lossRed border border-lossRed/40 shadow-xs' : v === 'low' ? 'bg-actionBlue/20 text-actionBlue border border-actionBlue/40 shadow-xs' : 'bg-accentPrimary text-background shadow-xs font-extrabold')
                  : 'text-textMuted hover:text-textPrimary'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-elevated p-4 rounded-xl border border-border font-mono tabular-nums transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-card-base hover:shadow-card-hover">
          <div className="text-textMuted text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">LTP</div>
          <div className={`text-lg font-extrabold flex items-center gap-1 ${marketData.isUp ? 'text-profitGreen' : 'text-lossRed'}`}>
            {currency}{marketData.currentPrice.toFixed(2)}
            {marketData.isUp ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
          </div>
        </div>
        <div className="bg-surface-elevated p-4 rounded-xl border border-border font-mono tabular-nums transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-card-base hover:shadow-card-hover">
          <div className="text-textMuted text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">24h High</div>
          <div className="text-lg font-extrabold text-textPrimary">{currency}{marketData.high24h.toFixed(2)}</div>
        </div>
        <div className="bg-surface-elevated p-4 rounded-xl border border-border font-mono tabular-nums transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-card-base hover:shadow-card-hover">
          <div className="text-textMuted text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">24h Low</div>
          <div className="text-lg font-extrabold text-textPrimary">{currency}{marketData.low24h.toFixed(2)}</div>
        </div>
        <div className="bg-surface-elevated p-4 rounded-xl border border-border font-mono tabular-nums transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-card-base hover:shadow-card-hover">
          <div className="text-textMuted text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">ATR</div>
          <div className="text-lg font-extrabold text-textPrimary">{currency}{marketData.atr.toFixed(4)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tick Chart */}
        <div className="bg-surface-elevated border border-border rounded-xl p-4 flex flex-col min-h-[300px] shadow-card-base">
          <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <Activity className="w-4 h-4 text-actionBlue"/> Live Tick Chart
          </h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={marketData.isUp ? "#00FF66" : "#FF3B30"} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={marketData.isUp ? "#00FF66" : "#FF3B30"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', fontSize: '12px', borderRadius: '12px' }}
                  itemStyle={{ color: marketData.isUp ? "#00FF66" : "#FF3B30" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={marketData.isUp ? "#00FF66" : "#FF3B30"} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level 2 Order Book */}
        <div className="bg-surface-elevated border border-border rounded-xl p-4 flex flex-col shadow-card-base">
          <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <BarChart2 className="w-4 h-4 text-actionBlue"/> Market Depth (Level 2)
          </h3>
          
          <div className="flex flex-col gap-1 w-full text-xs flex-1">
            <div className="flex justify-between text-textMuted font-semibold mb-2 uppercase text-[10px] tracking-wider px-1 font-mono">
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
                  <div key={i} className="flex justify-between items-center relative py-1 px-1 rounded hover:bg-surface transition-colors">
                    {/* Background Bars */}
                    <div className="absolute left-0 top-0 bottom-0 bg-profitGreen/10 rounded-l" style={{ width: `${bidWidth / 2}%` }} />
                    <div className="absolute right-0 top-0 bottom-0 bg-lossRed/10 rounded-r" style={{ width: `${askWidth / 2}%` }} />
                    
                    <div className="flex w-1/2 justify-between pr-4 relative z-10 text-profitGreen font-bold">
                      <span>{bid.volume}</span>
                      <span className="font-mono">{bid.price.toFixed(2)}</span>
                    </div>
                    <div className="flex w-1/2 justify-between pl-4 relative z-10 text-lossRed font-bold">
                      <span className="font-mono">{ask.price.toFixed(2)}</span>
                      <span>{ask.volume}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-[10px] text-textMuted font-mono tabular-nums">
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

export default LiveMarketPanel;
