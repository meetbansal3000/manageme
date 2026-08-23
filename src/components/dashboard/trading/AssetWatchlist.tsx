// Component: Multi-Asset Live Watchlist & Quotes Terminal

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Star, Search, Plus } from 'lucide-react';
import { LiveTickerQuote } from '../../../types';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export interface AssetWatchlistProps {
  onSelectSymbol?: (symbol: string) => void;
  selectedSymbol?: string;
}

const DEFAULT_WATCHLIST: LiveTickerQuote[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 224.50, change: 1.85, changePercent: 0.83, high: 226.10, low: 222.90, volume: '48.2M' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 128.40, change: 4.12, changePercent: 3.32, high: 130.00, low: 125.10, volume: '92.5M' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 448.20, change: -0.95, changePercent: -0.21, high: 452.00, low: 446.50, volume: '21.1M' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 186.75, change: 2.30, changePercent: 1.25, high: 188.00, low: 184.20, volume: '34.8M' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 178.10, change: -1.15, changePercent: -0.64, high: 180.50, low: 177.30, volume: '19.4M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 218.60, change: 6.80, changePercent: 3.21, high: 222.00, low: 214.50, volume: '62.0M' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 546.80, change: 2.10, changePercent: 0.39, high: 548.00, low: 545.20, volume: '51.3M' },
];

export const AssetWatchlist: React.FC<AssetWatchlistProps> = ({
  onSelectSymbol,
  selectedSymbol = 'AAPL'
}) => {
  const [filter, setFilter] = useState('');
  const [watchlist, setWatchlist] = useState<LiveTickerQuote[]>(DEFAULT_WATCHLIST);

  const filteredList = watchlist.filter(
    item => item.symbol.toLowerCase().includes(filter.toLowerCase()) ||
            item.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card variant="glass" padding="none" className="border border-white/10 overflow-hidden">
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase">
            Market Watchlist
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {watchlist.length} Assets
        </span>
      </div>

      <div className="p-2 border-b border-white/5">
        <div className="relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter tickers..."
            className="w-full bg-white/5 text-white placeholder-slate-500 rounded-lg px-2.5 py-1.5 text-xs font-mono border border-transparent focus:border-[#0052FF] focus:outline-none"
          />
        </div>
      </div>

      <div className="divide-y divide-white/5 max-h-[360px] overflow-y-auto no-scrollbar">
        {filteredList.map((item) => {
          const isPositive = item.change >= 0;
          const isSelected = selectedSymbol === item.symbol;

          return (
            <button
              key={item.symbol}
              onClick={() => onSelectSymbol && onSelectSymbol(item.symbol)}
              className={`w-full p-3 flex items-center justify-between transition-colors text-left cursor-pointer ${
                isSelected ? 'bg-[#0052FF]/15 border-l-2 border-l-[#0052FF]' : 'hover:bg-white/[0.03]'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs font-mono text-white">{item.symbol}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{item.name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Vol: {item.volume}</span>
              </div>

              <div className="text-right">
                <div className="font-mono text-xs font-semibold text-white">
                  ${item.price.toFixed(2)}
                </div>
                <div className={`flex items-center justify-end gap-0.5 text-[11px] font-mono ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default AssetWatchlist;
