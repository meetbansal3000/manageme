import React, { useState, useEffect, useRef } from 'react';
import { Activity, Settings, TrendingUp, TrendingDown, BarChart2, Radio } from 'lucide-react';
import { LiveMarketData, VolatilityProfile } from '../hooks/useMarketEngine';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  asset?: any;
  marketData?: LiveMarketData;
  volatility?: VolatilityProfile;
  setVolatility?: (v: VolatilityProfile) => void;
}

export const LiveMarketPanel: React.FC<Props> = ({ 
  asset = { symbol: 'AAPL', currency: '$', region: 'US', exchange: 'NASDAQ' }, 
  marketData = {
    symbol: 'AAPL',
    currentPrice: 232.80,
    bidPrice: 232.75,
    askPrice: 232.85,
    spread: 0.10,
    bids: [],
    asks: [],
    change: 1.1,
    changePercent: 0.5,
    isUp: true,
    atr: 2.34,
    vixEstimate: 15.2,
    high24h: 234.50,
    low24h: 230.10,
    volumeSpike: false,
    candles: []
  }, 
  volatility = 'normal', 
  setVolatility = () => {} 
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  const safePrice = Number(marketData?.currentPrice) || 100;
  const isUp = Boolean(marketData?.isUp);
  const currency = asset?.currency || '$';
  const symbol = asset?.symbol || 'AAPL';
  const bids = Array.isArray(marketData?.bids) ? marketData.bids : [];
  const asks = Array.isArray(marketData?.asks) ? marketData.asks : [];

  const prevPriceRef = useRef(safePrice);

  // Initialize or re-seed history when symbol changes
  useEffect(() => {
    const sparkline = Array.isArray(asset?.sparkline) && asset.sparkline.length > 0 
      ? asset.sparkline 
      : [safePrice * 0.992, safePrice * 0.995, safePrice * 1.002, safePrice * 0.998, safePrice];
    
    const seeded = sparkline.map((p: number, idx: number) => ({
      time: `T-${(sparkline.length - idx) * 3}s`,
      price: Number(p)
    }));

    setHistory([...seeded, { time: new Date().toLocaleTimeString(), price: safePrice }]);
    prevPriceRef.current = safePrice;
  }, [symbol]);

  // Flash animation & tick history update on price tick
  useEffect(() => {
    if (safePrice > prevPriceRef.current) {
      setFlash('up');
    } else if (safePrice < prevPriceRef.current) {
      setFlash('down');
    }
    prevPriceRef.current = safePrice;

    setHistory(prev => {
      const newHistory = [...prev, { time: new Date().toLocaleTimeString(), price: safePrice }];
      if (newHistory.length > 35) newHistory.shift();
      return newHistory;
    });

    const timer = setTimeout(() => setFlash(null), 900);
    return () => clearTimeout(timer);
  }, [safePrice]);

  const changeVal = Number(marketData?.change) || 0;
  const changePct = Number(marketData?.changePercent) || 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-card-base space-y-6 transition-all duration-300 ease-out">
      
      {/* Header & Volatility Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profitGreen opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-profitGreen"></span>
            </span>
            <h2 className="text-xl font-extrabold text-textPrimary tracking-tight">{symbol} Live Market</h2>
            {asset?.region && (
              <span className="px-2.5 py-0.5 bg-actionBlue/10 text-actionBlue text-[10px] font-bold rounded-full border border-actionBlue/20 uppercase font-sans">
                {asset.region} • {asset.exchange || 'EXCHANGE'}
              </span>
            )}
            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${isUp ? 'bg-profitGreen/10 text-profitGreen border-profitGreen/30' : 'bg-lossRed/10 text-lossRed border-lossRed/30'}`}>
              {isUp ? '+' : ''}{changeVal.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
            {marketData?.volumeSpike && (
              <span className="px-2.5 py-0.5 bg-lossRed/10 text-lossRed text-[10px] font-bold rounded-full border border-lossRed/30 animate-pulse uppercase">
                Vol Spike
              </span>
            )}
          </div>
          <p className="text-textMuted text-xs flex items-center gap-2 mt-1 font-mono tabular-nums">
            <span>VIX Est: {(Number(marketData?.vixEstimate) || 15).toFixed(1)}</span>
            <span>•</span>
            <span>Spread: {currency}{(Number(marketData?.spread) || 0).toFixed(4)}</span>
            <span>•</span>
            <span className="text-profitGreen flex items-center gap-1 font-sans text-[11px]">
              <Radio className="w-3 h-3 animate-pulse" /> Live Mirroring Active
            </span>
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
        <div className={`p-4 rounded-xl border font-mono tabular-nums transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-card-base ${
          flash === 'up' 
            ? 'bg-profitGreen/15 border-profitGreen/60 ring-2 ring-profitGreen/30' 
            : flash === 'down' 
              ? 'bg-lossRed/15 border-lossRed/60 ring-2 ring-lossRed/30' 
              : 'bg-surface-elevated border-border'
        }`}>
          <div className="text-textMuted text-[10px] font-bold uppercase tracking-wider mb-1 font-sans flex justify-between items-center">
            <span>Last Traded Price</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface border border-border text-actionBlue font-mono">LIVE</span>
          </div>
          <div className={`text-xl font-extrabold flex items-center gap-1.5 ${isUp ? 'text-profitGreen' : 'text-lossRed'}`}>
            {currency}{safePrice.toFixed(2)}
            {isUp ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
          </div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-xl border border-border font-mono tabular-nums transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-card-base hover:shadow-card-hover">
          <div className="text-textMuted text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">24h High</div>
          <div className="text-xl font-extrabold text-textPrimary">{currency}{(Number(marketData?.high24h) || safePrice * 1.01).toFixed(2)}</div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-xl border border-border font-mono tabular-nums transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-card-base hover:shadow-card-hover">
          <div className="text-textMuted text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">24h Low</div>
          <div className="text-xl font-extrabold text-textPrimary">{currency}{(Number(marketData?.low24h) || safePrice * 0.99).toFixed(2)}</div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-xl border border-border font-mono tabular-nums transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-card-base hover:shadow-card-hover">
          <div className="text-textMuted text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">ATR (True Range)</div>
          <div className="text-xl font-extrabold text-textPrimary">{currency}{(Number(marketData?.atr) || 0.05).toFixed(4)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Tick Chart */}
        <div className="bg-surface-elevated border border-border rounded-xl p-4 flex flex-col min-h-[320px] shadow-card-base w-full min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2 font-mono">
              <Activity className="w-4 h-4 text-actionBlue"/> Real-Time Tick Stream
            </h3>
            <span className="text-[10px] font-mono text-textMuted">Sub-second executions</span>
          </div>
          <div className="flex-1 w-full min-w-0 min-h-[220px] h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? "#00FF66" : "#FF3B30"} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={isUp ? "#00FF66" : "#FF3B30"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', fontSize: '12px', borderRadius: '12px' }}
                  itemStyle={{ color: isUp ? "#00FF66" : "#FF3B30" }}
                  formatter={(val: any) => [`${currency}${Number(val).toFixed(2)}`, 'LTP']}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isUp ? "#00FF66" : "#FF3B30"} 
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2 font-mono">
              <BarChart2 className="w-4 h-4 text-actionBlue"/> Market Depth (Level 2)
            </h3>
            <span className="text-[10px] font-mono text-textMuted">5-Tier Depth</span>
          </div>
          
          <div className="flex flex-col gap-1 w-full text-xs flex-1">
            <div className="flex justify-between text-textMuted font-semibold mb-2 uppercase text-[10px] tracking-wider px-1 font-mono">
              <span>Bid Qty</span>
              <span>Bid Price</span>
              <span>Ask Price</span>
              <span>Ask Qty</span>
            </div>
            
            <div className="space-y-1 relative font-mono tabular-nums">
              {bids.map((bid, i) => {
                const ask = asks[i];
                if (!ask) return null;

                const bidVolumes = bids.map(b => Number(b?.volume) || 0);
                const askVolumes = asks.map(a => Number(a?.volume) || 0);
                const maxVol = Math.max(1, ...bidVolumes, ...askVolumes);
                const bidWidth = ((Number(bid?.volume) || 0) / maxVol) * 100;
                const askWidth = ((Number(ask?.volume) || 0) / maxVol) * 100;

                return (
                  <div key={i} className="flex justify-between items-center relative py-1 px-1 rounded hover:bg-surface transition-colors">
                    {/* Background Bars */}
                    <div className="absolute left-0 top-0 bottom-0 bg-profitGreen/10 rounded-l" style={{ width: `${Math.min(50, bidWidth / 2)}%` }} />
                    <div className="absolute right-0 top-0 bottom-0 bg-lossRed/10 rounded-r" style={{ width: `${Math.min(50, askWidth / 2)}%` }} />
                    
                    <div className="flex w-1/2 justify-between pr-4 relative z-10 text-profitGreen font-bold">
                      <span>{bid.volume}</span>
                      <span className="font-mono">{(Number(bid.price) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex w-1/2 justify-between pl-4 relative z-10 text-lossRed font-bold">
                      <span className="font-mono">{(Number(ask.price) || 0).toFixed(2)}</span>
                      <span>{ask.volume}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-[10px] text-textMuted font-mono tabular-nums">
              <div>Total Bid: {bids.reduce((a, b) => a + (Number(b?.volume) || 0), 0)}</div>
              <div>Spread: {(((Number(marketData?.spread) || 0) / (safePrice || 1)) * 100).toFixed(3)}%</div>
              <div>Total Ask: {asks.reduce((a, b) => a + (Number(b?.volume) || 0), 0)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMarketPanel;
