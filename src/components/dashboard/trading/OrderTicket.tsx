// Component: Buy/Sell Trade Order Execution Ticket

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { SpatialCard } from '../../ui/SpatialCard';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

export interface OrderTicketProps {
  symbol?: string;
  currentPrice?: number;
  availableCash?: number;
  onExecuteOrder?: (order: {
    symbol: string;
    side: 'Buy' | 'Sell';
    type: 'Market' | 'Limit';
    quantity: number;
    price: number;
  }) => void;
}

export const OrderTicket: React.FC<OrderTicketProps> = ({
  symbol = 'NVDA',
  currentPrice = 128.40,
  availableCash = 25000,
  onExecuteOrder
}) => {
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(currentPrice);

  const effectivePrice = orderType === 'Market' ? currentPrice : limitPrice;
  const estimatedTotal = quantity * effectivePrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    if (onExecuteOrder) {
      onExecuteOrder({
        symbol,
        side,
        type: orderType,
        quantity,
        price: effectivePrice
      });
    }
  };

  return (
    <SpatialCard className="p-4 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono uppercase tracking-wider">
            Order Ticket
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-mono tabular-nums tracking-tight font-semibold">
            {symbol} • ${currentPrice.toFixed(2)}
          </p>
        </div>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          Cash: <strong className="text-[var(--text-primary)] font-mono tabular-nums tracking-tight font-semibold">${availableCash.toLocaleString()}</strong>
        </span>
      </div>

      {/* Side Selector (Buy / Sell) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSide('Buy')}
          className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            side === 'Buy'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-black/[0.03] dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          BUY
        </button>
        <button
          type="button"
          onClick={() => setSide('Sell')}
          className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            side === 'Sell'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
              : 'bg-black/[0.03] dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          SELL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Order Type */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--text-muted)]">Type</span>
          <div className="flex gap-1 bg-black/[0.03] dark:bg-white/5 p-1 rounded-lg">
            {(['Market', 'Limit'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  orderType === t
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-[10px] font-mono uppercase text-[var(--text-muted)] block mb-1">
            Shares Quantity
          </label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
            className="font-mono tabular-nums tracking-tight font-semibold"
          />
        </div>

        {/* Limit Price if Limit order */}
        {orderType === 'Limit' && (
          <div>
            <label className="text-[10px] font-mono uppercase text-[var(--text-muted)] block mb-1">
              Limit Price ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
              className="font-mono tabular-nums tracking-tight font-semibold"
            />
          </div>
        )}

        {/* Est. Total */}
        <div className="flex items-center justify-between py-2 border-t border-black/[0.06] dark:border-white/[0.08] text-xs font-mono">
          <span className="text-[var(--text-muted)]">Estimated Total</span>
          <span className="font-mono tabular-nums tracking-tight font-semibold text-[var(--text-primary)]">
            ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <Button
          type="submit"
          variant={side === 'Buy' ? 'primary' : 'danger'}
          className="w-full font-mono text-xs uppercase tracking-wider py-2.5"
        >
          {side} {quantity} {symbol}
        </Button>
      </form>
    </SpatialCard>
  );
};

export default OrderTicket;
