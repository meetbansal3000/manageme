// Type Definitions: Valuation & Trading Terminal

export type Currency = 'GBP' | 'USD' | 'INR' | 'EUR';

export interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  assetClass: 'Stock' | 'ETF' | 'Commodity' | 'FX' | string;
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
  shares?: number;
  avgPrice?: number;
}

export interface TradeOrder {
  id: string;
  symbol: string;
  type: 'Market' | 'Limit' | 'Stop-Loss' | 'Take-Profit' | string;
  side: 'Buy' | 'Sell' | string;
  quantity: number;
  targetPrice?: number; // for Limit/Stop
  executionPrice?: number; // null if pending
  status: 'Pending' | 'Executed' | 'Cancelled' | string;
  timestamp: number;
}

export interface PaperTradingData {
  cashBalance: number;
  startingCapital: number;
  positions: PortfolioPosition[];
  tradeHistory: TradeOrder[];
  academyProgress: Record<string, boolean>; // e.g. { 'dcf-basics': true }
}

export interface MarketDepthOrder {
  id: string;
  price: number;
  amount: number;
  total: number;
  type: 'bid' | 'ask';
}

export interface LiveTickerQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
  sparkline?: number[];
}
