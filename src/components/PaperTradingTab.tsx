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
import { UserTrackerData, isGuestOrDemoMode } from '../hooks/useFirestoreData';
import { PortfolioPosition, TradeOrder } from '../types';
import { GrowwTradingAcademyModal } from './GrowwTradingAcademyModal';
import { LiveMarketPanel } from './LiveMarketPanel';
import { AppleEmptyState } from './AppleEmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollLock } from '../hooks/useScrollLock';
import { useMarketEngine } from '../hooks/useMarketEngine';
import { useWatchlist, WatchlistItem } from '../hooks/useWatchlist';
import { useLiveMarketPrices } from '../hooks/useLiveMarketPrices';
import { useToast } from '../context/ToastContext';
import { Star, Globe, Eye, Sparkles as SparklesIcon, Plus, Check, RefreshCw, Radio, Wifi } from 'lucide-react';

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
  userData?: UserTrackerData;
  updateData?: (partial: Partial<UserTrackerData>) => void;
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
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(() => GLOBAL_ASSETS[0] || {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'STOCKS',
    exchange: 'NASDAQ',
    region: 'US',
    currency: '$',
    price: 232.80,
    change: '+1.1%',
    isUp: true,
    logo: 'A',
    sparkline: [228, 229, 230, 231, 232.8]
  });
  
  const [orderType, setOrderType] = useState<'Delivery' | 'Intraday'>('Delivery');
  const [orderMode, setOrderMode] = useState<'Market' | 'Limit' | 'SL'>('Market');
  const [orderSide, setOrderSide] = useState<'Buy' | 'Sell'>('Buy');
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [limitPrice, setLimitPrice] = useState<number | ''>('');
  const [triggerPrice, setTriggerPrice] = useState<number | ''>('');

  const [activeModule, setActiveModule] = useState<string | null>(null);

  useScrollLock(!!activeModule);

  const { showToast } = useToast();

  // Multi-Asset Live Market Feeds & Order-Book Stream
  const allSymbols = useMemo(() => {
    const list = [
      ...GLOBAL_ASSETS.map(a => a.symbol),
      ...(watchlist || []).map(w => w.symbol),
      ...(userData?.paperTrading?.positions || []).map(p => p.symbol),
      selectedAsset?.symbol
    ];
    return Array.from(new Set(list)).filter(Boolean) as string[];
  }, [watchlist, userData?.paperTrading?.positions, selectedAsset?.symbol]);

  const {
    liveQuotes,
    tickDirections,
    isConnected,
    lastRefreshed,
    isRefreshing,
    refreshQuotes,
    getLivePrice,
    getLiveQuote
  } = useLiveMarketPrices(allSymbols);

  const currentLiveQuote = getLiveQuote(selectedAsset?.symbol || 'AAPL');
  const baseLivePrice = currentLiveQuote?.price ?? (selectedAsset?.price || 100);

  const { marketData, volatility, setVolatility } = useMarketEngine(baseLivePrice, selectedAsset?.symbol || 'AAPL');

  // Helper to check if ticker is in watchlist
  const isMonitored = (symbol: string) => (watchlist || []).some(w => w.symbol === symbol);

  // Toggle Watchlist Action
  const handleToggleWatchlist = (asset: { symbol: string; name: string; price?: number; change?: string | number; type?: string; currency?: string; region?: string; exchange?: string }) => {
    if (isMonitored(asset.symbol)) {
      const existing = (watchlist || []).find(w => w.symbol === asset.symbol);
      if (existing) removeFromWatchlist(existing.id);
    } else {
      addToWatchlist({
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price || marketData.currentPrice,
        change: typeof asset.change === 'string' ? parseFloat(asset.change) || 0 : (asset.change || 0),
        changePercent: typeof asset.change === 'string' ? parseFloat(asset.change) || 0 : 0,
        assetClass: asset.type === 'COMMODITY' ? 'Commodity' : asset.type === 'ETF' ? 'ETF' : 'Stock',
        currency: asset.currency || activeRegionConfig.currency,
        region: (asset.region as any) || activeRegion,
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
        logo: asset.symbol ? asset.symbol.charAt(0).toUpperCase() : 'A',
        sparkline: [Number(asset.price || 100) * 0.98, Number(asset.price || 100) * 0.99, Number(asset.price || 100)]
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
    cashBalance: Number(userData?.paperTrading?.cashBalance ?? 100000),
    startingCapital: Number(userData?.paperTrading?.startingCapital ?? 100000),
    positions: Array.isArray(userData?.paperTrading?.positions) ? userData.paperTrading.positions : [],
    tradeHistory: Array.isArray(userData?.paperTrading?.tradeHistory) ? userData.paperTrading.tradeHistory : [],
    academyProgress: userData?.paperTrading?.academyProgress || {}
  };

  const calculatePortfolioValue = () => {
    const positionsValue = (tradingData.positions || []).reduce((acc, pos) => {
      const p = getLivePrice(pos?.symbol, Number(pos?.currentPrice ?? pos?.averageEntryPrice ?? 0));
      const q = Number(pos?.quantity ?? 0);
      return acc + (p * q);
    }, 0);
    return tradingData.cashBalance + positionsValue;
  };

  const totalValue = calculatePortfolioValue();
  const startingCap = tradingData.startingCapital || 100000;
  const totalReturn = ((totalValue - startingCap) / startingCap) * 100;
  const unrealizedPnL = (tradingData.positions || []).reduce((acc, pos) => {
    const curr = getLivePrice(pos?.symbol, Number(pos?.currentPrice ?? pos?.averageEntryPrice ?? 0));
    const avg = Number(pos?.averageEntryPrice ?? 0);
    const q = Number(pos?.quantity ?? 0);
    return acc + ((curr - avg) * q);
  }, 0);

  // Asset allocation breakdown
  const allocation = useMemo(() => {
    const validPositions = tradingData.positions || [];
    const equitiesVal = validPositions.filter(p => p?.assetClass === 'Stock').reduce((acc, p) => acc + (getLivePrice(p?.symbol, Number(p?.currentPrice) || Number(p?.averageEntryPrice) || 0) * (Number(p?.quantity) || 0)), 0);
    const etfVal = validPositions.filter(p => p?.assetClass === 'ETF').reduce((acc, p) => acc + (getLivePrice(p?.symbol, Number(p?.currentPrice) || Number(p?.averageEntryPrice) || 0) * (Number(p?.quantity) || 0)), 0);
    const commodityVal = validPositions.filter(p => p?.assetClass === 'Commodity').reduce((acc, p) => acc + (getLivePrice(p?.symbol, Number(p?.currentPrice) || Number(p?.averageEntryPrice) || 0) * (Number(p?.quantity) || 0)), 0);
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
  }, [tradingData.positions, tradingData.cashBalance, totalValue, liveQuotes]);

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

  const handleExecuteTrade = async (e?: React.FormEvent, explicitSide?: 'Buy' | 'Sell') => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const side = explicitSide || orderSide;
    if (!selectedAsset || !quantity) return;

    const qty = Math.floor(Number(quantity));
    if (isNaN(qty) || qty <= 0) {
      if (showToast) showToast("Order quantity must be a positive integer.", "warning");
      else alert("Order quantity must be a positive integer.");
      return;
    }

    const price = orderMode === 'Market' 
      ? (Number(marketData?.currentPrice) || baseLivePrice) 
      : Number(limitPrice || marketData?.currentPrice || baseLivePrice);
    const gross = price * qty;
    const fee = Number(Math.max(1.00, gross * 0.001).toFixed(2));
    const totalCost = Number((gross + fee).toFixed(2));

    try {
      // 1. Validate & calculate execution costs, margins, and fees server-side
      const response = await fetch('/api/trade/validate-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedAsset.symbol,
          orderSide: side,
          orderMode,
          orderType,
          quantity: qty,
          limitPrice: limitPrice ? Number(limitPrice) : undefined,
          triggerPrice: triggerPrice ? Number(triggerPrice) : undefined,
          cashBalance: tradingData.cashBalance,
          positions: tradingData.positions
        })
      });

      let serverCommitted = false;
      if (response.ok) {
        const resData = await response.json().catch(() => null);
        if (resData && resData.valid) {
          // 2. Commit server-validated balances, positions, and execution record
          if (updateData) {
            updateData({
              paperTrading: {
                ...tradingData,
                cashBalance: Number(resData.newCashBalance) || tradingData.cashBalance,
                positions: Array.isArray(resData.newPositions) ? resData.newPositions : tradingData.positions,
                tradeHistory: resData.executedTrade ? [resData.executedTrade, ...tradingData.tradeHistory] : tradingData.tradeHistory
              }
            });
          }

          setQuantity(10);
          setLimitPrice('');
          setTriggerPrice('');
          const execP = Number(resData.executionPrice) || price;
          const bFee = Number(resData.brokerFee) || fee;
          const msg = `Order Executed: ${side} ${qty} ${selectedAsset.symbol} @ ${selectedAsset.currency || activeRegionConfig.currency}${execP.toFixed(2)} | Fee: ${selectedAsset.currency || activeRegionConfig.currency}${bFee.toFixed(2)}`;
          if (showToast) showToast(msg, side === 'Buy' ? 'success' : 'info', 4000);
          else alert(msg);
          serverCommitted = true;
          return;
        } else if (resData && resData.error) {
          if (showToast) showToast(resData.error, 'warning');
          else alert(resData.error);
          return;
        }
      } else if (response.status === 400) {
        const errJson = await response.json().catch(() => ({}));
        if (errJson?.error) {
          if (showToast) showToast(errJson.error, 'warning');
          else alert(errJson.error);
          return;
        }
      }

      // If serverless endpoint is unavailable (e.g. static hosting 404/401), proceed seamlessly to local execution
      if (!serverCommitted) {
        console.info("Using resilient local execution engine for trade");
      }
    } catch (netErr) {
      console.warn("Trade validation network bypass:", netErr);
    }

    // Offline fallback: enforce the same strict logic locally
    if (side === 'Buy' && totalCost > tradingData.cashBalance) {
      const errMsg = `Insufficient margin/cash balance. Required: ${selectedAsset.currency || activeRegionConfig.currency}${totalCost.toFixed(2)}, Available: ${selectedAsset.currency || activeRegionConfig.currency}${tradingData.cashBalance.toFixed(2)}`;
      if (showToast) showToast(errMsg, 'warning');
      else alert(errMsg);
      return;
    }

    const newTrade: TradeOrder = {
      id: Date.now().toString(),
      symbol: selectedAsset.symbol,
      type: orderMode as any,
      side,
      quantity: qty,
      executionPrice: price,
      status: 'Executed',
      timestamp: Date.now()
    };

    let newPositions = [...tradingData.positions];
    const existingIdx = newPositions.findIndex(p => p.symbol === selectedAsset.symbol);
    let newBalance = tradingData.cashBalance;

    if (side === 'Buy') {
      newBalance -= totalCost;
      if (existingIdx >= 0) {
        const p = newPositions[existingIdx];
        const newTotalCost = ((Number(p.averageEntryPrice) || 0) * (Number(p.quantity) || 0)) + gross;
        const newQty = (Number(p.quantity) || 0) + qty;
        newPositions[existingIdx] = { ...p, quantity: newQty, averageEntryPrice: newTotalCost / (newQty || 1), currentPrice: price };
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
        const errMsg = "You do not own this asset.";
        if (showToast) showToast(errMsg, 'warning');
        else alert(errMsg);
        return;
      }
      const p = newPositions[existingIdx];
      if (p.quantity < qty) {
        const errMsg = `Insufficient quantity to sell. You own ${p.quantity} shares.`;
        if (showToast) showToast(errMsg, 'warning');
        else alert(errMsg);
        return;
      }
      const proceeds = (price * qty) - fee;
      newBalance += proceeds;
      if (p.quantity === qty) {
        newPositions.splice(existingIdx, 1);
      } else {
        newPositions[existingIdx] = { ...p, quantity: p.quantity - qty, currentPrice: price };
      }
    }

    if (updateData) {
      updateData({
        paperTrading: {
          ...tradingData,
          cashBalance: Number(newBalance.toFixed(2)),
          positions: newPositions,
          tradeHistory: [newTrade, ...tradingData.tradeHistory]
        }
      });
    }

    setQuantity(10);
    setLimitPrice('');
    setTriggerPrice('');
    const execMsg = `Order Executed: ${side} ${qty} ${selectedAsset.symbol} @ ${selectedAsset.currency || activeRegionConfig.currency}${price.toFixed(2)}`;
    if (showToast) showToast(execMsg, side === 'Buy' ? 'success' : 'info', 4000);
    else alert(execMsg);
  };

  const handleClearTradeHistory = () => {
    if (confirm("Are you sure you want to clear your trade execution log?")) {
      if (updateData) {
        updateData({
          paperTrading: {
            ...tradingData,
            tradeHistory: []
          }
        });
      }
    }
  };

  const currentCurrency = selectedAsset?.currency || activeRegionConfig.currency;
  const estimatedCharges = quantity && selectedAsset ? (Number(quantity) * (Number(marketData?.currentPrice) || 100) * 0.001) : 0;
  const marginRequired = quantity && selectedAsset ? (Number(quantity) * (orderMode === 'Market' ? (Number(marketData?.currentPrice) || 100) : Number(limitPrice || marketData?.currentPrice || 100))) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 animate-in fade-in duration-500">
      
      {/* Interactive Academy Modal */}
      {activeModule && (
        <GrowwTradingAcademyModal 
          moduleId={activeModule}
          onClose={() => setActiveModule(null)}
          onComplete={() => {
            if (updateData) {
              updateData({
                paperTrading: {
                  ...tradingData,
                  academyProgress: { ...tradingData.academyProgress, [activeModule]: true }
                }
              });
            }
          }}
        />
      )}

      {/* Live Market Mirror Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-elevated/80 backdrop-blur-md border border-border px-4 py-2.5 rounded-2xl font-mono text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-profitGreen opacity-75' : 'bg-lossRed opacity-75'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-profitGreen' : 'bg-lossRed'}`}></span>
          </span>
          <span className="font-bold text-textPrimary text-xs font-sans flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-actionBlue animate-pulse" />
            {isConnected ? 'Real-Time Market Mirror Active' : 'Connecting Market Stream...'}
          </span>
          <span className="text-[10px] text-textMuted hidden md:inline font-sans">
            • Yahoo Finance Live Quotes & Sub-Second Order-Book Simulation
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-textMuted">
            Refreshed: {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            type="button"
            onClick={() => refreshQuotes()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-border hover:border-actionBlue/40 text-textMuted hover:text-textPrimary transition-all cursor-pointer active:scale-95 disabled:opacity-50 font-sans font-bold text-[11px] shadow-xs"
          >
            <RefreshCw className={`w-3 h-3 text-actionBlue ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Fetching...' : 'Refresh Quotes'}</span>
          </button>
        </div>
      </div>

      {/* Top Banner / Header & View Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface border border-border p-5 sm:p-6 rounded-2xl shadow-card-base transition-all duration-300 ease-out">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-actionBlue/10 text-actionBlue border border-actionBlue/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-actionBlue uppercase">
              Global Multi-Asset Terminal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-textPrimary mt-1">
            manageme Markets & Terminal
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-1 max-w-xl">
            Real-time simulated multi-currency execution, live watchlist monitoring, portfolio risk analytics, and institutional trading tracks.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center bg-surface-elevated p-1.5 rounded-xl border border-border w-full md:w-auto shadow-xs">
          <button 
            id="tab-terminal-view"
            onClick={() => setActiveSection('portfolio')}
            className={`flex-1 sm:flex-initial px-4 py-2 min-h-[38px] rounded-lg text-xs font-bold transition-all duration-300 ease-out cursor-pointer text-center active:scale-95 ${
              activeSection === 'portfolio' 
                ? 'bg-accentPrimary text-background shadow-xs font-extrabold' 
                : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            Trading Terminal
          </button>
          <button 
            id="tab-analytics-view"
            onClick={() => setActiveSection('analytics')}
            className={`flex-1 sm:flex-initial px-4 py-2 min-h-[38px] rounded-lg text-xs font-bold transition-all duration-300 ease-out cursor-pointer text-center active:scale-95 ${
              activeSection === 'analytics' 
                ? 'bg-accentPrimary text-background shadow-xs font-extrabold' 
                : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            Portfolio Analytics
          </button>
          <button 
            id="tab-academy-view"
            onClick={() => setActiveSection('academy')}
            className={`flex-1 sm:flex-initial px-4 py-2 min-h-[38px] rounded-lg text-xs font-bold transition-all duration-300 ease-out cursor-pointer text-center active:scale-95 ${
              activeSection === 'academy' 
                ? 'bg-accentPrimary text-background shadow-xs font-extrabold' 
                : 'text-textMuted hover:text-textPrimary'
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          
          {/* LEFT COLUMN: ORDER PANEL & ASSET DISCOVERY */}
          <div className="lg:col-span-4 space-y-6 w-full min-w-0">
            
            <div id="order-ticket-container" className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card-base hover:shadow-card-hover transition-all duration-300 ease-out relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2 text-textPrimary font-mono uppercase tracking-wider">
                  <Search className="w-4 h-4 text-actionBlue" /> 
                  <span>Asset Discovery & Order Ticket</span>
                </h2>
                {selectedAsset && (
                  <button
                    onClick={() => handleToggleWatchlist(selectedAsset)}
                    title={isMonitored(selectedAsset.symbol) ? "Remove from Watchlist" : "Add to Watchlist"}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all duration-300 ease-out cursor-pointer active:scale-95 border ${
                      isMonitored(selectedAsset.symbol)
                        ? 'bg-actionBlue/15 text-actionBlue border-actionBlue/30 shadow-xs'
                        : 'bg-surface-elevated text-textMuted border-border hover:text-textPrimary hover:border-actionBlue/30'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isMonitored(selectedAsset.symbol) ? 'fill-actionBlue text-actionBlue' : ''}`} />
                    <span>{isMonitored(selectedAsset.symbol) ? 'Monitored' : 'Monitor'}</span>
                  </button>
                )}
              </div>

              {/* UNIFIED TAB SWITCHER: US | India | UK | EU | Singapore */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-textMuted flex items-center gap-1">
                    <Globe className="w-3 h-3 text-actionBlue" /> Market Region
                  </span>
                  <span className="text-[10px] font-mono font-bold text-actionBlue bg-actionBlue/10 px-2.5 py-0.5 rounded-full border border-actionBlue/20">
                    {activeRegionConfig.currency} • {activeRegionConfig.exchanges.join(', ')}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 bg-surface-elevated p-1.5 rounded-xl border border-border shadow-xs">
                  {MARKET_REGIONS.map(region => (
                    <button
                      key={region.id}
                      onClick={() => {
                        setActiveRegion(region.id);
                        const firstAsset = GLOBAL_ASSETS.find(a => a.region === region.id);
                        if (firstAsset) setSelectedAsset(firstAsset);
                        setSearchQuery('');
                      }}
                      className={`py-1.5 px-1 rounded-lg text-center transition-all duration-300 ease-out cursor-pointer flex flex-col items-center justify-center active:scale-95 ${
                        activeRegion === region.id
                          ? 'bg-accentPrimary text-background shadow-xs font-extrabold'
                          : 'text-textMuted hover:text-textPrimary font-medium'
                      }`}
                    >
                      <span className="text-sm leading-none">{region.flag}</span>
                      <span className="text-[10px] tracking-tight mt-0.5">{region.label}</span>
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
                    className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-textPrimary placeholder-textMuted/60 focus:outline-none focus:border-actionBlue focus:ring-1 focus:ring-actionBlue/50 transition-all font-sans"
                  />
                  <Search className="w-4 h-4 text-textMuted absolute left-3 top-3" />
                </div>
                
                <AnimatePresence>
                  {showDropdown && searchQuery && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-card-hover z-50 max-h-72 overflow-y-auto divide-y divide-border"
                    >
                      {filteredAssets.length === 0 ? (
                        <div className="p-4 text-center text-xs text-textMuted">
                          No matching assets found for "{searchQuery}".
                        </div>
                      ) : (
                        filteredAssets.map(asset => (
                          <div 
                            key={asset.symbol} 
                            onClick={() => { setSelectedAsset(asset); setActiveRegion(asset.region); setShowDropdown(false); setSearchQuery(''); }}
                            className="p-3 hover:bg-surface-elevated cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-actionBlue/10 text-actionBlue border border-actionBlue/20 flex items-center justify-center font-bold text-xs">
                                {asset.logo}
                              </div>
                              <div>
                                <div className="font-bold text-textPrimary text-xs flex items-center gap-1.5">
                                  <span>{asset.symbol}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-textMuted">{asset.exchange}</span>
                                </div>
                                <div className="text-[10px] text-textMuted">{asset.name}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right font-mono tabular-nums">
                                {(() => {
                                  const lp = getLivePrice(asset.symbol, asset.price);
                                  const lq = getLiveQuote(asset.symbol);
                                  const isPos = lq ? lq.isUp : asset.isUp;
                                  const chg = lq ? `${isPos ? '+' : ''}${lq.changePercent}%` : asset.change;
                                  return (
                                    <>
                                      <div className="font-semibold text-textPrimary text-xs">{asset.currency}{lp.toFixed(2)}</div>
                                      <div className={`text-[10px] font-bold ${isPos ? 'text-profitGreen' : 'text-lossRed'}`}>{chg}</div>
                                    </>
                                  );
                                })()}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleToggleWatchlist(asset); }}
                                className="p-1.5 rounded-lg hover:bg-surface-elevated text-textMuted hover:text-actionBlue transition-colors active:scale-95"
                              >
                                <Star className={`w-3.5 h-3.5 ${isMonitored(asset.symbol) ? 'fill-actionBlue text-actionBlue' : ''}`} />
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
                <span className="text-[10px] font-mono text-textMuted uppercase font-bold shrink-0">Hot:</span>
                {regionalAssets.slice(0, 6).map(asset => {
                  const liveP = getLivePrice(asset.symbol, asset.price);
                  const tick = tickDirections[asset.symbol];
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => { setSelectedAsset(asset); }}
                      className={`px-3 py-1 rounded-xl text-[11px] font-mono tabular-nums font-bold shrink-0 transition-all duration-300 ease-out cursor-pointer flex items-center gap-1.5 active:scale-95 border ${
                        selectedAsset?.symbol === asset.symbol
                          ? 'bg-accentPrimary text-background border-transparent shadow-xs'
                          : tick === 'up'
                            ? 'bg-profitGreen/20 border-profitGreen/50 text-profitGreen'
                            : tick === 'down'
                              ? 'bg-lossRed/20 border-lossRed/50 text-lossRed'
                              : 'bg-surface-elevated border-border text-textPrimary hover:border-actionBlue/40'
                      }`}
                    >
                      <span>{asset.symbol}</span>
                      <span className="text-[9px] opacity-90">{asset.currency}{liveP.toFixed(liveP < 10 ? 2 : 0)}</span>
                    </button>
                  );
                })}
              </div>

              {/* ORDER EXECUTION TICKET */}
              {selectedAsset && (
                <form onSubmit={handleExecuteTrade} className="space-y-4 border-t border-border pt-4">
                  <div className="flex justify-between items-center bg-surface-elevated p-3.5 rounded-xl border border-border font-mono tabular-nums">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-textPrimary">{selectedAsset.symbol}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-actionBlue/10 text-actionBlue border border-actionBlue/20">
                          {selectedAsset.exchange}
                        </span>
                      </div>
                      <span className="text-[11px] text-textMuted block mt-0.5 font-sans">{selectedAsset.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-extrabold ${marketData?.isUp ? 'text-profitGreen' : 'text-lossRed'}`}>
                        {currentCurrency}{(Number(marketData?.currentPrice) || 100).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-textMuted block font-sans">Live LTP</span>
                    </div>
                  </div>

                  {/* Order Type Toggle */}
                  <div className="flex bg-surface-elevated rounded-xl p-1 border border-border">
                    {['Delivery', 'Intraday'].map(t => (
                      <button 
                        key={t} type="button" onClick={() => setOrderType(t as any)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ease-out cursor-pointer active:scale-95 ${
                          orderType === t 
                            ? 'bg-surface text-textPrimary shadow-xs border border-border' 
                            : 'text-textMuted hover:text-textPrimary'
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
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all duration-300 ease-out cursor-pointer active:scale-95 ${
                          orderMode === m 
                            ? 'border-actionBlue text-actionBlue bg-actionBlue/10 shadow-xs' 
                            : 'border-border text-textMuted bg-surface-elevated hover:text-textPrimary'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-2 gap-3 font-mono tabular-nums text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1 font-sans">
                        <label className="text-textMuted">Quantity</label>
                        <div className="flex items-center gap-1">
                          {[10, 50, 100].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setQuantity(v)}
                              className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-surface border border-border text-textMuted hover:text-textPrimary hover:border-actionBlue/40 cursor-pointer active:scale-95"
                            >
                              +{v}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              if (orderSide === 'Buy') {
                                const p = orderMode === 'Market' ? (Number(marketData?.currentPrice) || baseLivePrice) : Number(limitPrice || baseLivePrice);
                                const maxAffordable = Math.max(1, Math.floor((tradingData.cashBalance * 0.99) / (p || 1)));
                                setQuantity(maxAffordable);
                              } else {
                                const existing = tradingData.positions.find(pos => pos.symbol === selectedAsset.symbol);
                                setQuantity(Number(existing?.quantity) || 10);
                              }
                            }}
                            className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-actionBlue/10 border border-actionBlue/30 text-actionBlue font-bold hover:bg-actionBlue/20 cursor-pointer active:scale-95"
                          >
                            Max
                          </button>
                        </div>
                      </div>
                      <input 
                        type="number" required min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                        className="w-full bg-surface-elevated border border-border rounded-xl p-2.5 text-textPrimary font-bold focus:border-actionBlue focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-textMuted mb-1 font-sans">Limit Price ({currentCurrency})</label>
                      <input 
                        type="number" disabled={orderMode === 'Market'} 
                        value={orderMode === 'Market' ? Number((Number(marketData?.currentPrice) || 100).toFixed(2)) : limitPrice} 
                        onChange={e => setLimitPrice(Number(e.target.value))}
                        className="w-full bg-surface-elevated border border-border rounded-xl p-2.5 text-textPrimary font-bold disabled:opacity-50 focus:border-actionBlue focus:outline-none" 
                      />
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="bg-surface-elevated rounded-xl p-3.5 space-y-1.5 font-mono tabular-nums text-xs border border-border">
                    <div className="flex justify-between text-textMuted">
                      <span className="font-sans">Margin Required</span>
                      <span className="text-textPrimary font-bold">{currentCurrency}{(Number(marginRequired) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-textMuted">
                      <span className="font-sans">Brokerage Charges (0.10%)</span>
                      <span className="text-textPrimary font-bold">{currentCurrency}{(Number(estimatedCharges) || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => { setOrderSide('Buy'); handleExecuteTrade(undefined, 'Buy'); }} 
                      className="flex-1 py-3 bg-profitGreen hover:bg-profitGreen/90 text-black font-extrabold text-xs rounded-xl transition-all duration-300 ease-out cursor-pointer shadow-xs active:scale-95 hover:-translate-y-0.5"
                    >
                      BUY {selectedAsset.symbol}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setOrderSide('Sell'); handleExecuteTrade(undefined, 'Sell'); }} 
                      className="flex-1 py-3 bg-lossRed hover:bg-lossRed/90 text-white font-extrabold text-xs rounded-xl transition-all duration-300 ease-out cursor-pointer shadow-xs active:scale-95 hover:-translate-y-0.5"
                    >
                      SELL {selectedAsset.symbol}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* MONITORED STOCKS / MY WATCHLIST SECTION (BENTO GRID) */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-card-base hover:shadow-card-hover transition-all duration-300 ease-out space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-actionBlue/10 text-actionBlue border border-actionBlue/20">
                    <Star className="w-4 h-4 fill-actionBlue" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider font-sans">
                      My Monitored Stocks
                    </h3>
                    <span className="text-[10px] text-textMuted font-sans">
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
                      className={`px-2.5 py-1 rounded-lg text-[10px] transition-all duration-300 ease-out cursor-pointer font-bold active:scale-95 ${
                        watchlistFilter === f
                          ? 'bg-accentPrimary text-background shadow-xs'
                          : 'bg-surface-elevated text-textMuted hover:text-textPrimary border border-border'
                      }`}
                    >
                      {f === 'All' ? 'All' : f === 'US' ? '🇺🇸' : f === 'India' ? '🇮🇳' : f === 'UK' ? '🇬🇧' : f === 'EU' ? '🇪🇺' : '🇸🇬'}
                    </button>
                  ))}
                </div>
              </div>

              {filteredWatchlist.length === 0 ? (
                <AppleEmptyState
                  icon={Eye}
                  title="No Monitored Stocks"
                  description={`You are not tracking any securities in ${watchlistFilter === 'All' ? 'any region' : watchlistFilter}. Add assets to monitor live ticks and prices.`}
                  actionLabel="+ Add Global Bluechips"
                  onAction={() => {
                    GLOBAL_ASSETS.slice(0, 4).forEach(a => {
                      if (!isMonitored(a.symbol)) {
                        addToWatchlist({
                          symbol: a.symbol,
                          name: a.name,
                          price: Number(a.price) || 100,
                          currency: a.currency,
                          region: a.region,
                          exchange: a.exchange,
                          assetClass: 'Stock',
                          change: parseFloat(a.change) || 0,
                          changePercent: parseFloat(a.change) || 0
                        });
                      }
                    });
                  }}
                  className="py-6 bg-transparent border-dashed"
                />
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {filteredWatchlist.map((item) => {
                    const price = getLivePrice(item.symbol, item.price || 100);
                    const q = getLiveQuote(item.symbol);
                    const change = q ? q.changePercent : (item.changePercent || item.change || 0);
                    const isPositive = q ? q.isUp : (change >= 0);
                    const itemCurrency = item.currency || '$';
                    const tick = tickDirections[item.symbol];
                    const points = [price * 0.985, price * 0.99, price * (isPositive ? 1.01 : 0.995), price * (isPositive ? 1.02 : 0.98), price];

                    return (
                      <div 
                        key={item.id}
                        className={`p-3 bg-surface-elevated hover:bg-surface border rounded-xl flex items-center justify-between transition-all duration-300 ease-out group hover:-translate-y-0.5 shadow-card-base hover:shadow-card-hover ${
                          tick === 'up' 
                            ? 'border-profitGreen/60 bg-profitGreen/10' 
                            : tick === 'down' 
                              ? 'border-lossRed/60 bg-lossRed/10' 
                              : 'border-border hover:border-actionBlue/40'
                        }`}
                      >
                        {/* Symbol & Name */}
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-textPrimary truncate">
                              {item.symbol}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-surface border border-border text-textMuted uppercase font-sans">
                              {item.region || 'US'}
                            </span>
                          </div>
                          <div className="text-[10px] text-textMuted truncate max-w-[120px] font-sans">
                            {item.name || item.symbol}
                          </div>
                        </div>

                        {/* Mini Sparkline Chart */}
                        <div className="hidden sm:block">
                          <MiniSparkline points={points} isUp={isPositive} />
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right font-mono tabular-nums">
                            <div className="font-bold text-xs text-textPrimary">
                              {itemCurrency}{(Number(price) || 0).toFixed(2)}
                            </div>
                            <div className={`text-[10px] font-bold ${isPositive ? 'text-profitGreen' : 'text-lossRed'}`}>
                              {isPositive ? '+' : ''}{(Number(change) || 0).toFixed(2)}%
                            </div>
                          </div>

                          {/* Quick Load into Ticket */}
                          <button
                            onClick={() => handleLoadIntoTicket(item)}
                            title="Load into Order Ticket"
                            className="p-1.5 rounded-lg bg-actionBlue text-white hover:bg-actionBlue/90 transition-all duration-300 ease-out cursor-pointer active:scale-95 shadow-xs"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove from Watchlist */}
                          <button
                            onClick={() => removeFromWatchlist(item.id)}
                            title="Remove from Watchlist"
                            className="p-1.5 rounded-lg text-textMuted hover:text-lossRed hover:bg-lossRed/10 transition-colors cursor-pointer active:scale-95"
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
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-card-base hover:shadow-card-hover transition-all duration-300 ease-out space-y-3 font-mono tabular-nums">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-textMuted font-sans">Available Cash Balance</span>
                 <span className="text-textPrimary font-bold tracking-tighter">{currentCurrency}{tradingData.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                 <span className="text-textMuted font-sans">Total Portfolio Net Worth</span>
                 <span className="text-textPrimary font-bold tracking-tighter">{currentCurrency}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden border border-border">
                 <div className="h-full bg-gradient-to-r from-actionBlue to-profitGreen rounded-full transition-all shadow-xs" style={{ width: `${Math.min(100, (tradingData.cashBalance / (totalValue || 1)) * 100)}%` }}></div>
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE CHART & HOLDINGS */}
          <div className="lg:col-span-8 space-y-6 w-full min-w-0">
            
            {selectedAsset && (
              <LiveMarketPanel 
                asset={selectedAsset}
                marketData={marketData}
                volatility={volatility}
                setVolatility={setVolatility}
              />
            )}

            {/* Holdings & Positions Switcher */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card-base transition-all duration-300 ease-out">
              <div className="flex gap-4 border-b border-border mb-4">
                <button 
                  onClick={() => setPortfolioTab('holdings')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-300 ease-out cursor-pointer active:scale-95 ${
                    portfolioTab === 'holdings' ? 'border-actionBlue text-actionBlue' : 'border-transparent text-textMuted hover:text-textPrimary'
                  }`}
                >
                  Holdings Portfolio ({tradingData.positions.length})
                </button>
                <button 
                  onClick={() => setPortfolioTab('positions')}
                  className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all duration-300 ease-out cursor-pointer active:scale-95 ${
                    portfolioTab === 'positions' ? 'border-actionBlue text-actionBlue' : 'border-transparent text-textMuted hover:text-textPrimary'
                  }`}
                >
                  Active Intraday Orders (0)
                </button>
              </div>

              {portfolioTab === 'holdings' ? (
                <div>
                  {tradingData.positions.length === 0 ? (
                    <AppleEmptyState
                      icon={Briefcase}
                      title="No Active Holdings"
                      description="Search for any global stock or ETF using the asset discovery terminal above to execute paper trades and build your simulated portfolio."
                      actionLabel="Search & Trade Assets"
                      onAction={() => {
                        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                        if (searchInput) {
                          searchInput.focus();
                          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      className="py-10 bg-transparent border-dashed"
                    />
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="text-[10px] text-textMuted uppercase tracking-wider border-b border-border">
                            <th className="pb-3 px-2">Instrument</th>
                            <th className="pb-3 px-2 text-right">Qty</th>
                            <th className="pb-3 px-2 text-right">Avg Cost</th>
                            <th className="pb-3 px-2 text-right">Current LTP (Live)</th>
                            <th className="pb-3 px-2 text-right">Unrealized P&L</th>
                            <th className="pb-3 px-2 text-right">Quick Trade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {tradingData.positions.map((pos) => {
                            const qty = Number(pos?.quantity) || 0;
                            const avgCost = Number(pos?.averageEntryPrice) || 0;
                            const curPrice = getLivePrice(pos.symbol, Number(pos?.currentPrice) || avgCost);
                            const invested = qty * avgCost;
                            const current = qty * curPrice;
                            const pnl = current - invested;
                            const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
                            const tickDir = tickDirections[pos.symbol];
                            const assetMeta = GLOBAL_ASSETS.find(a => a.symbol === pos.symbol);
                            const curSymbol = (pos as any)?.currency || assetMeta?.currency || '$';
                            return (
                              <tr key={pos.id} className="hover:bg-surface-elevated transition-colors">
                                <td className="py-3 px-2">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleLoadIntoTicket(pos);
                                        const ticketEl = document.getElementById('order-ticket-container');
                                        if (ticketEl) ticketEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }}
                                      className="font-bold text-textPrimary hover:text-actionBlue hover:underline text-left transition-colors cursor-pointer"
                                      title="Click to load into Order Ticket"
                                    >
                                      {pos.symbol}
                                    </button>
                                    <span className="text-[9px] px-1 py-0.5 rounded bg-surface-muted border border-border text-textMuted font-sans">
                                      {pos.assetClass || 'Stock'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-textMuted truncate max-w-[170px]">{pos.name}</div>
                                </td>
                                <td className="py-3 px-2 text-right text-textPrimary font-semibold">{qty}</td>
                                <td className="py-3 px-2 text-right text-textMuted">{curSymbol}{avgCost.toFixed(2)}</td>
                                <td className="py-3 px-2 text-right font-bold">
                                  <span className={`inline-flex items-center gap-1 transition-all duration-300 ${
                                    tickDir === 'up' ? 'text-profitGreen drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]' :
                                    tickDir === 'down' ? 'text-lossRed drop-shadow-[0_0_8px_rgba(244,63,94,0.35)]' :
                                    'text-textPrimary'
                                  }`}>
                                    {tickDir === 'up' && <span className="text-[10px]">▲</span>}
                                    {tickDir === 'down' && <span className="text-[10px]">▼</span>}
                                    {curSymbol}{curPrice.toFixed(2)}
                                  </span>
                                </td>
                                <td className={`py-3 px-2 text-right font-bold ${pnl >= 0 ? 'text-profitGreen' : 'text-lossRed'}`}>
                                  {pnl >= 0 ? '+' : ''}{curSymbol}{pnl.toFixed(2)}
                                  <span className="text-[10px] font-normal block">({pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)</span>
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <div className="inline-flex items-center gap-1.5 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleLoadIntoTicket(pos);
                                        setOrderSide('Buy');
                                        if (showToast) showToast(`Loaded ${pos.symbol} to Buy`, 'info', 2000);
                                        const ticketEl = document.getElementById('order-ticket-container');
                                        if (ticketEl) ticketEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }}
                                      className="px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                      title="Load into ticket to buy more"
                                    >
                                      + Buy
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleLoadIntoTicket(pos);
                                        setOrderSide('Sell');
                                        setQuantity(qty);
                                        if (showToast) showToast(`Prepared Exit for ${pos.symbol} (${qty} shares)`, 'warning', 2500);
                                        const ticketEl = document.getElementById('order-ticket-container');
                                        if (ticketEl) ticketEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }}
                                      className="px-2 py-1 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                      title="Exit full position"
                                    >
                                      Exit
                                    </button>
                                  </div>
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
                <AppleEmptyState
                  icon={Activity}
                  title="No Active Intraday Positions"
                  description="Intraday equity orders and F&O positions settle automatically at market close."
                  className="py-10 bg-transparent border-dashed"
                />
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
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card-base hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-textMuted font-bold">Portfolio Net Worth</span>
                <div className="p-1.5 rounded-xl bg-actionBlue/10 text-actionBlue">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono tracking-tighter text-textPrimary">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-profitGreen">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Total Return: {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%</span>
              </div>
            </div>

            {/* Unrealized P&L */}
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card-base hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-textMuted font-bold">Unrealized P&L</span>
                <div className={`p-1.5 rounded-xl ${unrealizedPnL >= 0 ? 'bg-profitGreen/10 text-profitGreen' : 'bg-lossRed/10 text-lossRed'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl font-extrabold font-mono tracking-tighter ${unrealizedPnL >= 0 ? 'text-profitGreen' : 'text-lossRed'}`}>
                {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
              </div>
              <span className="text-xs text-textMuted block font-mono">
                Across {tradingData.positions.length} active positions
              </span>
            </div>

            {/* Sharpe Ratio & Risk/Reward */}
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card-base hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-textMuted font-bold">Sharpe & Risk Metrics</span>
                <div className="p-1.5 rounded-xl bg-actionBlue/10 text-actionBlue">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono tracking-tighter text-textPrimary">
                1.84 <span className="text-xs font-normal text-textMuted font-sans">Sharpe</span>
              </div>
              <span className="text-xs text-actionBlue block font-mono">
                R/R: 1:2.8 • Win Rate: 68.5%
              </span>
            </div>

            {/* Alpha & Beta */}
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card-base hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-mono uppercase text-textMuted font-bold">Alpha vs. Benchmark</span>
                <div className="p-1.5 rounded-xl bg-actionBlue/10 text-actionBlue">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono tracking-tighter text-actionBlue">
                +3.4% <span className="text-xs font-normal text-textMuted font-sans">Alpha</span>
              </div>
              <span className="text-xs text-textMuted block font-mono">
                Portfolio Beta: 1.05 (S&P 500)
              </span>
            </div>

          </div>

          {/* Middle Row: Asset Allocation & Performance Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Asset Allocation Panel (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-surface border border-border shadow-card-base space-y-5 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-textPrimary font-mono uppercase tracking-wider flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-actionBlue" />
                  <span>Asset Allocation Breakdown</span>
                </h3>
                <span className="text-[10px] font-mono text-textMuted">Multi-Asset</span>
              </div>

              {/* Progress Stacked Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex border border-border shadow-xs">
                <div style={{ width: `${allocation.equitiesPct}%` }} className="bg-actionBlue" title={`Equities: ${allocation.equitiesPct}%`} />
                <div style={{ width: `${allocation.etfPct}%` }} className="bg-purple-600" title={`ETFs: ${allocation.etfPct}%`} />
                <div style={{ width: `${allocation.commodityPct}%` }} className="bg-amber-500" title={`Commodities: ${allocation.commodityPct}%`} />
                <div style={{ width: `${allocation.cashPct}%` }} className="bg-profitGreen" title={`Cash: ${allocation.cashPct}%`} />
              </div>

              {/* Allocation Legend */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-actionBlue" />
                    <span className="text-textPrimary">Equities / Stocks</span>
                  </div>
                  <span className="font-bold text-textPrimary">${allocation.equitiesVal.toFixed(2)} ({allocation.equitiesPct}%)</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    <span className="text-textPrimary">Index ETFs</span>
                  </div>
                  <span className="font-bold text-textPrimary">${allocation.etfVal.toFixed(2)} ({allocation.etfPct}%)</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-textPrimary">Commodities</span>
                  </div>
                  <span className="font-bold text-textPrimary">${allocation.commodityVal.toFixed(2)} ({allocation.commodityPct}%)</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-profitGreen" />
                    <span className="text-textPrimary">Uninvested Cash</span>
                  </div>
                  <span className="font-bold text-textPrimary">${allocation.cashVal.toFixed(2)} ({allocation.cashPct}%)</span>
                </div>
              </div>
            </div>

            {/* Position Exposure Heatmap (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-surface border border-border shadow-card-base space-y-5 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-textPrimary font-mono uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-profitGreen" />
                  <span>Position Performance Heatmap</span>
                </h3>
                <span className="text-[10px] font-mono text-textMuted">Live Mark-to-Market</span>
              </div>

              {tradingData.positions.length === 0 ? (
                <div className="py-8 text-center text-textMuted font-mono text-xs border border-dashed border-border rounded-xl">
                  No active holdings to display in heatmap. Execute paper trades to view live performance.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tradingData.positions.map(pos => {
                    const qty = Number(pos?.quantity) || 0;
                    const avgCost = Number(pos?.averageEntryPrice) || 0;
                    const curPrice = getLivePrice(pos.symbol, Number(pos?.currentPrice) || avgCost);
                    const invested = qty * avgCost;
                    const current = qty * curPrice;
                    const pnl = current - invested;
                    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
                    const isPositive = pnl >= 0;
                    const tickDir = tickDirections[pos.symbol];
                    const assetMeta = GLOBAL_ASSETS.find(a => a.symbol === pos.symbol);
                    const curSymbol = (pos as any)?.currency || assetMeta?.currency || '$';

                    return (
                      <div 
                        key={pos.id}
                        className={`p-4 rounded-xl border transition-all duration-300 ease-out space-y-2 shadow-card-base hover:shadow-card-hover hover:-translate-y-0.5 ${
                          isPositive 
                            ? 'bg-profitGreen/5 border-profitGreen/30' 
                            : 'bg-lossRed/5 border-lossRed/30'
                        }`}
                      >
                        <div className="flex justify-between items-start font-mono">
                          <div>
                            <span className="font-extrabold text-sm text-textPrimary block">{pos.symbol}</span>
                            <span className="text-[10px] text-textMuted">{qty} units • LTP {curSymbol}{curPrice.toFixed(2)}</span>
                          </div>
                          <span className={`text-xs font-bold inline-flex items-center gap-0.5 ${isPositive ? 'text-profitGreen' : 'text-lossRed'}`}>
                            {tickDir === 'up' && <span className="text-[9px]">▲</span>}
                            {tickDir === 'down' && <span className="text-[9px]">▼</span>}
                            {isPositive ? '+' : ''}{pnlPct.toFixed(2)}%
                          </span>
                        </div>

                        <div className="pt-2 border-t border-border flex justify-between items-baseline font-mono text-xs">
                          <span className="text-textMuted text-[10px]">Position P&L:</span>
                          <span className={`font-bold ${isPositive ? 'text-profitGreen' : 'text-lossRed'}`}>
                            {isPositive ? '+' : ''}{curSymbol}{pnl.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Trade Execution History Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-card-base space-y-4 transition-all duration-300 ease-out">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4 text-actionBlue" />
                <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">
                  Trade Execution Log ({tradingData.tradeHistory.length})
                </h3>
              </div>

              {tradingData.tradeHistory.length > 0 && (
                <button
                  onClick={handleClearTradeHistory}
                  className="px-3 py-1 rounded-xl bg-surface-elevated hover:bg-lossRed/10 hover:text-lossRed text-textMuted text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ease-out cursor-pointer active:scale-95 border border-border"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Log</span>
                </button>
              )}
            </div>

            {tradingData.tradeHistory.length === 0 ? (
              <AppleEmptyState
                icon={Clock}
                title="No Trade History"
                description="Your executed limit, market, and stop orders will appear in this real-time trade log."
                className="py-8 bg-transparent border-dashed"
              />
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[10px] text-textMuted uppercase tracking-wider border-b border-border">
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
                  <tbody className="divide-y divide-border">
                    {tradingData.tradeHistory.map((tr) => {
                      const assetMeta = GLOBAL_ASSETS.find(a => a.symbol === tr.symbol);
                      const curSymbol = (tr as any)?.currency || assetMeta?.currency || '$';
                      const execPrice = Number(tr?.executionPrice) || 0;
                      const trQty = Number(tr?.quantity) || 0;
                      return (
                        <tr key={tr.id} className="hover:bg-surface-elevated transition-colors">
                          <td className="py-3 px-2 text-textMuted">
                            {new Date(tr.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="py-3 px-2 font-bold text-textPrimary">{tr.symbol}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tr.side === 'Buy' ? 'bg-profitGreen/15 text-profitGreen' : 'bg-lossRed/15 text-lossRed'
                            }`}>
                              {tr.side.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-textMuted">{tr.type}</td>
                          <td className="py-3 px-2 text-right text-textPrimary font-bold">{trQty}</td>
                          <td className="py-3 px-2 text-right text-textMuted">{curSymbol}{execPrice.toFixed(2)}</td>
                          <td className="py-3 px-2 text-right font-bold text-textPrimary">{curSymbol}{(execPrice * trQty).toFixed(2)}</td>
                          <td className="py-3 px-2 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-profitGreen/15 text-profitGreen text-[10px] font-bold">
                              {tr.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-card-base flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ease-out">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-actionBlue block mb-1">
                Institutional Finance Curriculum
              </span>
              <h2 className="text-xl font-bold text-textPrimary tracking-tight">
                Interactive Core Concepts Academy
              </h2>
              <p className="text-xs text-textMuted mt-1 max-w-xl">
                4 structured interactive tracks covering market theory, statement analysis, DCF modeling, and M&A/LBO transactions with live calculators.
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs bg-surface-elevated p-3 rounded-xl border border-border shadow-xs shrink-0">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-[10px] text-textMuted block">Mastery Progress</span>
                <strong className="text-textPrimary">
                  {Object.values(tradingData.academyProgress).filter(Boolean).length} / 4 Tracks Completed
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Track 1: Core Trading Theory */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-card-base hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between transition-all duration-300 ease-out group space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-actionBlue/10 text-actionBlue flex items-center justify-center font-bold">
                    <Book className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-actionBlue/10 text-actionBlue uppercase">
                    Track 1 • Theory
                  </span>
                </div>

                <h3 className="text-lg font-bold text-textPrimary group-hover:text-actionBlue transition-colors tracking-tight">
                  Core Trading Theory & Market Mechanics
                </h3>
                <p className="text-xs text-textMuted leading-relaxed font-sans">
                  Bid-Ask Spread & Order Books, Market vs. Limit Orders, Slippage & Execution Risk, CAPM & Beta Calculation, and Modern Portfolio Theory (MPT).
                </p>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border text-xs text-textPrimary font-mono space-y-1">
                  <span className="font-bold text-[10px] uppercase text-actionBlue block">Includes:</span>
                  <div>• Interactive CAPM Expected Return Calculator</div>
                  <div>• 3-Question Market Mechanics Mastery Check</div>
                </div>
              </div>

              <button 
                onClick={() => setActiveModule('theory')}
                className={`w-full py-3 min-h-[44px] rounded-xl text-xs font-bold transition-all duration-300 ease-out cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-95 ${
                  tradingData.academyProgress['theory'] 
                    ? 'bg-profitGreen/15 text-profitGreen border border-profitGreen/30' 
                    : 'bg-accentPrimary text-background'
                }`}
              >
                {tradingData.academyProgress['theory'] ? <CheckCircle2 className="w-4 h-4 text-profitGreen" /> : <Sparkles className="w-4 h-4" />}
                <span>{tradingData.academyProgress['theory'] ? 'Completed • Review Track' : 'Start Theory Track'}</span>
              </button>
            </div>
            
            {/* Track 2: Financial Statement Analysis */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-card-base hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between transition-all duration-300 ease-out group space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-actionBlue/10 text-actionBlue flex items-center justify-center font-bold">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-actionBlue/10 text-actionBlue uppercase">
                    Track 2 • Accounting
                  </span>
                </div>

                <h3 className="text-lg font-bold text-textPrimary group-hover:text-actionBlue transition-colors tracking-tight">
                  Financial Statement Analysis
                </h3>
                <p className="text-xs text-textMuted leading-relaxed font-sans">
                  Income Statement (Revenue to Net Income), Balance Sheet Mechanics, Cash Flow Statement (CFO, CFI, CFF), and DuPont ROE / ROIC ratios.
                </p>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border text-xs text-textPrimary font-mono space-y-1">
                  <span className="font-bold text-[10px] uppercase text-actionBlue block">Includes:</span>
                  <div>• Interactive 3-Part DuPont ROE Breakdown Sandbox</div>
                  <div>• 3-Question Statement Accounting Quiz</div>
                </div>
              </div>

              <button 
                onClick={() => setActiveModule('statements')}
                className={`w-full py-3 min-h-[44px] rounded-xl text-xs font-bold transition-all duration-300 ease-out cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-95 ${
                  tradingData.academyProgress['statements'] 
                    ? 'bg-profitGreen/15 text-profitGreen border border-profitGreen/30' 
                    : 'bg-accentPrimary text-background'
                }`}
              >
                {tradingData.academyProgress['statements'] ? <CheckCircle2 className="w-4 h-4 text-profitGreen" /> : <Sparkles className="w-4 h-4" />}
                <span>{tradingData.academyProgress['statements'] ? 'Completed • Review Track' : 'Start Statements Track'}</span>
              </button>
            </div>
            
            {/* Track 3: Corporate Valuation & DCF Modeling */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-card-base hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between transition-all duration-300 ease-out group space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-actionBlue/10 text-actionBlue flex items-center justify-center font-bold">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-actionBlue/10 text-actionBlue uppercase">
                    Track 3 • Valuation
                  </span>
                </div>

                <h3 className="text-lg font-bold text-textPrimary group-hover:text-actionBlue transition-colors tracking-tight">
                  Corporate Valuation & DCF Modeling
                </h3>
                <p className="text-xs text-textMuted leading-relaxed font-sans">
                  Unlevered Free Cash Flow (FCFF), WACC & Cost of Capital, Terminal Value (Gordon Growth vs. Exit Multiples), and Enterprise Value vs. Equity Value.
                </p>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border text-xs text-textPrimary font-mono space-y-1">
                  <span className="font-bold text-[10px] uppercase text-actionBlue block">Includes:</span>
                  <div>• Interactive Gordon Growth Terminal Value Calculator</div>
                  <div>• 3-Question Valuation & WACC Assessment</div>
                </div>
              </div>

              <button 
                onClick={() => setActiveModule('valuation')}
                className={`w-full py-3 min-h-[44px] rounded-xl text-xs font-bold transition-all duration-300 ease-out cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-95 ${
                  tradingData.academyProgress['valuation'] 
                    ? 'bg-profitGreen/15 text-profitGreen border border-profitGreen/30' 
                    : 'bg-accentPrimary text-background'
                }`}
              >
                {tradingData.academyProgress['valuation'] ? <CheckCircle2 className="w-4 h-4 text-profitGreen" /> : <Sparkles className="w-4 h-4" />}
                <span>{tradingData.academyProgress['valuation'] ? 'Completed • Review Track' : 'Start DCF Track'}</span>
              </button>
            </div>

            {/* Track 4: Investment Banking & M&A / LBO */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-card-base hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between transition-all duration-300 ease-out group space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-actionBlue/10 text-actionBlue flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-actionBlue/10 text-actionBlue uppercase">
                    Track 4 • M&A & LBO
                  </span>
                </div>

                <h3 className="text-lg font-bold text-textPrimary group-hover:text-actionBlue transition-colors tracking-tight">
                  Investment Banking & M&A / LBO
                </h3>
                <p className="text-xs text-textMuted leading-relaxed font-sans">
                  Accretion/Dilution Analysis, Comparable Companies (Comps), Precedent Transactions, LBO Returns (IRR & MoIC), and Debt Sizing.
                </p>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border text-xs text-textPrimary font-mono space-y-1">
                  <span className="font-bold text-[10px] uppercase text-actionBlue block">Includes:</span>
                  <div>• Interactive M&A Accretion/Dilution Evaluator</div>
                  <div>• 3-Question LBO Returns & Deal Mechanics Quiz</div>
                </div>
              </div>

              <button 
                onClick={() => setActiveModule('mna')}
                className={`w-full py-3 min-h-[44px] rounded-xl text-xs font-bold transition-all duration-300 ease-out cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-95 ${
                  tradingData.academyProgress['mna'] 
                    ? 'bg-profitGreen/15 text-profitGreen border border-profitGreen/30' 
                    : 'bg-accentPrimary text-background'
                }`}
              >
                {tradingData.academyProgress['mna'] ? <CheckCircle2 className="w-4 h-4 text-profitGreen" /> : <Sparkles className="w-4 h-4" />}
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
