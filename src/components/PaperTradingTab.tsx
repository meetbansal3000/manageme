import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  Activity, 
  BookOpen, 
  Target, 
  BarChart2, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Layers, 
  PieChart as PieChartIcon, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  Book,
  Download,
  Trash2,
  Scale,
  Award,
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { PortfolioPosition, TradeOrder } from '../types';
import { GrowwTradingAcademyModal } from './GrowwTradingAcademyModal';
import { LiveMarketPanel } from './LiveMarketPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollLock } from '../hooks/useScrollLock';
import { useMarketEngine } from '../hooks/useMarketEngine';
import { useWatchlist, WatchlistItem } from '../hooks/useWatchlist';
import { Star, Globe, Eye, Sparkles as SparklesIcon, Plus, Check } from 'lucide-react';

// --- MULTI-REGION CONFIGURATION ---
export type MarketRegion = 'US' | 'India' | 'UK' | 'EU' | 'Singapore';

export interface MarketRegionConfig {
  id: MarketRegion;
  label: string;
  name: string;
  flag: string;
  currency: string;
  suffix: string;
  exchanges: string[];
  description: string;
}

export const MARKET_REGIONS: MarketRegionConfig[] = [
  { id: 'US', label: 'US', name: 'United States', flag: '🇺🇸', currency: '$', suffix: '', exchanges: ['NASDAQ', 'NYSE'], description: 'Wall Street & Tech Leaders' },
  { id: 'India', label: 'India', name: 'India', flag: '🇮🇳', currency: '₹', suffix: '.NS', exchanges: ['NSE', 'BSE'], description: 'Nifty & Dalal Street' },
  { id: 'UK', label: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: '£', suffix: '.L', exchanges: ['LSE'], description: 'FTSE 100 & London' },
  { id: 'EU', label: 'EU', name: 'European Union', flag: '🇪🇺', currency: '€', suffix: '.PA', exchanges: ['Euronext', 'XETRA'], description: 'Euro Stoxx & Pan-EU' },
  { id: 'Singapore', label: 'Singapore', name: 'Singapore', flag: '🇸🇬', currency: 'S$', suffix: '.SI', exchanges: ['SGX'], description: 'Straits Times & SGX' }
];

export interface MarketAsset {
  symbol: string;
  name: string;
  type: 'STOCKS' | 'COMMODITY' | 'ETF';
  exchange: string;
  region: MarketRegion;
  currency: string;
  price: number;
  change: string;
  isUp: boolean;
  logo: string;
  sparkline: number[];
}

