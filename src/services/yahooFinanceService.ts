/**
 * Multi-Provider Financial News & Market Data Service
 * Supports Yahoo Finance (via RapidAPI or public APIs), Finnhub, and server proxy feeds.
 */

export interface UnifiedNewsArticle {
  id: string;
  title: string;
  source: string;
  category: string;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  date: string;
  readTime?: string;
  url: string;
  summary: string;
  sectorTags: string[];
  region?: string;
  provider?: 'Yahoo Finance' | 'Finnhub' | 'Bloomberg' | 'Reuters' | 'FT' | 'Curated';
}

export interface MarketAssetQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  category: 'equities' | 'indices' | 'crypto' | 'commodities' | 'forex';
  high24h?: number;
  low24h?: number;
  volume?: string;
}

/**
 * Fetch Unified Financial News from Backend and direct provider fallbacks
 */
export async function fetchUnifiedFinancialNews(forceRefresh = false): Promise<UnifiedNewsArticle[]> {
  const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY || import.meta.env.VITE_YAHOO_FINANCE_API_KEY || '';
  const finnhubKey = import.meta.env.VITE_FINNHUB_API_KEY || '';

  // 1. Try server unified news endpoint
  try {
    const url = forceRefresh ? '/api/news/live?refresh=true' : '/api/news/live';
    const headers: Record<string, string> = {};
    if (rapidApiKey) headers['x-rapidapi-key'] = rapidApiKey;
    if (finnhubKey) headers['x-finnhub-token'] = finnhubKey;

    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.articles) && data.articles.length > 0) {
        return data.articles;
      }
    }
  } catch (err) {
    console.warn('Server news proxy fetch error, attempting direct provider fallbacks:', err);
  }

  // 2. Direct Finnhub fallback if client key exists
  if (finnhubKey) {
    try {
      const finnhubRes = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`);
      if (finnhubRes.ok) {
        const items = await finnhubRes.json();
        if (Array.isArray(items) && items.length > 0) {
          return items.slice(0, 15).map((item: any) => ({
            id: `finnhub-${item.id || Date.now()}`,
            title: item.headline || 'Market Update',
            source: item.source ? `Finnhub • ${item.source}` : 'Finnhub News',
            category: item.category ? item.category.toUpperCase() : 'Global Markets',
            sentiment: 'Neutral',
            date: new Date(item.datetime ? item.datetime * 1000 : Date.now()).toISOString(),
            readTime: '3 min read',
            url: item.url || 'https://finnhub.io',
            summary: item.summary || item.headline || '',
            sectorTags: ['Finnhub', 'Global Markets', 'Equities'],
            provider: 'Finnhub'
          }));
        }
      }
    } catch (finnhubErr) {
      console.warn('Direct Finnhub fetch failed:', finnhubErr);
    }
  }

  return [];
}
