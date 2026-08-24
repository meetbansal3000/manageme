// Component: Executive Trading Terminal & Live Market Station

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  BarChart2, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Globe, 
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { UserTrackerData } from '../../../hooks/useFirestoreData';
import { LiveTickChart } from './LiveTickChart';
import { MarketDepth } from './MarketDepth';
import { OrderTicket } from './OrderTicket';
import { AssetWatchlist } from './AssetWatchlist';
import { SpatialCard } from '../../ui/SpatialCard';
import { Button } from '../../ui/Button';
import { toast } from '../../ui/Toast';

export interface TradingAsset {
  symbol: string;
  name: string;
  price: number;
  change: string;
  region: string;
  isUp?: boolean;
  type?: string;
  exchange?: string;
  currency?: string;
  high?: number;
  low?: number;
  volume?: string;
}

const DEFAULT_SELECTED_ASSET: TradingAsset = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 224.50,
  change: '+1.2%',
  region: 'US',
  isUp: true,
  type: 'STOCKS',
  exchange: 'NASDAQ',
  currency: '$',
  high: 226.10,
  low: 222.90,
  volume: '48.2M'
};

export interface TradingTerminalProps {
  userData?: UserTrackerData;
  updateData?: (partial: Partial<UserTrackerData>) => void;
  initialAsset?: TradingAsset;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  userData,
  updateData,
  initialAsset
}) => {
  // Ensure selectedAsset always has a safe fallback default object
  const [selectedAsset, setSelectedAsset] = useState<TradingAsset>(() => initialAsset || DEFAULT_SELECTED_ASSET);

  const safeAsset: TradingAsset = useMemo(() => {
    return {
      ...DEFAULT_SELECTED_ASSET,
      ...(selectedAsset || {})
    };
  }, [selectedAsset]);

  const cashBalance = userData?.paperTrading?.cashBalance ?? 100000;
  const positions = Array.isArray(userData?.paperTrading?.positions) ? userData.paperTrading.positions : [];
  const tradeHistory = Array.isArray(userData?.paperTrading?.tradeHistory) ? userData.paperTrading.tradeHistory : [];

  const handleSelectSymbol = (sym: string) => {
    // Map known symbols or fallback
    const priceMap: Record<string, Partial<TradingAsset>> = {
      'AAPL': { name: 'Apple Inc.', price: 224.50, change: '+1.2%', isUp: true, exchange: 'NASDAQ' },
      'NVDA': { name: 'NVIDIA Corp.', price: 128.40, change: '+3.3%', isUp: true, exchange: 'NASDAQ' },
      'MSFT': { name: 'Microsoft Corp.', price: 448.20, change: '-0.2%', isUp: false, exchange: 'NASDAQ' },
      'AMZN': { name: 'Amazon.com Inc.', price: 186.75, change: '+1.2%', isUp: true, exchange: 'NASDAQ' },
      'GOOGL': { name: 'Alphabet Inc.', price: 178.10, change: '-0.6%', isUp: false, exchange: 'NASDAQ' },
      'TSLA': { name: 'Tesla Inc.', price: 218.60, change: '+3.2%', isUp: true, exchange: 'NASDAQ' },
      'SPY': { name: 'SPDR S&P 500 ETF', price: 546.80, change: '+0.4%', isUp: true, exchange: 'NYSE' }
    };

    const info = priceMap[sym] || { name: `${sym} Asset`, price: 100.0, change: '+0.0%', isUp: true, exchange: 'US' };
    setSelectedAsset({
      symbol: sym,
      name: info.name || sym,
      price: info.price || 100.0,
      change: info.change || '+0.0%',
      region: 'US',
      isUp: info.isUp ?? true,
      exchange: info.exchange || 'NASDAQ',
      currency: '$'
    });
  };

  const handleOrderExecution = (order: {
    symbol: string;
    side: 'Buy' | 'Sell';
    type: 'Market' | 'Limit';
    quantity: number;
    price: number;
  }) => {
    const totalCost = order.quantity * order.price;
    if (order.side === 'Buy' && totalCost > cashBalance) {
      toast.error(`Insufficient balance: required $${totalCost.toLocaleString()}, available $${cashBalance.toLocaleString()}`);
      return;
    }

    const newCash = order.side === 'Buy' ? cashBalance - totalCost : cashBalance + totalCost;
    const newTrade = {
      id: `trade_${Date.now()}`,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      quantity: order.quantity,
      price: order.price,
      timestamp: new Date().toISOString()
    };

    if (updateData) {
      updateData({
        paperTrading: {
          cashBalance: newCash,
          startingCapital: userData?.paperTrading?.startingCapital ?? 100000,
          positions: positions,
          tradeHistory: [newTrade as any, ...tradeHistory]
        }
      });
    }

    toast.success(`Executed ${order.side} ${order.quantity} shares of ${order.symbol} @ $${order.price.toFixed(2)}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Asset Summary Banner */}
      <SpatialCard className="p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center font-extrabold text-lg font-mono">
              {safeAsset.symbol.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] tracking-tight">{safeAsset.symbol}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/10 text-[var(--text-muted)] font-mono">
                  {safeAsset.exchange || 'NASDAQ'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono">
                  {safeAsset.region || 'US'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{safeAsset.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs font-mono text-[var(--text-muted)]">Current Price</div>
              <div className="text-2xl font-extrabold font-mono tabular-nums tracking-tight font-semibold text-[var(--text-primary)]">
                ${safeAsset.price.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs font-mono text-[var(--text-muted)]">24h Change</div>
              <div className={`text-sm font-bold font-mono tabular-nums tracking-tight font-semibold flex items-center gap-1 ${
                safeAsset.isUp ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {safeAsset.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{safeAsset.change}</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-mono text-[var(--text-muted)]">Paper Cash</div>
              <div className="text-sm font-bold font-mono tabular-nums tracking-tight font-semibold text-[var(--text-primary)]">
                ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </SpatialCard>

      {/* Main Terminal Grid: Chart & Order Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Tick Chart & Order Book (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <LiveTickChart
            symbol={safeAsset.symbol}
            currentPrice={safeAsset.price}
            isUp={safeAsset.isUp}
            change={safeAsset.change}
            height={360}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MarketDepth symbol={safeAsset.symbol} currentPrice={safeAsset.price} />
            <AssetWatchlist onSelectSymbol={handleSelectSymbol} selectedSymbol={safeAsset.symbol} />
          </div>
        </div>

        {/* Right Column: Order Ticket & Execution (4 cols on desktop, full width on mobile) */}
        <div className="lg:col-span-4 space-y-6">
          <OrderTicket
            symbol={safeAsset.symbol}
            currentPrice={safeAsset.price}
            availableCash={cashBalance}
            onExecuteOrder={handleOrderExecution}
          />

          {/* Portfolio Quick Summary Card */}
          <SpatialCard className="p-4 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] mb-3">
              <h4 className="text-xs font-bold font-mono text-[var(--text-primary)] uppercase tracking-wider">
                Active Positions
              </h4>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {positions.length} Open
              </span>
            </div>

            {positions.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-muted)] font-mono">
                No active positions. Execute an order above to start paper trading.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                {positions.map((pos, idx) => (
                  <div key={pos.id || idx} className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/5 flex items-center justify-between text-xs font-mono tabular-nums tracking-tight font-semibold">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">{pos.symbol}</span>
                      <span className="text-[10px] text-[var(--text-muted)] ml-1.5">{pos.shares} shs</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[var(--text-primary)] font-mono tabular-nums">${((pos.currentPrice || pos.avgPrice || 0) * (pos.shares || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SpatialCard>
        </div>
      </div>
    </div>
  );
};

export default TradingTerminal;
