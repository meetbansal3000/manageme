import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  RefreshCw, 
  Globe, 
  Sliders, 
  ChevronRight, 
  DollarSign, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export interface MarketTickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  category: 'indices' | 'equities' | 'commodities' | 'crypto';
  high24h: number;
  low24h: number;
  volume: string;
  lastTick?: 'up' | 'down';
}

const INITIAL_TICKERS: MarketTickerItem[] = [
  // Indices
  { symbol: 'S&P 500', name: 'S&P 500 Index', price: 5984.20, change: 32.40, changePercent: 0.54, currency: '$', category: 'indices', high24h: 5998.10, low24h: 5940.00, volume: '3.8B' },
  { symbol: 'FTSE 100', name: 'FTSE 100 Index', price: 8428.60, change: 48.20, changePercent: 0.58, currency: '£', category: 'indices', high24h: 8445.00, low24h: 8380.50, volume: '920M' },
  { symbol: 'NASDAQ', name: 'Nasdaq 100', price: 21180.40, change: 164.80, changePercent: 0.78, currency: '$', category: 'indices', high24h: 21250.00, low24h: 20980.00, volume: '5.1B' },
  
  // US Equities
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 138.45, change: 4.15, changePercent: 3.09, currency: '$', category: 'equities', high24h: 140.20, low24h: 134.10, volume: '48.2M' },
  { symbol: 'AAPL', name: 'Apple Inc', price: 232.80, change: 1.95, changePercent: 0.84, currency: '$', category: 'equities', high24h: 234.50, low24h: 230.10, volume: '32.1M' },
  { symbol: 'MSFT', name: 'Microsoft Corp', price: 448.60, change: -2.30, changePercent: -0.51, currency: '$', category: 'equities', high24h: 452.00, low24h: 446.20, volume: '18.4M' },
  { symbol: 'TSLA', name: 'Tesla Inc', price: 218.90, change: 6.40, changePercent: 3.01, currency: '$', category: 'equities', high24h: 222.00, low24h: 212.50, volume: '62.8M' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 194.30, change: 2.10, changePercent: 1.09, currency: '$', category: 'equities', high24h: 196.00, low24h: 191.80, volume: '27.5M' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', price: 182.40, change: -0.80, changePercent: -0.44, currency: '$', category: 'equities', high24h: 184.20, low24h: 181.10, volume: '21.0M' },

  // Crypto & Commodities
  { symbol: 'BTC', name: 'Bitcoin / USD', price: 96420.00, change: 1840.00, changePercent: 1.95, currency: '$', category: 'crypto', high24h: 97800.00, low24h: 94200.00, volume: '$38.4B' },
  { symbol: 'ETH', name: 'Ethereum / USD', price: 2785.50, change: 65.20, changePercent: 2.40, currency: '$', category: 'crypto', high24h: 2840.00, low24h: 2710.00, volume: '$18.2B' },
  { symbol: 'GOLD', name: 'Gold Spot / oz', price: 2892.40, change: 14.80, changePercent: 0.51, currency: '$', category: 'commodities', high24h: 2905.00, low24h: 2872.00, volume: '$42.1B' },
  { symbol: 'BRENT', name: 'Brent Crude Oil', price: 74.35, change: -0.95, changePercent: -1.26, currency: '$', category: 'commodities', high24h: 75.80, low24h: 73.90, volume: '$12.6B' },
];

