import https from 'https';

export interface MarketQuote {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  changePercent: number;
  isUp: boolean;
  high24h: number;
  low24h: number;
  currency: string;
  timestamp: number;
}

const SYMBOL_MAP: Record<string, string> = {
  'GOLD': 'GC=F',
  'BRENT': 'BZ=F',
  'NIFTY50': '^NSEI',
  'FTSE100': '^FTSE',
  'STOXX50': '^STOXX50E'
};

const quoteCache = new Map<string, { quote: MarketQuote; cachedAt: number }>();
const CACHE_TTL_MS = 10000;

async function fetchLiveQuote(rawSymbol: string): Promise<MarketQuote | null> {
  const sym = rawSymbol.trim().toUpperCase();
  const cached = quoteCache.get(sym);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.quote;
  }

  const querySym = SYMBOL_MAP[sym] || sym;

  return new Promise<MarketQuote | null>((resolve) => {
    const req = https.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(querySym)}?interval=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        timeout: 4500
      },
      (res) => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              resolve(null);
              return;
            }
            const data = JSON.parse(raw);
            const result = data?.chart?.result?.[0];
            const meta = result?.meta;
            if (!meta || typeof meta.regularMarketPrice !== 'number') {
              resolve(null);
              return;
            }

            const price = Number(meta.regularMarketPrice.toFixed(2));
            const prevClose = Number((meta.previousClose || meta.chartPreviousClose || price).toFixed(2));
            const change = Number((price - prevClose).toFixed(2));
            const changePercent = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;
            const high24h = Number((meta.regularMarketDayHigh || price).toFixed(2));
            const low24h = Number((meta.regularMarketDayLow || price).toFixed(2));

            const quote: MarketQuote = {
              symbol: sym,
              price,
              prevClose,
              change,
              changePercent,
              isUp: change >= 0,
              high24h,
              low24h,
              currency: meta.currency || 'USD',
              timestamp: Date.now()
            };

            quoteCache.set(sym, { quote, cachedAt: Date.now() });
            resolve(quote);
          } catch {
            resolve(null);
          }
        });
      }
    );

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function fetchMultipleLiveQuotes(symbols: string[]): Promise<Record<string, MarketQuote>> {
  const unique = Array.from(new Set(symbols.map(s => s.trim().toUpperCase()))).filter(Boolean);
  const results = await Promise.all(unique.map(sym => fetchLiveQuote(sym)));

  const map: Record<string, MarketQuote> = {};
  unique.forEach((sym, idx) => {
    const q = results[idx];
    if (q) map[sym] = q;
  });

  return map;
}

function validateAndCalculatePaperTrade(req: any) {
  const { symbol, orderSide, orderMode, quantity, limitPrice, cashBalance = 0, positions = [] } = req;
  const qty = Math.floor(Number(quantity));
  if (isNaN(qty) || qty <= 0) {
    return { valid: false, error: 'Quantity must be a positive integer' };
  }

  const existingPos = positions.find((p: any) => p.symbol === symbol);
  const existingQty = existingPos ? Number(existingPos.quantity) || 0 : 0;

  if (orderSide === 'Sell' && qty > existingQty) {
    return { valid: false, error: `Cannot sell ${qty} units. You currently own ${existingQty} units of ${symbol}.` };
  }

  const price = Number(limitPrice || 100);
  const gross = Number((price * qty).toFixed(2));
  const fee = Number(Math.max(1.00, gross * 0.001).toFixed(2));
  const totalCost = Number((gross + fee).toFixed(2));

  if (orderSide === 'Buy' && totalCost > cashBalance) {
    return { valid: false, error: `Insufficient margin. Required: $${totalCost.toFixed(2)}, Available: $${Number(cashBalance).toFixed(2)}` };
  }

  let newCashBalance = Number(cashBalance);
  let updatedPositions = [...positions];

  if (orderSide === 'Buy') {
    newCashBalance = Number((newCashBalance - totalCost).toFixed(2));
    if (existingPos) {
      const oldQty = Number(existingPos.quantity) || 0;
      const oldAvg = Number(existingPos.averageEntryPrice) || price;
      const newQty = oldQty + qty;
      const newAvg = Number(((oldQty * oldAvg + gross) / newQty).toFixed(2));
      updatedPositions = updatedPositions.map(p => p.symbol === symbol ? { ...p, quantity: newQty, averageEntryPrice: newAvg, currentPrice: price } : p);
    } else {
      updatedPositions.push({
        id: Date.now().toString(),
        symbol,
        name: symbol,
        assetClass: 'Stock',
        quantity: qty,
        averageEntryPrice: price,
        currentPrice: price
      });
    }
  } else {
    const netProceeds = Number((gross - fee).toFixed(2));
    newCashBalance = Number((newCashBalance + netProceeds).toFixed(2));
    if (existingQty === qty) {
      updatedPositions = updatedPositions.filter(p => p.symbol !== symbol);
    } else {
      updatedPositions = updatedPositions.map(p => p.symbol === symbol ? { ...p, quantity: existingQty - qty, currentPrice: price } : p);
    }
  }

  return {
    valid: true,
    executionPrice: price,
    brokerFee: fee,
    totalCost,
    newCashBalance,
    newPositions: updatedPositions,
    executedTrade: {
      id: Date.now().toString(),
      symbol,
      side: orderSide,
      type: orderMode,
      quantity: qty,
      executionPrice: price,
      brokerFee: fee,
      totalAmount: totalCost,
      status: 'EXECUTED',
      timestamp: Date.now()
    }
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url || '';

  if (url.includes('/trade/validate-order') || url.includes('/api/trade/validate-order')) {
    try {
      const result = validateAndCalculatePaperTrade(req.body || {});
      if (!result.valid) {
        return res.status(400).json({ success: false, error: result.error });
      }
      return res.status(200).json({ success: true, ...result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Trade validation failed' });
    }
  }

  if (url.includes('/market/quotes') || url.includes('/api/market/quotes')) {
    try {
      const urlObj = new URL(url, 'http://localhost');
      const symbolsParam = urlObj.searchParams.get('symbols') || req.body?.symbols || '';
      const symbolList = Array.isArray(symbolsParam) 
        ? symbolsParam 
        : typeof symbolsParam === 'string' && symbolsParam.trim() 
          ? symbolsParam.split(',').map(s => s.trim()) 
          : [];

      const quotes = await fetchMultipleLiveQuotes(symbolList);
      return res.status(200).json({ success: true, quotes });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to fetch live quotes' });
    }
  }

  if (url.includes('/market/quote') || url.includes('/api/market/quote')) {
    try {
      const urlObj = new URL(url, 'http://localhost');
      const symbol = urlObj.searchParams.get('symbol') || req.body?.symbol || 'AAPL';
      const quote = await fetchLiveQuote(String(symbol));
      return res.status(200).json({ success: true, quote });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to fetch live quote' });
    }
  }

  if (url.includes('/health') || url.includes('/api/health')) {
    return res.status(200).json({ status: 'ok', timestamp: Date.now() });
  }

  return res.status(200).json({ message: 'ManageMe API Serverless Gateway', endpoint: url });
}
