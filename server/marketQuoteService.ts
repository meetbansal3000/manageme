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

// In-memory 10-second cache to prevent rate-limiting while providing near-real-time updates
const quoteCache = new Map<string, { quote: MarketQuote; cachedAt: number }>();
const CACHE_TTL_MS = 10000;

export async function fetchLiveQuote(rawSymbol: string): Promise<MarketQuote | null> {
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      },
      (res) => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            const meta = data?.chart?.result?.[0]?.meta;
            if (!meta || typeof meta.regularMarketPrice !== 'number') {
              resolve(null);
              return;
            }

            const price = Number(meta.regularMarketPrice);
            const prevClose = Number(meta.chartPreviousClose || price);
            const change = Number((price - prevClose).toFixed(2));
            const changePercent = prevClose ? Number(((change / prevClose) * 100).toFixed(2)) : 0;

            const quote: MarketQuote = {
              symbol: sym,
              price,
              prevClose,
              change,
              changePercent,
              isUp: change >= 0,
              high24h: Number(meta.regularMarketDayHigh || price),
              low24h: Number(meta.regularMarketDayLow || price),
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

export async function fetchMultipleLiveQuotes(symbols: string[]): Promise<Record<string, MarketQuote>> {
  const unique = Array.from(new Set(symbols.map(s => s.trim().toUpperCase()))).filter(Boolean);
  const results = await Promise.all(unique.map(sym => fetchLiveQuote(sym)));

  const map: Record<string, MarketQuote> = {};
  unique.forEach((sym, idx) => {
    const q = results[idx];
    if (q) map[sym] = q;
  });

  return map;
}
