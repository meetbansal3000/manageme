import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Activity, BookOpen, Shield, Target, ArrowRightLeft, Book, PieChart as PieChartIcon, MessageCircle, Search, ChevronDown, CheckCircle, X, AlignRight, BarChart2 } from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { PortfolioPosition, TradeOrder } from '../types';
import { GrowwTradingAcademyModal } from './GrowwTradingAcademyModal';
import { LiveMarketPanel } from './LiveMarketPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollLock } from '../hooks/useScrollLock';
import { useMarketEngine, VolatilityProfile } from '../hooks/useMarketEngine';

// --- MOCK DATA DIRECTORY ---
const ASSET_DIRECTORY = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'STOCKS', exchange: 'NASDAQ', price: 190.25, change: '+1.1%', isUp: true, logo: 'A' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'STOCKS', exchange: 'NASDAQ', price: 1250.30, change: '+4.5%', isUp: true, logo: 'N' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'STOCKS', exchange: 'NASDAQ', price: 175.50, change: '-2.1%', isUp: false, logo: 'T' },
  { symbol: 'MSFT', name: 'Microsoft Corp', type: 'STOCKS', exchange: 'NASDAQ', price: 420.10, change: '+0.8%', isUp: true, logo: 'M' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', type: 'STOCKS', exchange: 'NSE', price: 2900.25, change: '+1.2%', isUp: true, logo: 'R' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', type: 'STOCKS', exchange: 'NSE', price: 1520.40, change: '-0.5%', isUp: false, logo: 'H' },
  { symbol: 'SHEL', name: 'Shell PLC', type: 'STOCKS', exchange: 'LSE', price: 2800.50, change: '-0.8%', isUp: false, logo: 'S' },
  { symbol: 'GOLD', name: 'Gold (XAU)', type: 'COMMODITY', exchange: 'MCX', price: 2450.20, change: '+1.2%', isUp: true, logo: 'G' },
  { symbol: 'BRENT', name: 'Brent Crude Oil', type: 'COMMODITY', exchange: 'NYMEX', price: 82.40, change: '+2.1%', isUp: true, logo: 'O' },
  { symbol: 'NIFTY', name: 'Nifty 50 ETF', type: 'ETF', exchange: 'NSE', price: 22500.60, change: '+0.7%', isUp: true, logo: 'N' },
];

interface PaperTradingTabProps {
  userData: UserTrackerData;
  updateData: (partial: Partial<UserTrackerData>) => void;
}

