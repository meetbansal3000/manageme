import React, { useState, useEffect } from 'react';
import { X, Search, GripVertical } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

export type Region = 'UK & Europe' | 'US Markets' | 'India' | 'Global / Multi-Region';

export interface TickerAsset {
  symbol: string;
  region: Region;
  price: string;
  change: string;
  up: boolean;
}

export const TICKER_CATALOG: TickerAsset[] = [
  { symbol: 'FTSE 100', region: 'UK & Europe', price: '8,200.50', change: '+0.5%', up: true },
  { symbol: 'LSE', region: 'UK & Europe', price: '9,500.20', change: '-0.3%', up: false },
  { symbol: 'Stoxx 600', region: 'UK & Europe', price: '500.40', change: '+0.1%', up: true },
  { symbol: 'SHEL', region: 'UK & Europe', price: '2,800.50', change: '-0.8%', up: false },
  
  { symbol: 'S&P 500', region: 'US Markets', price: '5,300.10', change: '+1.2%', up: true },
  { symbol: 'NASDAQ', region: 'US Markets', price: '16,500.80', change: '+1.5%', up: true },
  { symbol: 'NYSE', region: 'US Markets', price: '17,200.40', change: '-0.4%', up: false },
  { symbol: 'NVDA', region: 'US Markets', price: '1,250.30', change: '+4.5%', up: true },
  { symbol: 'AAPL', region: 'US Markets', price: '190.25', change: '+1.1%', up: true },
  
  { symbol: 'Nifty 50', region: 'India', price: '22,500.60', change: '+0.7%', up: true },
  { symbol: 'BSE', region: 'India', price: '74,200.10', change: '+0.6%', up: true },
  { symbol: 'RELIANCE', region: 'India', price: '2,900.25', change: '+1.2%', up: true },
  
  { symbol: 'Gold', region: 'Global / Multi-Region', price: '2,450.20', change: '+1.2%', up: true },
  { symbol: 'Silver', region: 'Global / Multi-Region', price: '30.15', change: '-0.5%', up: false },
  { symbol: 'Brent Crude', region: 'Global / Multi-Region', price: '82.40', change: '+2.1%', up: true },
  { symbol: 'GBP/USD', region: 'Global / Multi-Region', price: '1.2850', change: '+0.1%', up: true },
  { symbol: 'USD/INR', region: 'Global / Multi-Region', price: '83.50', change: '-0.1%', up: false },
  { symbol: 'EUR/USD', region: 'Global / Multi-Region', price: '1.0920', change: '-0.2%', up: false }
];

interface Props {
  onClose: () => void;
  activeTickers: TickerAsset[];
  setActiveTickers: (tickers: TickerAsset[]) => void;
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
}

export const TickerSettingsModal: React.FC<Props> = ({ onClose, activeTickers, setActiveTickers, selectedRegion, setSelectedRegion }) => {
  const [search, setSearch] = useState('');
  
  // Local state for ordering so we only commit on close or toggle
  const [orderedTickers, setOrderedTickers] = useState<TickerAsset[]>(activeTickers);

  useEffect(() => {
    setActiveTickers(orderedTickers);
  }, [orderedTickers]);

  const availableTickers = TICKER_CATALOG.filter(t => 
    (selectedRegion === 'Global / Multi-Region' || t.region === selectedRegion) &&
    t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTicker = (ticker: TickerAsset) => {
    const isSelected = orderedTickers.some(t => t.symbol === ticker.symbol);
    if (isSelected) {
      setOrderedTickers(orderedTickers.filter(t => t.symbol !== ticker.symbol));
    } else {
      setOrderedTickers([...orderedTickers, ticker]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--surface-solid)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold">Ticker Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-[var(--text-secondary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* Region Selector */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Region Filter</label>
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as Region)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="Global / Multi-Region">Global / Multi-Region (Show All)</option>
              <option value="UK & Europe">🇬🇧 UK & Europe</option>
              <option value="US Markets">🇺🇸 US Markets</option>
              <option value="India">🇮🇳 India</option>
            </select>
          </div>

          {/* Active Tickers (Reorderable) */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Active Tickers (Drag to Reorder)</label>
            {orderedTickers.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No tickers selected. Add some below.</p>
            ) : (
              <Reorder.Group axis="y" values={orderedTickers} onReorder={setOrderedTickers} className="space-y-2">
                {orderedTickers.map((ticker) => (
                  <Reorder.Item key={ticker.symbol} value={ticker} className="flex items-center justify-between p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="font-bold">{ticker.symbol}</span>
                    </div>
                    <button 
                      onClick={() => toggleTicker(ticker)}
                      className="text-xs font-semibold text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* Asset Search */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Add More Assets</label>
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search stocks, commodities, FX..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {availableTickers.filter(t => !orderedTickers.some(ot => ot.symbol === t.symbol)).map(ticker => (
                <div key={ticker.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-[var(--border)] transition-colors">
                  <div>
                    <span className="font-bold text-sm block">{ticker.symbol}</span>
                    <span className="text-[10px] text-gray-400">{ticker.region}</span>
                  </div>
                  <button 
                    onClick={() => toggleTicker(ticker)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--accent)] text-white hover:brightness-110"
                  >
                    Add
                  </button>
                </div>
              ))}
              {availableTickers.filter(t => !orderedTickers.some(ot => ot.symbol === t.symbol)).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No unselected assets match your search in this region.</p>
              )}
            </div>
          </div>

        </div>
        
        <div className="p-4 border-t border-[var(--border)] bg-white/5">
          <button onClick={onClose} className="w-full py-3 bg-[var(--accent)] text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg">
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
