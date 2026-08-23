// Component: Real-Time Order Book & Market Depth Visualization

import React, { useMemo } from 'react';
import { MarketDepthOrder } from '../../../types';
import { Card } from '../../ui/Card';

export interface MarketDepthProps {
  symbol?: string;
  currentPrice?: number;
  bids?: MarketDepthOrder[];
  asks?: MarketDepthOrder[];
}

export const MarketDepth: React.FC<MarketDepthProps> = ({
  symbol = 'AAPL',
  currentPrice = 224.50,
  bids: customBids,
  asks: customAsks
}) => {
  // Generate realistic order book if not passed
  const bids = useMemo(() => {
    if (customBids && customBids.length > 0) return customBids;
    return [
      { id: 'b1', price: currentPrice - 0.15, amount: 140, total: 31409, type: 'bid' as const },
      { id: 'b2', price: currentPrice - 0.35, amount: 350, total: 78452, type: 'bid' as const },
      { id: 'b3', price: currentPrice - 0.60, amount: 520, total: 116428, type: 'bid' as const },
      { id: 'b4', price: currentPrice - 0.90, amount: 890, total: 199004, type: 'bid' as const },
      { id: 'b5', price: currentPrice - 1.20, amount: 1200, total: 268000, type: 'bid' as const }
    ];
  }, [customBids, currentPrice]);

  const asks = useMemo(() => {
    if (customAsks && customAsks.length > 0) return customAsks;
    return [
      { id: 'a1', price: currentPrice + 0.15, amount: 180, total: 40437, type: 'ask' as const },
      { id: 'a2', price: currentPrice + 0.40, amount: 410, total: 92209, type: 'ask' as const },
      { id: 'a3', price: currentPrice + 0.75, amount: 680, total: 153170, type: 'ask' as const },
      { id: 'a4', price: currentPrice + 1.05, amount: 950, total: 214272, type: 'ask' as const },
      { id: 'a5', price: currentPrice + 1.40, amount: 1400, total: 316260, type: 'ask' as const }
    ];
  }, [customAsks, currentPrice]);

  const maxTotal = useMemo(() => {
    const validBids = (bids || []).map(b => b?.total || 0);
    const validAsks = (asks || []).map(a => a?.total || 0);
    const maxBid = validBids.length > 0 ? Math.max(...validBids, 1) : 1;
    const maxAsk = validAsks.length > 0 ? Math.max(...validAsks, 1) : 1;
    return Math.max(maxBid, maxAsk, 1);
  }, [bids, asks]);

  const spread = useMemo(() => {
    const topAsk = asks?.[0]?.price;
    const topBid = bids?.[0]?.price;
    if (topAsk !== undefined && topBid !== undefined) {
      return (topAsk - topBid).toFixed(2);
    }
    return '0.30';
  }, [asks, bids]);

  return (
    <Card variant="glass" padding="sm" className="border border-white/10">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <h4 className="text-xs font-bold font-mono tracking-wider text-slate-300">
          ORDER BOOK ({symbol})
        </h4>
        <span className="text-[10px] font-mono text-emerald-400">
          SPREAD: ${spread}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
        {/* Bids (Buy Orders) */}
        <div>
          <div className="flex justify-between text-slate-500 text-[10px] mb-1.5 uppercase">
            <span>Bid Price</span>
            <span>Size</span>
          </div>
          <div className="space-y-1">
            {(bids || []).map((bid) => {
              if (!bid) return null;
              const depthPct = Math.min(100, Math.max(0, Math.round(((bid.total || 0) / maxTotal) * 100)));
              return (
                <div key={bid.id || `${bid.price}-${bid.amount}`} className="relative flex justify-between items-center py-0.5 px-1 rounded overflow-hidden">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-emerald-400 font-semibold relative z-10">
                    ${(bid.price || 0).toFixed(2)}
                  </span>
                  <span className="text-slate-300 relative z-10">{bid.amount || 0}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div>
          <div className="flex justify-between text-slate-500 text-[10px] mb-1.5 uppercase">
            <span>Ask Price</span>
            <span>Size</span>
          </div>
          <div className="space-y-1">
            {(asks || []).map((ask) => {
              if (!ask) return null;
              const depthPct = Math.min(100, Math.max(0, Math.round(((ask.total || 0) / maxTotal) * 100)));
              return (
                <div key={ask.id || `${ask.price}-${ask.amount}`} className="relative flex justify-between items-center py-0.5 px-1 rounded overflow-hidden">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-rose-400 font-semibold relative z-10">
                    ${(ask.price || 0).toFixed(2)}
                  </span>
                  <span className="text-slate-300 relative z-10">{ask.amount || 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketDepth;
