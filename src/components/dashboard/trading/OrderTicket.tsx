// Component: Buy/Sell Trade Order Execution Ticket

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { Card } from '../../ui/Card';
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
    <Card variant="glass" padding="md" className="border border-white/10">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <div>
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Order Ticket
          </h3>
          <p className="text-xs text-slate-400 font-mono">{symbol} • ${currentPrice.toFixed(2)}</p>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Cash: <strong className="text-white">${availableCash.toLocaleString()}</strong>
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
              : 'bg-white/5 text-slate-400 hover:text-white'
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
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          SELL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Order Type */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Type</span>
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
            {(['Market', 'Limit'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className={`px-2.5 py-0.5 rounded text-[11px] cursor-pointer ${
                  orderType === t ? 'bg-white/20 text-white' : 'text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Shares</label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
          />
        </div>

        {/* Limit Price if limit order */}
        {orderType === 'Limit' && (
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Limit Price ($)</label>
            <Input
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(parseFloat(e.target.value) || currentPrice)}
            />
          </div>
        )}

        {/* Total Cost Summary */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Est. Total</span>
          <span className="font-bold text-white">${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          className={`w-full justify-center ${side === 'Buy' ? 'bg-emerald-500 hover:bg-emerald-600 text-black' : 'bg-rose-500 hover:bg-rose-600'}`}
        >
          Execute {side} Order
        </Button>
      </form>
    </Card>
  );
};

export default OrderTicket;
