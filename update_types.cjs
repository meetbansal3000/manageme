const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code += `

// --- Paper Trading & Portfolio Simulator Types ---

export interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  assetClass: 'Stock' | 'ETF' | 'Commodity' | 'FX';
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
}

export interface TradeOrder {
  id: string;
  symbol: string;
  type: 'Market' | 'Limit' | 'Stop-Loss' | 'Take-Profit';
  side: 'Buy' | 'Sell';
  quantity: number;
  targetPrice?: number; // for Limit/Stop
  executionPrice?: number; // null if pending
  status: 'Pending' | 'Executed' | 'Cancelled';
  timestamp: number;
}

export interface PaperTradingData {
  cashBalance: number;
  startingCapital: number;
  positions: PortfolioPosition[];
  tradeHistory: TradeOrder[];
  academyProgress: Record<string, boolean>; // e.g. { 'dcf-basics': true }
}
`;

fs.writeFileSync('src/types.ts', code);