export const LiveStockTicker: React.FC = () => {
  const [tickers, setTickers] = useState<MarketTickerItem[]>(() => {
    const saved = localStorage.getItem('manageme_live_tickers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_TICKERS;
  });

  const [filterCategory, setFilterCategory] = useState<'all' | 'indices' | 'equities' | 'commodities' | 'crypto'>('all');
  const [selectedTicker, setSelectedTicker] = useState<MarketTickerItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isStreaming, setIsStreaming] = useState(true);

  // Live WebSocket/Polling Simulation Engine
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setTickers(prev => {
        // Randomly pick 2-4 tickers to micro-oscillate
        const updated: MarketTickerItem[] = prev.map(ticker => {
          const shouldUpdate = Math.random() > 0.45;
          if (!shouldUpdate) return { ...ticker, lastTick: undefined };

          // Micro fluctuation between -0.3% and +0.35%
          const pctDelta = (Math.random() - 0.48) * 0.004;
          const oldPrice = ticker.price;
          const newPrice = Number((oldPrice * (1 + pctDelta)).toFixed(ticker.price > 500 ? 2 : ticker.price > 10 ? 2 : 4));
          const priceDiff = newPrice - oldPrice;
          const isUp = priceDiff >= 0;

          const updatedChange = Number((ticker.change + priceDiff).toFixed(2));
          const updatedPercent = Number(((updatedChange / (newPrice - updatedChange)) * 100).toFixed(2));

          return {
            ...ticker,
            price: newPrice,
            change: updatedChange,
            changePercent: updatedPercent,
            high24h: Math.max(ticker.high24h, newPrice),
            low24h: Math.min(ticker.low24h, newPrice),
            lastTick: isUp ? 'up' : 'down'
          };
        });

        localStorage.setItem('manageme_live_tickers', JSON.stringify(updated));
        setLastUpdate(new Date());
        return updated;
      });
    }, 2200);


    return () => clearInterval(interval);
  }, [isStreaming]);

  const filteredTickers = filterCategory === 'all' 
    ? tickers 
    : tickers.filter(t => t.category === filterCategory);

  return (
    <div className="w-full bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-black/[0.08] dark:border-white/[0.08] z-30 select-none relative shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center h-8 overflow-hidden text-xs">
        
        {/* Left Live Badge */}
        <div className="flex items-center gap-1.5 pr-3 border-r border-black/[0.08] dark:border-white/[0.08] shrink-0 z-10 bg-white dark:bg-[#09090b]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600 dark:bg-[#10b981]"></span>
          </span>
          <span className="font-mono font-bold text-[10px] text-slate-600 dark:text-neutral-400 tracking-wider uppercase hidden xs:inline">
            MARKETS
          </span>
        </div>

        {/* Quick Filter Chips */}
        <div className="hidden lg:flex items-center gap-1 px-3 border-r border-black/[0.08] dark:border-white/[0.08] shrink-0">
          {(['all', 'indices', 'equities', 'crypto', 'commodities'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-500 dark:text-neutral-500 hover:text-slate-800 dark:hover:text-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scrolling Ticker Strip */}
        <div 
          className="flex-1 overflow-hidden relative flex items-center min-w-0"
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Edge Blur Gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-r from-white dark:from-[#09090b] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-l from-white dark:from-[#09090b] to-transparent z-10 pointer-events-none" />

          {/* Marquee Container */}
          <div 
            className={`flex items-center gap-4 sm:gap-6 whitespace-nowrap will-change-transform ${isPaused ? '' : 'animate-ticker-marquee'}`}
            style={{ animationDuration: '40s' }}
          >
            {[...filteredTickers, ...filteredTickers].map((ticker, idx) => {
              const isPositive = ticker.changePercent >= 0;

              return (
                <div
                  key={`${ticker.symbol}-${idx}`}
                  onClick={() => setSelectedTicker(ticker)}
                  className="flex items-center gap-2 py-0.5 px-1 rounded transition-colors cursor-pointer hover:bg-slate-900/5 dark:hover:bg-white/[0.05] select-none"
                  title={`Click for ${ticker.name} Details`}
                >
                  <span className="font-mono tracking-tighter font-bold text-slate-700 dark:text-neutral-300 text-[11px]">
                    {ticker.symbol}
                  </span>
                  
                  <span className="font-mono tracking-tighter tabular-nums text-slate-900 dark:text-white font-semibold text-[11px]">
                    {ticker.currency}{ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>

                  <span className={`font-mono tracking-tighter tabular-nums font-bold text-[11px] ${
                    isPositive ? 'text-emerald-600 dark:text-[#10b981]' : 'text-rose-600 dark:text-[#f43f5e]'
                  }`}>
                    {isPositive ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Stream Toggle & Timestamp */}
        <div className="flex items-center gap-2 pl-3 border-l border-black/[0.08] dark:border-white/[0.08] shrink-0 z-10 bg-white dark:bg-[#09090b]">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`p-0.5 rounded transition-colors ${
              isStreaming ? 'text-emerald-600 dark:text-[#10b981] hover:bg-emerald-500/10' : 'text-slate-400 dark:text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title={isStreaming ? 'Live Market Streaming Active (Click to Pause)' : 'Streaming Paused (Click to Resume)'}
          >
            <Activity className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono tracking-tighter tabular-nums text-slate-500 dark:text-neutral-400 hidden md:inline">
            {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

      </div>

      {/* Selected Ticker Modal / Inspection Popover */}
      <AnimatePresence>
        {selectedTicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicker(null)}
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white/95 dark:bg-neutral-950/95 border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-2xl z-50 backdrop-blur-2xl text-slate-900 dark:text-white space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono tracking-tighter text-blue-600 dark:text-blue-400">{selectedTicker.symbol}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-neutral-300 font-mono tracking-tighter capitalize border border-slate-200 dark:border-white/10">
                      {selectedTicker.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-neutral-300 mt-0.5">{selectedTicker.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedTicker(null)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Price Callout */}
              <div className="bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-neutral-400 block mb-1 tracking-wider">Live Spot Price</span>
                  <span className="text-3xl font-extrabold font-mono tracking-tighter text-slate-900 dark:text-white">
                    {selectedTicker.currency}{selectedTicker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={`text-right ${selectedTicker.changePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  <span className="text-sm font-bold font-mono tracking-tighter block">
                    {selectedTicker.change >= 0 ? '+' : ''}{selectedTicker.change.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono tracking-tighter font-semibold">
                    ({selectedTicker.changePercent >= 0 ? '+' : ''}{selectedTicker.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* 24h Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 block">24h High</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300 mt-1 block font-mono tracking-tighter">
                    {selectedTicker.currency}{selectedTicker.high24h.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 block">24h Low</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-300 mt-1 block font-mono tracking-tighter">
                    {selectedTicker.currency}{selectedTicker.low24h.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 block">Est Volume</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-300 mt-1 block font-mono tracking-tighter">
                    {selectedTicker.volume}
                  </span>
                </div>
              </div>

              {/* Quick Action */}
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedTicker(null);
                    window.dispatchEvent(new CustomEvent('navigateTab', { detail: 'trading' }));
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Trade in Paper Sandbox</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
export default LiveStockTicker;