export const PaperTradingTab: React.FC<PaperTradingTabProps> = ({ userData, updateData }) => {
  const [activeSection, setActiveSection] = useState<'portfolio' | 'analytics' | 'academy'>('portfolio');
  const [portfolioTab, setPortfolioTab] = useState<'holdings' | 'positions'>('holdings');
  
  // Order Panel State
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  const [orderType, setOrderType] = useState<'Delivery' | 'Intraday'>('Delivery');
  const [orderMode, setOrderMode] = useState<'Market' | 'Limit' | 'SL'>('Market');
  const [orderSide, setOrderSide] = useState<'Buy' | 'Sell'>('Buy');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [limitPrice, setLimitPrice] = useState<number | ''>('');
  const [triggerPrice, setTriggerPrice] = useState<number | ''>('');

  const [activeModule, setActiveModule] = useState<string | null>(null);

  useScrollLock(!!activeModule);

  const { marketData, volatility, setVolatility } = useMarketEngine(selectedAsset?.price || 100, selectedAsset?.symbol || 'AAPL');

  const tradingData = {
    cashBalance: userData?.paperTrading?.cashBalance ?? 100000,
    startingCapital: userData?.paperTrading?.startingCapital ?? 100000,
    positions: Array.isArray(userData?.paperTrading?.positions) ? userData.paperTrading.positions : [],
    tradeHistory: Array.isArray(userData?.paperTrading?.tradeHistory) ? userData.paperTrading.tradeHistory : [],
    academyProgress: userData?.paperTrading?.academyProgress || {}
  };

  const calculatePortfolioValue = () => {
    const positionsValue = (tradingData.positions || []).reduce((acc, pos) => acc + ((pos.currentPrice || 0) * (pos.quantity || 0)), 0);
    return tradingData.cashBalance + positionsValue;
  };

  const totalValue = calculatePortfolioValue();
  const totalReturn = ((totalValue - tradingData.startingCapital) / tradingData.startingCapital) * 100;

  const filteredAssets = ASSET_DIRECTORY.filter(a => 
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !quantity) return;

    const qty = Number(quantity);
    const price = orderMode === 'Market' ? marketData.currentPrice : Number(limitPrice);
    const totalCost = price * qty;

    if (orderSide === 'Buy' && totalCost > tradingData.cashBalance) {
      alert("Insufficient funds for this trade.");
      return;
    }

    const newTrade: TradeOrder = {
      id: Date.now().toString(),
      symbol: selectedAsset.symbol,
      type: orderMode as any,
      side: orderSide,
      quantity: qty,
      executionPrice: price,
      status: 'Executed',
      timestamp: Date.now()
    };

    let newPositions = [...tradingData.positions];
    const existingIdx = newPositions.findIndex(p => p.symbol === selectedAsset.symbol);

    let newBalance = tradingData.cashBalance;

    if (orderSide === 'Buy') {
      newBalance -= totalCost;
      if (existingIdx >= 0) {
        const p = newPositions[existingIdx];
        const newTotalCost = (p.averageEntryPrice * p.quantity) + totalCost;
        const newQty = p.quantity + qty;
        newPositions[existingIdx] = { ...p, quantity: newQty, averageEntryPrice: newTotalCost / newQty, currentPrice: price };
      } else {
        newPositions.push({
          id: Date.now().toString(),
          symbol: selectedAsset.symbol,
          name: selectedAsset.name,
          assetClass: selectedAsset.type === 'COMMODITY' ? 'Commodity' : selectedAsset.type === 'ETF' ? 'ETF' : 'Stock',
          quantity: qty,
          averageEntryPrice: price,
          currentPrice: price
        });
      }
    } else {
      if (existingIdx >= 0) {
        const p = newPositions[existingIdx];
        if (p.quantity < qty) {
          alert("Insufficient quantity to sell.");
          return;
        }
        newBalance += totalCost;
        if (p.quantity === qty) {
          newPositions.splice(existingIdx, 1);
        } else {
          newPositions[existingIdx] = { ...p, quantity: p.quantity - qty, currentPrice: price };
        }
      } else {
        alert("You do not own this asset.");
        return;
      }
    }

    updateData({
      paperTrading: {
        ...tradingData,
        cashBalance: newBalance,
        positions: newPositions,
        tradeHistory: [newTrade, ...tradingData.tradeHistory]
      }
    });

    setQuantity('');
    setLimitPrice('');
    setTriggerPrice('');
    alert(`Order Executed: ${orderSide} ${qty} ${selectedAsset.symbol} @ $${price}`);
  };

  const estimatedCharges = quantity && selectedAsset ? (Number(quantity) * marketData.currentPrice * 0.001) : 0;
  const marginRequired = quantity && selectedAsset ? (Number(quantity) * (orderMode === 'Market' ? marketData.currentPrice : Number(limitPrice || marketData.currentPrice))) : 0;

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      
      {activeModule && (
        <GrowwTradingAcademyModal 
          moduleId={activeModule}
          onClose={() => setActiveModule(null)}
          onComplete={() => {
            updateData({
              paperTrading: {
                ...tradingData,
                academyProgress: { ...tradingData.academyProgress, [activeModule]: true }
              }
            });
          }}
        />
      )}

      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Groww Terminal</h1>
          <p className="text-[var(--text-secondary)] mt-1">Virtual Trading & Portfolio Management</p>
        </div>
        <div className="flex bg-[#111114] p-1 rounded-xl border border-[#2A2A2D]">
          <button 
            onClick={() => setActiveSection('portfolio')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeSection === 'portfolio' ? 'bg-[#2A2A2D] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Terminal
          </button>
          <button 
            onClick={() => setActiveSection('analytics')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeSection === 'analytics' ? 'bg-[#2A2A2D] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveSection('academy')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeSection === 'academy' ? 'bg-[#2A2A2D] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Academy
          </button>
        </div>
      </div>

      {activeSection === 'portfolio' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: ORDER PANEL */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-[#111114] border border-[#2A2A2D] rounded-2xl p-6 shadow-xl relative">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <Search className="w-5 h-5 text-emerald-500" /> Asset Search
              </h2>
              
              {/* SMART SEARCH */}
              <div className="relative mb-6">
                <input 
                  type="text" 
                  placeholder="Search AAPL, Gold, Nifty..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-[#18181B] border border-[#2A2A2D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                
                <AnimatePresence>
                  {showDropdown && searchQuery && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#18181B] border border-[#2A2A2D] rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto"
                    >
                      {filteredAssets.map(asset => (
                        <div 
                          key={asset.symbol} 
                          onClick={() => { setSelectedAsset(asset); setShowDropdown(false); setSearchQuery(asset.symbol); }}
                          className="p-3 hover:bg-[#2A2A2D] cursor-pointer border-b border-[#2A2A2D]/50 last:border-0 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                              {asset.logo}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{asset.symbol}</div>
                              <div className="text-xs text-gray-400">{asset.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-white text-sm">${asset.price.toFixed(2)}</div>
                            <div className={`text-[10px] ${asset.isUp ? 'text-emerald-400' : 'text-red-400'}`}>{asset.change}</div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ORDER EXECUTION PANEL */}
              {selectedAsset && (
                <form onSubmit={handleExecuteTrade} className="space-y-5 border-t border-[#2A2A2D] pt-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg text-white">{selectedAsset.symbol}</span>
                    <span className={`text-sm font-semibold ${marketData.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>${marketData.currentPrice.toFixed(2)}</span>
                  </div>

                  {/* Order Type Toggle */}
                  <div className="flex bg-[#18181B] rounded-lg p-1">
                    {['Delivery', 'Intraday'].map(t => (
                      <button 
                        key={t} type="button" onClick={() => setOrderType(t as any)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md ${orderType === t ? 'bg-[#2A2A2D] text-white' : 'text-gray-500'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Order Mode Toggle */}
                  <div className="flex gap-2">
                    {['Market', 'Limit', 'SL'].map(m => (
                      <button 
                        key={m} type="button" onClick={() => setOrderMode(m as any)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md border ${orderMode === m ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-[#2A2A2D] text-gray-400'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 mb-1">Qty</label>
                      <input 
                        type="number" required min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                        className="w-full bg-[#18181B] border border-[#2A2A2D] rounded-lg p-2 text-white text-sm focus:border-emerald-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 mb-1">Price</label>
                      <input 
                        type="number" disabled={orderMode === 'Market'} 
                        value={orderMode === 'Market' ? Number(marketData.currentPrice.toFixed(2)) : limitPrice} 
                        onChange={e => setLimitPrice(Number(e.target.value))}
                        className="w-full bg-[#18181B] border border-[#2A2A2D] rounded-lg p-2 text-white text-sm disabled:opacity-50 focus:border-emerald-500" 
                      />
                    </div>
                  </div>

                  {/* Smart Presets */}
                  <div className="flex gap-2">
                    {[1, 10, 50, 100].map(q => (
                      <button key={q} type="button" onClick={() => setQuantity(q)} className="flex-1 py-1 bg-[#18181B] border border-[#2A2A2D] rounded text-[10px] text-gray-400 hover:text-white">+{q}</button>
                    ))}
                  </div>

                  {/* Summary Bar */}
                  <div className="bg-[#18181B] rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Margin Req.</span>
                      <span className="text-white">${marginRequired.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Charges (Est)</span>
                      <span className="text-white">${estimatedCharges.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" onClick={() => setOrderSide('Buy')} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
                      BUY
                    </button>
                    <button type="submit" onClick={() => setOrderSide('Sell')} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors">
                      SELL
                    </button>
                  </div>

                </form>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-[#111114] border border-[#2A2A2D] rounded-2xl p-5 shadow-xl space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-gray-400 text-sm">Available Margin</span>
                 <span className="text-white font-bold">${tradingData.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-400 text-sm">Total Value</span>
                 <span className="text-white font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="w-full h-1 bg-[#2A2A2D] rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500" style={{ width: `${(tradingData.cashBalance / totalValue) * 100}%` }}></div>
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN: DASHBOARD */}
          <div className="lg:col-span-2 space-y-6">
            
            {selectedAsset && (
              <LiveMarketPanel 
                asset={selectedAsset}
                marketData={marketData}
                volatility={volatility}
                setVolatility={setVolatility}
              />
            )}

            {/* Holdings & Positions Switcher */}
            <div className="bg-[#111114] border border-[#2A2A2D] rounded-2xl p-6 shadow-xl">
              <div className="flex gap-6 border-b border-[#2A2A2D] mb-6">
                <button 
                  onClick={() => setPortfolioTab('holdings')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${portfolioTab === 'holdings' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-white'}`}
                >
                  Holdings
                </button>
                <button 
                  onClick={() => setPortfolioTab('positions')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${portfolioTab === 'positions' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-white'}`}
                >
                  Positions (0)
                </button>
              </div>

              {portfolioTab === 'holdings' ? (
                <div>
                  {tradingData.positions.length === 0 ? (
                     <div className="text-center py-12">
                       <Briefcase className="w-12 h-12 text-[#2A2A2D] mx-auto mb-4" />
                       <h4 className="text-white font-bold mb-1">No Holdings Yet</h4>
                       <p className="text-gray-500 text-sm">Invest in stocks, ETFs, or commodities to see them here.</p>
                     </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-[#2A2A2D]">
                            <th className="pb-3 px-2">Instrument</th>
                            <th className="pb-3 px-2 text-right">Qty</th>
                            <th className="pb-3 px-2 text-right">Avg. Cost</th>
                            <th className="pb-3 px-2 text-right">LTP</th>
                            <th className="pb-3 px-2 text-right">P&L</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tradingData.positions.map((pos) => {
                            const invested = pos.quantity * pos.averageEntryPrice;
                            const current = pos.quantity * pos.currentPrice;
                            const pnl = current - invested;
                            const pnlPct = (pnl / invested) * 100;
                            return (
                              <tr key={pos.id} className="border-b border-[#2A2A2D] last:border-0 hover:bg-[#18181B]">
                                <td className="py-4 px-2">
                                  <div className="font-bold text-white text-sm">{pos.symbol}</div>
                                  <div className="text-[10px] text-gray-500">{pos.assetClass}</div>
                                </td>
                                <td className="py-4 px-2 text-right text-gray-300">{pos.quantity}</td>
                                <td className="py-4 px-2 text-right text-gray-300">${(pos.averageEntryPrice || 0).toFixed(2)}</td>
                                <td className="py-4 px-2 text-right text-gray-300">${(pos.currentPrice || 0).toFixed(2)}</td>
                                <td className={`py-4 px-2 text-right font-bold text-sm ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {pnl >= 0 ? '+' : ''}{(pnl || 0).toFixed(2)}
                                  <div className="text-[10px] font-normal">{(pnlPct || 0).toFixed(2)}%</div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                   <Activity className="w-12 h-12 text-[#2A2A2D] mx-auto mb-4" />
                   <h4 className="text-white font-bold mb-1">No Active Positions</h4>
                   <p className="text-gray-500 text-sm">Intraday and F&O trades will appear here.</p>
                </div>
              )}
            </div>

            {/* Market Depth & Fundamentals */}
            {selectedAsset && (
              <div className="space-y-6">
                <div className="bg-[#111114] border border-[#2A2A2D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-emerald-500" /> Market Depth (L2) - {selectedAsset.symbol}
                    </h3>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-2 uppercase"><span>Bid</span><span>Qty</span></div>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="flex justify-between text-xs relative px-1">
                            <div className="absolute top-0 right-0 h-full bg-emerald-500/10" style={{ width: `${Math.random() * 100}%` }}></div>
                            <span className="text-emerald-400 font-medium z-10">${(selectedAsset.price - (i * 0.1)).toFixed(2)}</span>
                            <span className="text-gray-300 z-10">{Math.floor(Math.random() * 500) + 10}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-2 uppercase"><span>Ask</span><span>Qty</span></div>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="flex justify-between text-xs relative px-1">
                            <div className="absolute top-0 left-0 h-full bg-red-500/10" style={{ width: `${Math.random() * 100}%` }}></div>
                            <span className="text-red-400 font-medium z-10">${(selectedAsset.price + (i * 0.1)).toFixed(2)}</span>
                            <span className="text-gray-300 z-10">{Math.floor(Math.random() * 500) + 10}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="w-px bg-[#2A2A2D] hidden md:block"></div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase">Open</span>
                      <span className="font-bold text-white">${(selectedAsset.price * 0.99).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase">Prev Close</span>
                      <span className="font-bold text-white">${(selectedAsset.price * 0.98).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase">Volume</span>
                      <span className="font-bold text-white">{(Math.random() * 10).toFixed(1)}M</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase">Avg Trade Price</span>
                      <span className="font-bold text-white">${(selectedAsset.price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Highlights */}
                <div className="bg-[#111114] border border-[#2A2A2D] rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4">Fundamentals & Valuation</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase mb-1">52-Week Range</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span>${(selectedAsset.price * 0.7).toFixed(0)}</span>
                        <div className="flex-1 h-1 bg-[#2A2A2D] rounded-full relative">
                          <div className="absolute top-0 left-[30%] right-[10%] h-full bg-emerald-500 rounded-full"></div>
                        </div>
                        <span>${(selectedAsset.price * 1.1).toFixed(0)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase">Market Cap</span>
                      <span className="font-bold text-white">${(Math.random() * 1000 + 50).toFixed(1)}B</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase">P/E Ratio (TTM)</span>
                      <span className="font-bold text-white">{(Math.random() * 30 + 10).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 uppercase">1Y Return</span>
                      <span className={`font-bold ${selectedAsset.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedAsset.isUp ? '+' : '-'}{(Math.random() * 30).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Academy Module 1 */}
          <div className="bg-[#111114] p-6 rounded-2xl border border-[#2A2A2D] flex flex-col hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Book className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Core Trading Theory</h3>
            <p className="text-sm text-gray-400 mb-6 flex-grow">
              Bid-Ask Spreads, Liquidity, Slippage, CAPM, Beta, and Modern Portfolio Theory.
            </p>
            <button 
              onClick={() => setActiveModule('theory')}
              className={`w-full py-3 rounded-xl font-bold transition-all ${tradingData.academyProgress['theory'] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white text-black hover:bg-gray-200'}`}
            >
              {tradingData.academyProgress['theory'] ? 'Completed - Review' : 'Start Module'}
            </button>
          </div>
          
          {/* Academy Module 2 */}
          <div className="bg-[#111114] p-6 rounded-2xl border border-[#2A2A2D] flex flex-col hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Financial Statements</h3>
            <p className="text-sm text-gray-400 mb-6 flex-grow">
              Interactive metrics matrix: ROE, ROIC, Current Ratio, Net Debt/EBITDA, and Working Capital.
            </p>
            <button 
              onClick={() => setActiveModule('statements')}
              className={`w-full py-3 rounded-xl font-bold transition-all ${tradingData.academyProgress['statements'] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white text-black hover:bg-gray-200'}`}
            >
              {tradingData.academyProgress['statements'] ? 'Completed - Review' : 'Start Module'}
            </button>
          </div>
          
          {/* Academy Module 3 */}
          <div className="bg-[#111114] p-6 rounded-2xl border border-[#2A2A2D] flex flex-col hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Valuation Sandbox</h3>
            <p className="text-sm text-gray-400 mb-6 flex-grow">
              Interactive DCF modeling, P/E & EV/EBITDA multiples, and introductory LBO math.
            </p>
            <button 
              onClick={() => setActiveModule('valuation')}
              className={`w-full py-3 rounded-xl font-bold transition-all ${tradingData.academyProgress['valuation'] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white text-black hover:bg-gray-200'}`}
            >
              {tradingData.academyProgress['valuation'] ? 'Completed - Review' : 'Start Module'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