// --- CURATED GLOBAL ASSETS DIRECTORY ---
export const GLOBAL_ASSETS: MarketAsset[] = [
  // US
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'STOCKS', exchange: 'NASDAQ', region: 'US', currency: '$', price: 232.80, change: '+1.1%', isUp: true, logo: 'A', sparkline: [228, 229, 230, 231, 232.8] },
  { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'STOCKS', exchange: 'NASDAQ', region: 'US', currency: '$', price: 138.45, change: '+4.5%', isUp: true, logo: 'N', sparkline: [131, 133, 134, 136, 138.45] },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'STOCKS', exchange: 'NASDAQ', region: 'US', currency: '$', price: 218.90, change: '-2.1%', isUp: false, logo: 'T', sparkline: [224, 223, 220, 219, 218.9] },
  { symbol: 'MSFT', name: 'Microsoft Corp', type: 'STOCKS', exchange: 'NASDAQ', region: 'US', currency: '$', price: 448.60, change: '+0.8%', isUp: true, logo: 'M', sparkline: [444, 445, 446, 447, 448.6] },
  { symbol: 'AMZN', name: 'Amazon.com', type: 'STOCKS', exchange: 'NASDAQ', region: 'US', currency: '$', price: 194.30, change: '+1.4%', isUp: true, logo: 'A', sparkline: [191, 192, 193, 193.5, 194.3] },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'STOCKS', exchange: 'NASDAQ', region: 'US', currency: '$', price: 182.40, change: '-0.4%', isUp: false, logo: 'G', sparkline: [184, 183.5, 183, 182.8, 182.4] },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'ETF', exchange: 'NYSE', region: 'US', currency: '$', price: 598.40, change: '+0.7%', isUp: true, logo: 'S', sparkline: [594, 595, 596, 597, 598.4] },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', exchange: 'NASDAQ', region: 'US', currency: '$', price: 518.20, change: '+0.9%', isUp: true, logo: 'Q', sparkline: [513, 514, 516, 517, 518.2] },
  { symbol: 'GOLD', name: 'Gold (XAU/USD)', type: 'COMMODITY', exchange: 'MCX', region: 'US', currency: '$', price: 2892.40, change: '+1.2%', isUp: true, logo: 'G', sparkline: [2860, 2870, 2880, 2888, 2892.4] },
  { symbol: 'BRENT', name: 'Brent Crude Oil', type: 'COMMODITY', exchange: 'NYMEX', region: 'US', currency: '$', price: 74.35, change: '-1.2%', isUp: false, logo: 'O', sparkline: [76, 75.5, 75, 74.6, 74.35] },

  // India
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', type: 'STOCKS', exchange: 'NSE', region: 'India', currency: '₹', price: 2980.50, change: '+1.2%', isUp: true, logo: 'R', sparkline: [2940, 2955, 2965, 2975, 2980.5] },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', type: 'STOCKS', exchange: 'NSE', region: 'India', currency: '₹', price: 4190.20, change: '+0.9%', isUp: true, logo: 'T', sparkline: [4150, 4165, 4175, 4180, 4190.2] },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', type: 'STOCKS', exchange: 'NSE', region: 'India', currency: '₹', price: 1640.80, change: '+1.5%', isUp: true, logo: 'H', sparkline: [1615, 1625, 1630, 1638, 1640.8] },
  { symbol: 'INFY.NS', name: 'Infosys Ltd', type: 'STOCKS', exchange: 'NSE', region: 'India', currency: '₹', price: 1875.40, change: '-0.3%', isUp: false, logo: 'I', sparkline: [1885, 1880, 1878, 1876, 1875.4] },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', type: 'STOCKS', exchange: 'NSE', region: 'India', currency: '₹', price: 1210.60, change: '+2.1%', isUp: true, logo: 'I', sparkline: [1185, 1195, 1200, 1205, 1210.6] },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd', type: 'STOCKS', exchange: 'NSE', region: 'India', currency: '₹', price: 945.30, change: '+3.4%', isUp: true, logo: 'T', sparkline: [915, 925, 930, 938, 945.3] },
  { symbol: 'NIFTY50', name: 'NIFTY 50 ETF', type: 'ETF', exchange: 'NSE', region: 'India', currency: '₹', price: 24850.00, change: '+0.8%', isUp: true, logo: 'N', sparkline: [24650, 24700, 24750, 24800, 24850] },

  // UK
  { symbol: 'HSBA.L', name: 'HSBC Holdings plc', type: 'STOCKS', exchange: 'LSE', region: 'UK', currency: '£', price: 692.40, change: '+0.6%', isUp: true, logo: 'H', sparkline: [688, 689, 690, 691, 692.4] },
  { symbol: 'AZN.L', name: 'AstraZeneca plc', type: 'STOCKS', exchange: 'LSE', region: 'UK', currency: '£', price: 12450.00, change: '+1.1%', isUp: true, logo: 'A', sparkline: [12300, 12350, 12400, 12420, 12450] },
  { symbol: 'SHEL.L', name: 'Shell plc', type: 'STOCKS', exchange: 'LSE', region: 'UK', currency: '£', price: 2680.00, change: '-0.5%', isUp: false, logo: 'S', sparkline: [2695, 2690, 2688, 2684, 2680] },
  { symbol: 'BP.L', name: 'BP plc', type: 'STOCKS', exchange: 'LSE', region: 'UK', currency: '£', price: 425.80, change: '-0.8%', isUp: false, logo: 'B', sparkline: [430, 428, 427, 426, 425.8] },
  { symbol: 'RIO.L', name: 'Rio Tinto Group', type: 'STOCKS', exchange: 'LSE', region: 'UK', currency: '£', price: 4920.00, change: '+1.8%', isUp: true, logo: 'R', sparkline: [4830, 4850, 4880, 4900, 4920] },
  { symbol: 'FTSE100', name: 'iShares Core FTSE 100', type: 'ETF', exchange: 'LSE', region: 'UK', currency: '£', price: 842.80, change: '+0.5%', isUp: true, logo: 'F', sparkline: [838, 839, 840, 841.5, 842.8] },

  // EU
  { symbol: 'ASML.AS', name: 'ASML Holding NV', type: 'STOCKS', exchange: 'Euronext', region: 'EU', currency: '€', price: 792.60, change: '+1.6%', isUp: true, logo: 'A', sparkline: [780, 783, 786, 790, 792.6] },
  { symbol: 'SAP.DE', name: 'SAP SE', type: 'STOCKS', exchange: 'XETRA', region: 'EU', currency: '€', price: 198.40, change: '+0.7%', isUp: true, logo: 'S', sparkline: [196, 197, 197.5, 198, 198.4] },
  { symbol: 'MC.PA', name: 'LVMH Moët Hennessy', type: 'STOCKS', exchange: 'Euronext', region: 'EU', currency: '€', price: 685.20, change: '-0.9%', isUp: false, logo: 'L', sparkline: [692, 690, 688, 686, 685.2] },
  { symbol: 'SIE.DE', name: 'Siemens AG', type: 'STOCKS', exchange: 'XETRA', region: 'EU', currency: '€', price: 178.90, change: '+1.3%', isUp: true, logo: 'S', sparkline: [176, 177, 177.5, 178.2, 178.9] },
  { symbol: 'TTE.PA', name: 'TotalEnergies SE', type: 'STOCKS', exchange: 'Euronext', region: 'EU', currency: '€', price: 62.40, change: '+0.4%', isUp: true, logo: 'T', sparkline: [61.8, 62.0, 62.1, 62.2, 62.4] },
  { symbol: 'STOXX50', name: 'EURO STOXX 50 ETF', type: 'ETF', exchange: 'XETRA', region: 'EU', currency: '€', price: 498.20, change: '+0.6%', isUp: true, logo: 'E', sparkline: [495, 496, 497, 497.8, 498.2] },

  // Singapore
  { symbol: 'D05.SI', name: 'DBS Group Holdings', type: 'STOCKS', exchange: 'SGX', region: 'Singapore', currency: 'S$', price: 38.60, change: '+1.2%', isUp: true, logo: 'D', sparkline: [38.1, 38.2, 38.3, 38.5, 38.6] },
  { symbol: 'O39.SI', name: 'OCBC Bank', type: 'STOCKS', exchange: 'SGX', region: 'Singapore', currency: 'S$', price: 15.20, change: '+0.8%', isUp: true, logo: 'O', sparkline: [15.05, 15.1, 15.12, 15.18, 15.2] },
  { symbol: 'U11.SI', name: 'United Overseas Bank', type: 'STOCKS', exchange: 'SGX', region: 'Singapore', currency: 'S$', price: 32.40, change: '+1.4%', isUp: true, logo: 'U', sparkline: [31.9, 32.0, 32.15, 32.3, 32.4] },
  { symbol: 'Z74.SI', name: 'Singtel Ltd', type: 'STOCKS', exchange: 'SGX', region: 'Singapore', currency: 'S$', price: 3.12, change: '-0.3%', isUp: false, logo: 'S', sparkline: [3.15, 3.14, 3.13, 3.12, 3.12] },
  { symbol: 'C6L.SI', name: 'Singapore Airlines', type: 'STOCKS', exchange: 'SGX', region: 'Singapore', currency: 'S$', price: 6.45, change: '+0.5%', isUp: true, logo: 'S', sparkline: [6.41, 6.42, 6.43, 6.44, 6.45] },
  { symbol: 'STI', name: 'SPDR Straits Times Index ETF', type: 'ETF', exchange: 'SGX', region: 'Singapore', currency: 'S$', price: 35.80, change: '+0.4%', isUp: true, logo: 'S', sparkline: [35.6, 35.65, 35.7, 35.75, 35.8] }
];

// Mini SVG Sparkline Component
const MiniSparkline: React.FC<{ points: number[]; isUp: boolean }> = ({ points, isUp }) => {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 68;
  const height = 24;
  const strokeColor = isUp ? '#10b981' : '#f43f5e';
  const fillColor = isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';

  const coords = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylineStr = coords.join(' ');
  const polygonStr = `0,${height} ${coords.join(' ')} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polygon points={polygonStr} fill={fillColor} />
      <polyline points={polylineStr} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

interface PaperTradingTabProps {
  userData: UserTrackerData;
  updateData: (partial: Partial<UserTrackerData>) => void;
}

export const PaperTradingTab: React.FC<PaperTradingTabProps> = ({ userData, updateData }) => {
  const [activeSection, setActiveSection] = useState<'portfolio' | 'analytics' | 'academy'>('portfolio');
  const [portfolioTab, setPortfolioTab] = useState<'holdings' | 'positions'>('holdings');
  
  // Multi-Region Market Tab State
  const [activeRegion, setActiveRegion] = useState<MarketRegion>('US');
  const activeRegionConfig = useMemo(() => MARKET_REGIONS.find(r => r.id === activeRegion) || MARKET_REGIONS[0], [activeRegion]);

  // Watchlist Hook
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [watchlistFilter, setWatchlistFilter] = useState<'All' | MarketRegion>('All');
  const [showWatchlistSection, setShowWatchlistSection] = useState<boolean>(true);

  // Order Panel State
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(GLOBAL_ASSETS[0]);
  
  const [orderType, setOrderType] = useState<'Delivery' | 'Intraday'>('Delivery');
  const [orderMode, setOrderMode] = useState<'Market' | 'Limit' | 'SL'>('Market');
  const [orderSide, setOrderSide] = useState<'Buy' | 'Sell'>('Buy');
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [limitPrice, setLimitPrice] = useState<number | ''>('');
  const [triggerPrice, setTriggerPrice] = useState<number | ''>('');

  const [activeModule, setActiveModule] = useState<string | null>(null);

  useScrollLock(!!activeModule);

  const { marketData, volatility, setVolatility } = useMarketEngine(selectedAsset?.price || 100, selectedAsset?.symbol || 'AAPL');

  // Helper to check if ticker is in watchlist
  const isMonitored = (symbol: string) => watchlist.some(w => w.symbol === symbol);

  // Toggle Watchlist Action
  const handleToggleWatchlist = (asset: { symbol: string; name: string; price?: number; change?: string | number; type?: string; currency?: string; region?: string; exchange?: string }) => {
    if (isMonitored(asset.symbol)) {
      const existing = watchlist.find(w => w.symbol === asset.symbol);
      if (existing) removeFromWatchlist(existing.id);
    } else {
      addToWatchlist({
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price || marketData.currentPrice,
        change: typeof asset.change === 'string' ? parseFloat(asset.change) : (asset.change || 0),
        changePercent: typeof asset.change === 'string' ? parseFloat(asset.change) : 0,
        assetClass: asset.type === 'COMMODITY' ? 'Commodity' : asset.type === 'ETF' ? 'ETF' : 'Stock',
        currency: asset.currency || activeRegionConfig.currency,
        region: asset.region || activeRegion,
        exchange: asset.exchange || activeRegionConfig.exchanges[0],
        volatility: volatility
      });
    }
  };

  // Helper to load any stock into the Order Ticket
  const handleLoadIntoTicket = (asset: MarketAsset | WatchlistItem | any) => {
    // Find matching in GLOBAL_ASSETS or synthesize
    const match = GLOBAL_ASSETS.find(a => a.symbol === asset.symbol);
    if (match) {
      setSelectedAsset(match);
      if (match.region) setActiveRegion(match.region);
    } else {
      const regionMatch = (asset.region as MarketRegion) || activeRegion;
      const currencyMatch = asset.currency || activeRegionConfig.currency;
      const synthetic: MarketAsset = {
        symbol: asset.symbol,
        name: asset.name || asset.symbol,
        type: (asset.assetClass?.toUpperCase() as any) || 'STOCKS',
        exchange: asset.exchange || activeRegionConfig.exchanges[0],
        region: regionMatch,
        currency: currencyMatch,
        price: Number(asset.price) || 100,
        change: asset.changePercent ? `${asset.changePercent > 0 ? '+' : ''}${asset.changePercent}%` : '+0.0%',
        isUp: (asset.change || 0) >= 0,
        logo: asset.symbol.charAt(0).toUpperCase(),
        sparkline: [Number(asset.price) * 0.98, Number(asset.price) * 0.99, Number(asset.price)]
      };
      setSelectedAsset(synthetic);
      setActiveRegion(regionMatch);
    }
    // Scroll smoothly to ticket view
    const ticketElem = document.getElementById('order-ticket-container');
    if (ticketElem) {
      ticketElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tradingData = {
    cashBalance: userData?.paperTrading?.cashBalance ?? 100000,
    startingCapital: userData?.paperTrading?.startingCapital ?? 100000,
    positions: Array.isArray(userData?.paperTrading?.positions) ? userData.paperTrading.positions : [
      { id: 'pos-1', symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'Stock', quantity: 50, averageEntryPrice: 220.00, currentPrice: 232.80 },
      { id: 'pos-2', symbol: 'NVDA', name: 'NVIDIA Corp', assetClass: 'Stock', quantity: 20, averageEntryPrice: 125.00, currentPrice: 138.45 },
      { id: 'pos-3', symbol: 'SPY', name: 'SPDR S&P 500 ETF', assetClass: 'ETF', quantity: 15, averageEntryPrice: 580.00, currentPrice: 598.40 }
    ],
    tradeHistory: Array.isArray(userData?.paperTrading?.tradeHistory) ? userData.paperTrading.tradeHistory : [
      { id: 'tr-1', symbol: 'AAPL', type: 'Market', side: 'Buy', quantity: 50, executionPrice: 220.00, status: 'Executed', timestamp: Date.now() - 86400000 * 3 },
      { id: 'tr-2', symbol: 'NVDA', type: 'Limit', side: 'Buy', quantity: 20, executionPrice: 125.00, status: 'Executed', timestamp: Date.now() - 86400000 * 2 },
      { id: 'tr-3', symbol: 'SPY', type: 'Market', side: 'Buy', quantity: 15, executionPrice: 580.00, status: 'Executed', timestamp: Date.now() - 86400000 * 1 }
    ],
    academyProgress: userData?.paperTrading?.academyProgress || {}
  };

  const calculatePortfolioValue = () => {
    const positionsValue = (tradingData.positions || []).reduce((acc, pos) => acc + ((pos.currentPrice || 0) * (pos.quantity || 0)), 0);
    return tradingData.cashBalance + positionsValue;
  };

  const totalValue = calculatePortfolioValue();
  const totalReturn = ((totalValue - tradingData.startingCapital) / tradingData.startingCapital) * 100;
  const unrealizedPnL = (tradingData.positions || []).reduce((acc, pos) => {
    return acc + ((pos.currentPrice - pos.averageEntryPrice) * pos.quantity);
  }, 0);

  // Asset allocation breakdown
  const allocation = useMemo(() => {
    const equitiesVal = tradingData.positions.filter(p => p.assetClass === 'Stock').reduce((acc, p) => acc + (p.currentPrice * p.quantity), 0);
    const etfVal = tradingData.positions.filter(p => p.assetClass === 'ETF').reduce((acc, p) => acc + (p.currentPrice * p.quantity), 0);
    const commodityVal = tradingData.positions.filter(p => p.assetClass === 'Commodity').reduce((acc, p) => acc + (p.currentPrice * p.quantity), 0);
    const cashVal = tradingData.cashBalance;

    return {
      equitiesPct: Number(((equitiesVal / (totalValue || 1)) * 100).toFixed(1)),
      etfPct: Number(((etfVal / (totalValue || 1)) * 100).toFixed(1)),
      commodityPct: Number(((commodityVal / (totalValue || 1)) * 100).toFixed(1)),
      cashPct: Number(((cashVal / (totalValue || 1)) * 100).toFixed(1)),
      equitiesVal,
      etfVal,
      commodityVal,
      cashVal
    };
  }, [tradingData.positions, tradingData.cashBalance, totalValue]);

  // Regional Filtered Assets
  const regionalAssets = useMemo(() => {
    return GLOBAL_ASSETS.filter(a => a.region === activeRegion);
  }, [activeRegion]);

  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return regionalAssets;
    return GLOBAL_ASSETS.filter(a => 
      a.symbol.toLowerCase().includes(query) || 
      a.name.toLowerCase().includes(query) ||
      a.region.toLowerCase().includes(query)
    );
  }, [searchQuery, regionalAssets]);

  // Filtered Watchlist items
  const filteredWatchlist = useMemo(() => {
    if (watchlistFilter === 'All') return watchlist;
    return watchlist.filter(w => (w.region || 'US') === watchlistFilter);
  }, [watchlist, watchlistFilter]);

  const handleExecuteTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !quantity) return;

    const qty = Math.floor(Number(quantity));
    if (isNaN(qty) || qty <= 0) {
      alert("Order quantity must be a positive integer.");
      return;
    }

    try {
      // 1. Validate & calculate execution costs, margins, and fees server-side
      const response = await fetch('/api/trade/validate-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedAsset.symbol,
          orderSide,
          orderMode,
          orderType,
          quantity: qty,
          limitPrice: limitPrice ? Number(limitPrice) : undefined,
          triggerPrice: triggerPrice ? Number(triggerPrice) : undefined,
          cashBalance: tradingData.cashBalance,
          positions: tradingData.positions
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        alert(errJson.error || "Order validation rejected by server.");
        return;
      }

      const resData = await response.json();
      if (!resData.valid) {
        alert(resData.error || "Invalid order parameters.");
        return;
      }

      // 2. Commit server-validated balances, positions, and execution record
      updateData({
        paperTrading: {
          ...tradingData,
          cashBalance: resData.newCashBalance,
          positions: resData.newPositions,
          tradeHistory: [resData.executedTrade, ...tradingData.tradeHistory]
        }
      });

      setQuantity(10);
      setLimitPrice('');
      setTriggerPrice('');
      alert(`Order Executed (Server Verified): ${orderSide} ${qty} ${selectedAsset.symbol} @ ${selectedAsset.currency || activeRegionConfig.currency}${resData.executionPrice.toFixed(2)} | Fee: ${selectedAsset.currency || activeRegionConfig.currency}${resData.brokerFee.toFixed(2)}`);
    } catch (netErr) {
      // Offline fallback: enforce the same strict logic locally
      const price = orderMode === 'Market' ? marketData.currentPrice : Number(limitPrice || marketData.currentPrice);
      const gross = price * qty;
      const fee = Number(Math.max(1.00, gross * 0.001).toFixed(2));
      const totalCost = Number((gross + fee).toFixed(2));

      if (orderSide === 'Buy' && totalCost > tradingData.cashBalance) {
        alert(`Insufficient margin/cash balance. Required: ${selectedAsset.currency || activeRegionConfig.currency}${totalCost.toFixed(2)}, Available: ${selectedAsset.currency || activeRegionConfig.currency}${tradingData.cashBalance.toFixed(2)}`);
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
          const newTotalCost = (p.averageEntryPrice * p.quantity) + gross;
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
        if (existingIdx < 0) {
          alert("You do not own this asset.");
          return;
        }
        const p = newPositions[existingIdx];
        if (p.quantity < qty) {
          alert("Insufficient quantity to sell.");
          return;
        }
        newBalance += (gross - fee);
        if (p.quantity === qty) {
          newPositions.splice(existingIdx, 1);
        } else {
          newPositions[existingIdx] = { ...p, quantity: p.quantity - qty, currentPrice: price };
        }
      }

      updateData({
        paperTrading: {
          ...tradingData,
          cashBalance: Number(newBalance.toFixed(2)),
          positions: newPositions,
          tradeHistory: [newTrade, ...tradingData.tradeHistory]
        }
      });

      setQuantity(10);
      setLimitPrice('');
      setTriggerPrice('');
      alert(`Order Executed (Local Offline): ${orderSide} ${qty} ${selectedAsset.symbol} @ ${selectedAsset.currency || activeRegionConfig.currency}${price.toFixed(2)}`);
    }
  };

  const handleClearTradeHistory = () => {
    if (confirm("Are you sure you want to clear your trade execution log?")) {
      updateData({
        paperTrading: {
          ...tradingData,
          tradeHistory: []
        }
      });
    }
  };

  const currentCurrency = selectedAsset?.currency || activeRegionConfig.currency;
  const estimatedCharges = quantity && selectedAsset ? (Number(quantity) * marketData.currentPrice * 0.001) : 0;
  const marginRequired = quantity && selectedAsset ? (Number(quantity) * (orderMode === 'Market' ? marketData.currentPrice : Number(limitPrice || marketData.currentPrice))) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 animate-in fade-in duration-500">
      
      {/* Interactive Academy Modal */}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 p-5 sm:p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              Global Multi-Asset Terminal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            manageme Markets & Terminal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-1 max-w-xl">
            Real-time simulated multi-currency execution, live watchlist monitoring, portfolio risk analytics, and institutional trading tracks.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 dark:bg-neutral-950/80 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm w-full md:w-auto">
          <button 
            id="tab-terminal-view"
            onClick={() => setActiveSection('portfolio')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeSection === 'portfolio' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Trading Terminal
          </button>
          <button 
            id="tab-analytics-view"
            onClick={() => setActiveSection('analytics')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeSection === 'analytics' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Portfolio Analytics
          </button>
          <button 
            id="tab-academy-view"
            onClick={() => setActiveSection('academy')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeSection === 'academy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Finance Academy
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TERMINAL VIEW (Order Panel, Unified Market Switcher, Live Depth, Watchlist) */}
      {/* ========================================================================= */}
      {activeSection === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: ORDER PANEL & ASSET DISCOVERY */}
          <div className="lg:col-span-4 space-y-6">
            
            <div id="order-ticket-container" className="bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                  <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 
                  <span>Asset Discovery & Order Ticket</span>
                </h2>
                {selectedAsset && (
                  <button
                    onClick={() => handleToggleWatchlist(selectedAsset)}
                    title={isMonitored(selectedAsset.symbol) ? "Remove from Watchlist" : "Add to Watchlist"}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                      isMonitored(selectedAsset.symbol)
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-sm'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-white/10 hover:text-amber-500'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isMonitored(selectedAsset.symbol) ? 'fill-amber-400 text-amber-500' : ''}`} />
                    <span>{isMonitored(selectedAsset.symbol) ? 'Monitored' : 'Watchlist'}</span>
                  </button>
                )}
              </div>

              {/* UNIFIED TAB SWITCHER: US | India | UK | EU | Singapore */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-neutral-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-500" /> Market Region
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/20 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-500/20">
                    {activeRegionConfig.currency} • {activeRegionConfig.exchanges.join(', ')}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 bg-slate-100 dark:bg-neutral-950 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
                  {MARKET_REGIONS.map(region => (
                    <button
                      key={region.id}
                      onClick={() => {
                        setActiveRegion(region.id);
                        // Auto-select first asset from this region if available
                        const firstAsset = GLOBAL_ASSETS.find(a => a.region === region.id);
                        if (firstAsset) setSelectedAsset(firstAsset);
                        setSearchQuery('');
                      }}
                      className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        activeRegion === region.id
                          ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold border border-slate-200 dark:border-white/10'
                          : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white font-medium'
                      }`}
                    >
                      <span className="text-sm">{region.flag}</span>
                      <span className="text-[10px] tracking-tight">{region.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* SMART SEARCH WITH REGIONAL SUFFIX HINT */}
              <div className="relative mb-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={`Search ${activeRegionConfig.name} tickers (${activeRegionConfig.suffix ? `${activeRegionConfig.suffix}` : 'AAPL, NVDA'})...`}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                
                <AnimatePresence>
                  {showDropdown && searchQuery && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-950 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5"
                    >
                      {filteredAssets.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 dark:text-neutral-400">
                          No matching assets found for "{searchQuery}".
                        </div>
                      ) : (
                        filteredAssets.map(asset => (
                          <div 
                            key={asset.symbol} 
                            onClick={() => { setSelectedAsset(asset); setActiveRegion(asset.region); setShowDropdown(false); setSearchQuery(''); }}
                            className="p-3 hover:bg-slate-50 dark:hover:bg-neutral-900 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                {asset.logo}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                                  <span>{asset.symbol}</span>
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-500">{asset.exchange}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-neutral-400">{asset.name}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right font-mono">
                                <div className="font-semibold text-slate-900 dark:text-white text-xs">{asset.currency}{asset.price.toFixed(2)}</div>
                                <div className={`text-[10px] font-bold ${asset.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{asset.change}</div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleToggleWatchlist(asset); }}
                                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors"
                              >
                                <Star className={`w-3.5 h-3.5 ${isMonitored(asset.symbol) ? 'fill-amber-400 text-amber-500' : ''}`} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* QUICK ASSET CHIPS (Selected Region) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 custom-scrollbar">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold shrink-0">Hot:</span>
                {regionalAssets.slice(0, 5).map(asset => (
                  <button
                    key={asset.symbol}
                    onClick={() => { setSelectedAsset(asset); }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                      selectedAsset?.symbol === asset.symbol
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:border-blue-400'
                    }`}
                  >
                    <span>{asset.symbol}</span>
                    <span className="text-[9px] opacity-80">{asset.currency}{asset.price.toFixed(0)}</span>
                  </button>
                ))}
              </div>

              {/* ORDER EXECUTION TICKET */}
              {selectedAsset && (
                <form onSubmit={handleExecuteTrade} className="space-y-4 border-t border-slate-200 dark:border-white/10 pt-4">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-neutral-950 p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 font-mono">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedAsset.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                          {selectedAsset.exchange}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400 block mt-0.5">{selectedAsset.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${marketData.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {currentCurrency}{marketData.currentPrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-neutral-400 block">Live Price</span>
                    </div>
                  </div>

                  {/* Order Type Toggle */}
                  <div className="flex bg-slate-100 dark:bg-neutral-950 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                    {['Delivery', 'Intraday'].map(t => (
                      <button 
                        key={t} type="button" onClick={() => setOrderType(t as any)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          orderType === t ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-neutral-400'
                        }`}
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
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          orderMode === m 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/10' 
                            : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 bg-slate-50 dark:bg-neutral-950'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div>
                      <label className="block text-slate-500 dark:text-neutral-400 mb-1">Quantity</label>
                      <input 
                        type="number" required min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white font-bold" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-neutral-400 mb-1">Limit Price ({currentCurrency})</label>
                      <input 
                        type="number" disabled={orderMode === 'Market'} 
                        value={orderMode === 'Market' ? Number(marketData.currentPrice.toFixed(2)) : limitPrice} 
                        onChange={e => setLimitPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white font-bold disabled:opacity-60" 
                      />
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="bg-slate-50 dark:bg-neutral-950 rounded-xl p-3 space-y-1 font-mono text-xs border border-slate-200 dark:border-white/10">
                    <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                      <span>Margin Required</span>
                      <span className="text-slate-900 dark:text-white font-bold">{currentCurrency}{marginRequired.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                      <span>Brokerage Charges (Est 0.10%)</span>
                      <span className="text-slate-900 dark:text-white font-bold">{currentCurrency}{estimatedCharges.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" onClick={() => setOrderSide('Buy')} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md">
                      BUY {selectedAsset.symbol}
                    </button>
                    <button type="submit" onClick={() => setOrderSide('Sell')} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md">
                      SELL {selectedAsset.symbol}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* MONITORED STOCKS / MY WATCHLIST SECTION */}
            <div className="bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      My Monitored Stocks
                    </h3>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">
                      {watchlist.length} securities tracked
                    </span>
                  </div>
                </div>
                
                {/* Region Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {(['All', 'US', 'India', 'UK', 'EU', 'Singapore'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setWatchlistFilter(f)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] transition-all cursor-pointer font-bold ${
                        watchlistFilter === f
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {f === 'All' ? 'All' : f === 'US' ? '🇺🇸' : f === 'India' ? '🇮🇳' : f === 'UK' ? '🇬🇧' : f === 'EU' ? '🇪🇺' : '🇸🇬'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monitored Items List */}
              {filteredWatchlist.length === 0 ? (
                <div className="text-center py-6 px-4 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 space-y-2">
                  <Eye className="w-6 h-6 text-slate-400 mx-auto opacity-70" />
                  <p className="text-xs text-slate-600 dark:text-neutral-400 font-sans">
                    No stocks monitored in {watchlistFilter === 'All' ? 'any region' : watchlistFilter}.
                  </p>
                  <button
                    onClick={() => {
                      // Bulk add top global assets
                      GLOBAL_ASSETS.slice(0, 4).forEach(a => {
                        if (!isMonitored(a.symbol)) {
                          addToWatchlist({
                            symbol: a.symbol,
                            name: a.name,
                            price: a.price,
                            currency: a.currency,
                            region: a.region,
                            exchange: a.exchange,
                            assetClass: 'Stock',
                            change: parseFloat(a.change),
                            changePercent: parseFloat(a.change)
                          });
                        }
                      });
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-bold font-sans cursor-pointer"
                  >
                    + Add Top Global Bluechips
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {filteredWatchlist.map((item) => {
                    const price = item.price || 100;
                    const change = item.changePercent || item.change || 0;
                    const isPositive = change >= 0;
                    const itemCurrency = item.currency || '$';
                    const points = [price * 0.985, price * 0.99, price * (isPositive ? 1.01 : 0.995), price * (isPositive ? 1.02 : 0.98), price];

                    return (
                      <div 
                        key={item.id}
                        className="p-3 bg-slate-50 dark:bg-neutral-950/80 hover:bg-slate-100 dark:hover:bg-neutral-900 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between transition-all group"
                      >
                        {/* Symbol & Name */}
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {item.symbol}
                            </span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-neutral-400 uppercase font-sans">
                              {item.region || 'US'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-400 truncate max-w-[120px]">
                            {item.name || item.symbol}
                          </div>
                        </div>

                        {/* Mini Sparkline Chart */}
                        <div className="hidden sm:block">
                          <MiniSparkline points={points} isUp={isPositive} />
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right font-mono">
                            <div className="font-bold text-xs text-slate-900 dark:text-white">
                              {itemCurrency}{price.toFixed(2)}
                            </div>
                            <div className={`text-[10px] font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {isPositive ? '+' : ''}{change.toFixed(2)}%
                            </div>
                          </div>

                          {/* Quick Load into Ticket */}
                          <button
                            onClick={() => handleLoadIntoTicket(item)}
                            title="Load into Order Ticket"
                            className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove from Watchlist */}
                          <button
                            onClick={() => removeFromWatchlist(item.id)}
                            title="Remove from Watchlist"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Balance Stats */}
            <div className="bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm space-y-3 font-mono">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-slate-500 dark:text-neutral-400">Available Cash Balance</span>
                 <span className="text-slate-900 dark:text-white font-bold tracking-tighter tabular-nums">{currentCurrency}{tradingData.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-slate-500 dark:text-neutral-400">Total Portfolio Net Worth</span>
                 <span className="text-slate-900 dark:text-white font-bold tracking-tighter tabular-nums">{currentCurrency}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="w-full h-2 bg-slate-100 dark:bg-neutral-950 rounded-full overflow-hidden border border-slate-200 dark:border-white/10">
                 <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (tradingData.cashBalance / (totalValue || 1)) * 100)}%` }}></div>
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE CHART & HOLDINGS */}
          <div className="lg:col-span-8 space-y-6">
            
            {selectedAsset && (
              <LiveMarketPanel 
                asset={selectedAsset}
                marketData={marketData}
                volatility={volatility}
                setVolatility={setVolatility}
              />
            )}

            {/* Holdings & Positions Switcher */}
            <div className="bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex gap-4 border-b border-slate-200 dark:border-white/10 mb-4">
                <button 
                  onClick={() => setPortfolioTab('holdings')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    portfolioTab === 'holdings' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Holdings Portfolio ({tradingData.positions.length})
                </button>
                <button 
                  onClick={() => setPortfolioTab('positions')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    portfolioTab === 'positions' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Active Intraday Orders (0)
                </button>
              </div>

              {portfolioTab === 'holdings' ? (
                <div>
                  {tradingData.positions.length === 0 ? (
                     <div className="text-center py-12 space-y-3">
                       <Briefcase className="w-10 h-10 text-slate-400 dark:text-neutral-600 mx-auto" />
                       <h4 className="text-slate-900 dark:text-white font-bold text-sm">No Active Holdings</h4>
                       <p className="text-slate-500 dark:text-neutral-400 text-xs max-w-sm mx-auto">
                         Execute orders from the ticket panel to build your multi-asset portfolio.
                       </p>
                     </div>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                            <th className="pb-3 px-2">Instrument</th>
                            <th className="pb-3 px-2 text-right">Qty</th>
                            <th className="pb-3 px-2 text-right">Avg Cost</th>
                            <th className="pb-3 px-2 text-right">Current LTP</th>
                            <th className="pb-3 px-2 text-right">Unrealized P&L</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {tradingData.positions.map((pos) => {
                            const invested = pos.quantity * pos.averageEntryPrice;
                            const current = pos.quantity * pos.currentPrice;
                            const pnl = current - invested;
                            const pnlPct = (pnl / invested) * 100;
                            return (
                              <tr key={pos.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                <td className="py-3 px-2">
                                  <div className="font-bold text-slate-900 dark:text-white">{pos.symbol}</div>
                                  <div className="text-[10px] text-slate-500 dark:text-neutral-400">{pos.name} • {pos.assetClass}</div>
                                </td>
                                <td className="py-3 px-2 text-right text-slate-700 dark:text-neutral-300">{pos.quantity}</td>
                                <td className="py-3 px-2 text-right text-slate-700 dark:text-neutral-300">${(pos.averageEntryPrice || 0).toFixed(2)}</td>
                                <td className="py-3 px-2 text-right text-slate-700 dark:text-neutral-300 font-bold">${(pos.currentPrice || 0).toFixed(2)}</td>
                                <td className={`py-3 px-2 text-right font-bold ${pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                                  <span className="text-[10px] font-normal block">({pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)</span>
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
                <div className="text-center py-12 space-y-2 text-xs text-slate-500 dark:text-neutral-400">
                   <Activity className="w-10 h-10 text-slate-400 dark:text-neutral-600 mx-auto mb-2" />
                   <h4 className="text-slate-900 dark:text-white font-bold">No Active Intraday Positions</h4>
                   <p>Intraday and F&O trades settle automatically at market close.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ANALYTICS VIEW (Portfolio Metrics, Allocation, Trade History) */}
      {/* ========================================================================= */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Net Worth */}
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-bold">Portfolio Net Worth</span>
                <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono tracking-tighter text-slate-900 dark:text-white">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Total Return: {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%</span>
              </div>
            </div>

            {/* Unrealized P&L */}
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-bold">Unrealized P&L</span>
                <div className={`p-1.5 rounded-xl ${unrealizedPnL >= 0 ? 'bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl font-extrabold font-mono tracking-tighter ${unrealizedPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
              </div>
              <span className="text-xs text-slate-500 dark:text-neutral-400 block font-mono">
                Across {tradingData.positions.length} active positions
              </span>
            </div>

            {/* Sharpe Ratio & Risk/Reward */}
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-bold">Sharpe & Risk Metrics</span>
                <div className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono tracking-tighter text-slate-900 dark:text-white">
                1.84 <span className="text-xs font-normal text-slate-500 font-sans">Sharpe</span>
              </div>
              <span className="text-xs text-purple-700 dark:text-purple-300 block font-mono">
                R/R: 1:2.8 • Win Rate: 68.5%
              </span>
            </div>

            {/* Alpha & Beta */}
            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-bold">Alpha vs. Benchmark</span>
                <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono tracking-tighter text-amber-600 dark:text-amber-400">
                +3.4% <span className="text-xs font-normal text-slate-500 font-sans">Alpha</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-neutral-400 block font-mono">
                Portfolio Beta: 1.05 (S&P 500)
              </span>
            </div>

          </div>

          {/* Middle Row: Asset Allocation & Performance Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Asset Allocation Panel (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Asset Allocation Breakdown</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">Multi-Asset</span>
              </div>

              {/* Progress Stacked Bar */}
              <div className="w-full h-4 rounded-full overflow-hidden flex border border-slate-200 dark:border-white/10 shadow-xs">
                <div style={{ width: `${allocation.equitiesPct}%` }} className="bg-blue-600" title={`Equities: ${allocation.equitiesPct}%`} />
                <div style={{ width: `${allocation.etfPct}%` }} className="bg-purple-600" title={`ETFs: ${allocation.etfPct}%`} />
                <div style={{ width: `${allocation.commodityPct}%` }} className="bg-amber-500" title={`Commodities: ${allocation.commodityPct}%`} />
                <div style={{ width: `${allocation.cashPct}%` }} className="bg-emerald-500" title={`Cash: ${allocation.cashPct}%`} />
              </div>

              {/* Allocation Legend */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-slate-800 dark:text-neutral-200">Equities / Stocks</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">${allocation.equitiesVal.toFixed(2)} ({allocation.equitiesPct}%)</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-600" />
                    <span className="text-slate-800 dark:text-neutral-200">Index ETFs</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">${allocation.etfVal.toFixed(2)} ({allocation.etfPct}%)</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-slate-800 dark:text-neutral-200">Commodities</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">${allocation.commodityVal.toFixed(2)} ({allocation.commodityPct}%)</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-800 dark:text-neutral-200">Uninvested Cash</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">${allocation.cashVal.toFixed(2)} ({allocation.cashPct}%)</span>
                </div>
              </div>
            </div>

            {/* Position Exposure Heatmap (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Position Performance Heatmap</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">Live Mark-to-Market</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tradingData.positions.map(pos => {
                  const invested = pos.quantity * pos.averageEntryPrice;
                  const current = pos.quantity * pos.currentPrice;
                  const pnl = current - invested;
                  const pnlPct = (pnl / invested) * 100;
                  const isPositive = pnl >= 0;

                  return (
                    <div 
                      key={pos.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2 ${
                        isPositive 
                          ? 'bg-emerald-50/60 dark:bg-emerald-600/10 border-emerald-300 dark:border-emerald-500/30' 
                          : 'bg-rose-50/60 dark:bg-rose-600/10 border-rose-300 dark:border-rose-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-start font-mono">
                        <div>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{pos.symbol}</span>
                          <span className="text-[10px] text-slate-500 dark:text-neutral-400">{pos.quantity} units</span>
                        </div>
                        <span className={`text-xs font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isPositive ? '+' : ''}{pnlPct.toFixed(2)}%
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex justify-between items-baseline font-mono text-xs">
                        <span className="text-slate-500 text-[10px]">Position P&L:</span>
                        <span className={`font-bold ${isPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                          {isPositive ? '+' : ''}${pnl.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Trade Execution History Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Trade Execution Log ({tradingData.tradeHistory.length})
                </h3>
              </div>

              {tradingData.tradeHistory.length > 0 && (
                <button
                  onClick={handleClearTradeHistory}
                  className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:text-neutral-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Log</span>
                </button>
              )}
            </div>

            {tradingData.tradeHistory.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-neutral-400 font-mono">
                No trades executed yet. Place an order in the Trading Terminal to populate this log.
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                      <th className="pb-3 px-2">Timestamp</th>
                      <th className="pb-3 px-2">Symbol</th>
                      <th className="pb-3 px-2">Side</th>
                      <th className="pb-3 px-2">Order Type</th>
                      <th className="pb-3 px-2 text-right">Quantity</th>
                      <th className="pb-3 px-2 text-right">Exec Price</th>
                      <th className="pb-3 px-2 text-right">Total Value</th>
                      <th className="pb-3 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {tradingData.tradeHistory.map((tr) => (
                      <tr key={tr.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="py-3 px-2 text-slate-500 dark:text-neutral-400">
                          {new Date(tr.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">{tr.symbol}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tr.side === 'Buy' ? 'bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-600/20 text-rose-700 dark:text-rose-400'
                          }`}>
                            {tr.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-600 dark:text-neutral-400">{tr.type}</td>
                        <td className="py-3 px-2 text-right text-slate-900 dark:text-white font-bold">{tr.quantity}</td>
                        <td className="py-3 px-2 text-right text-slate-700 dark:text-neutral-300">${tr.executionPrice.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-white">${(tr.executionPrice * tr.quantity).toFixed(2)}</td>
                        <td className="py-3 px-2 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                            {tr.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACADEMY VIEW (4 Core Learning Tracks & Sandbox Modules) */}
      {/* ========================================================================= */}
      {activeSection === 'academy' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-200 dark:border-blue-500/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Institutional Finance Curriculum
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Interactive Core Concepts Academy
              </h2>
              <p className="text-xs text-slate-600 dark:text-neutral-300 mt-1 max-w-xl">
                4 structured interactive tracks covering market theory, statement analysis, DCF modeling, and M&A/LBO transactions with live calculators.
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-[10px] text-slate-500 block">Mastery Progress</span>
                <strong className="text-slate-900 dark:text-white">
                  {Object.values(tradingData.academyProgress).filter(Boolean).length} / 4 Tracks Completed
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Track 1: Core Trading Theory */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between hover:border-blue-500/40 transition-all group space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Book className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 uppercase">
                    Track 1 • Theory
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Core Trading Theory & Market Mechanics
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-sans">
                  Bid-Ask Spread & Order Books, Market vs. Limit Orders, Slippage & Execution Risk, CAPM & Beta Calculation, and Modern Portfolio Theory (MPT).
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-neutral-300 font-mono space-y-1">
                  <span className="font-bold text-[10px] uppercase text-blue-600 dark:text-blue-400 block">Includes:</span>
                  <div>• Interactive CAPM Expected Return Calculator</div>
                  <div>• 3-Question Market Mechanics Mastery Check</div>
                </div>
              </div>

              <button 
                onClick={() => setActiveModule('theory')}
                className={`w-full py-3 min-h-[44px] rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
                  tradingData.academyProgress['theory'] 
                    ? 'bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {tradingData.academyProgress['theory'] ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
                <span>{tradingData.academyProgress['theory'] ? 'Completed • Review Track' : 'Start Theory Track'}</span>
              </button>
            </div>
            
            {/* Track 2: Financial Statement Analysis */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between hover:border-purple-500/40 transition-all group space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 uppercase">
                    Track 2 • Accounting
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Financial Statement Analysis
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-sans">
                  Income Statement (Revenue to Net Income), Balance Sheet Mechanics, Cash Flow Statement (CFO, CFI, CFF), and DuPont ROE / ROIC ratios.
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-neutral-300 font-mono space-y-1">
                  <span className="font-bold text-[10px] uppercase text-purple-600 dark:text-purple-400 block">Includes:</span>
                  <div>• Interactive 3-Part DuPont ROE Breakdown Sandbox</div>
                  <div>• 3-Question Statement Accounting Quiz</div>
                </div>
              </div>

              <button 
                onClick={() => setActiveModule('statements')}
                className={`w-full py-3 min-h-[44px] rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
                  tradingData.academyProgress['statements'] 
                    ? 'bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {tradingData.academyProgress['statements'] ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
                <span>{tradingData.academyProgress['statements'] ? 'Completed • Review Track' : 'Start Statements Track'}</span>
              </button>
            </div>
            
            {/* Track 3: Corporate Valuation & DCF Modeling */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-all group space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 uppercase">
                    Track 3 • Valuation
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Corporate Valuation & DCF Modeling
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-sans">
                  Unlevered Free Cash Flow (FCFF), WACC & Cost of Capital, Terminal Value (Gordon Growth vs. Exit Multiples), and Enterprise Value vs. Equity Value.
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-neutral-300 font-mono space-y-1">
                  <span className="font-bold text-[10px] uppercase text-amber-600 dark:text-amber-400 block">Includes:</span>
                  <div>• Interactive Gordon Growth Terminal Value Calculator</div>
                  <div>• 3-Question Valuation & WACC Assessment</div>
                </div>
              </div>

              <button 
                onClick={() => setActiveModule('valuation')}
                className={`w-full py-3 min-h-[44px] rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
                  tradingData.academyProgress['valuation'] 
                    ? 'bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30' 
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {tradingData.academyProgress['valuation'] ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
                <span>{tradingData.academyProgress['valuation'] ? 'Completed • Review Track' : 'Start DCF Track'}</span>
              </button>
            </div>

            {/* Track 4: Investment Banking & M&A / LBO */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/70 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-all group space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 uppercase">
                    Track 4 • M&A & LBO
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Investment Banking & M&A / LBO
                </h3>
                <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-sans">
                  Accretion/Dilution Analysis, Comparable Companies (Comps), Precedent Transactions, LBO Returns (IRR & MoIC), and Debt Sizing.
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-neutral-300 font-mono space-y-1">
                  <span className="font-bold text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block">Includes:</span>
                  <div>• Interactive M&A Accretion/Dilution Evaluator</div>
                  <div>• 3-Question LBO Returns & Deal Mechanics Quiz</div>
                </div>
              </div>

              <button 
                onClick={() => setActiveModule('mna')}
                className={`w-full py-3 min-h-[44px] rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
                  tradingData.academyProgress['mna'] 
                    ? 'bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {tradingData.academyProgress['mna'] ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
                <span>{tradingData.academyProgress['mna'] ? 'Completed • Review Track' : 'Start M&A / LBO Track'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default PaperTradingTab;
