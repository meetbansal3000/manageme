/**
 * Multi-Provider Global Financial News & Market Sentiment Service
 * Aggregates Yahoo Finance, Finnhub, Marketaux, Alpha Vantage, The Guardian, and server proxy feeds.
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
  provider?: 'Marketaux' | 'Alpha Vantage' | 'The Guardian' | 'Yahoo Finance' | 'Finnhub' | 'Bloomberg' | 'Reuters' | 'Financial Times' | 'Curated';
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
 * Fetch Unified Multi-Source Financial News with graceful client-side and server fallbacks
 */
export async function fetchUnifiedFinancialNews(forceRefresh = false): Promise<UnifiedNewsArticle[]> {
  const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY || import.meta.env.VITE_YAHOO_FINANCE_API_KEY || '';
  const finnhubKey = import.meta.env.VITE_FINNHUB_API_KEY || '';
  const marketauxKey = import.meta.env.VITE_MARKETAUX_API_KEY || '';
  const alphaVantageKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '';
  const guardianKey = import.meta.env.VITE_GUARDIAN_API_KEY || '';

  // 1. Try server unified news endpoint passing provider keys via headers
  try {
    const url = forceRefresh ? '/api/news/live?refresh=true' : '/api/news/live';
    const headers: Record<string, string> = {};
    if (rapidApiKey) headers['x-rapidapi-key'] = rapidApiKey;
    if (finnhubKey) headers['x-finnhub-token'] = finnhubKey;
    if (marketauxKey) headers['x-marketaux-token'] = marketauxKey;
    if (alphaVantageKey) headers['x-alphavantage-token'] = alphaVantageKey;
    if (guardianKey) headers['x-guardian-token'] = guardianKey;

    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.articles) && data.articles.length > 0) {
        return data.articles;
      }
    }
  } catch (err) {
    console.warn('Server news proxy fetch error, attempting direct client provider fallbacks:', err);
  }

  const directArticles: UnifiedNewsArticle[] = [];

  // 2. Direct Marketaux Integration
  if (marketauxKey) {
    try {
      const mRes = await fetch(`https://api.marketaux.com/v1/news/all?api_token=${marketauxKey}&language=en&filter_entities=true&limit=8`);
      if (mRes.ok) {
        const data = await mRes.json();
        if (Array.isArray(data?.data)) {
          data.data.forEach((item: any) => {
            const sentimentScore = item.entities?.[0]?.sentiment_score ?? 0;
            const sentiment = sentimentScore > 0.15 ? 'Bullish' : sentimentScore < -0.15 ? 'Bearish' : 'Neutral';
            directArticles.push({
              id: `marketaux-${item.uuid || Date.now()}`,
              title: item.title,
              source: item.source ? `Marketaux • ${item.source}` : 'Marketaux',
              category: 'Market Sentiment',
              sentiment,
              date: item.published_at || new Date().toISOString(),
              readTime: '3 min read',
              url: item.url || 'https://marketaux.com',
              summary: item.description || item.snippet || item.title,
              sectorTags: ['Marketaux', 'Market Sentiment', 'US Equities'],
              provider: 'Marketaux'
            });
          });
        }
      }
    } catch (mErr) {
      console.warn('Direct Marketaux fetch fallback:', mErr);
    }
  }

  // 3. Direct Alpha Vantage News & Sentiment Integration
  if (alphaVantageKey) {
    try {
      const avRes = await fetch(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=economy_macro,financial_markets,technology&apikey=${alphaVantageKey}`);
      if (avRes.ok) {
        const data = await avRes.json();
        if (Array.isArray(data?.feed)) {
          data.feed.slice(0, 8).forEach((item: any, idx: number) => {
            const sentLabel = (item.overall_sentiment_label || '').toLowerCase();
            const sentiment = sentLabel.includes('bullish') ? 'Bullish' : sentLabel.includes('bearish') ? 'Bearish' : 'Neutral';
            directArticles.push({
              id: `av-${idx}-${Date.now()}`,
              title: item.title,
              source: item.source ? `Alpha Vantage • ${item.source}` : 'Alpha Vantage',
              category: 'Global Macro',
              sentiment,
              date: item.time_published ? new Date(item.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6Z')).toISOString() : new Date().toISOString(),
              readTime: '4 min read',
              url: item.url || 'https://alphavantage.co',
              summary: item.summary || item.title,
              sectorTags: ['Alpha Vantage', 'Global Macro', 'Sectors & Equities'],
              provider: 'Alpha Vantage'
            });
          });
        }
      }
    } catch (avErr) {
      console.warn('Direct Alpha Vantage fetch fallback:', avErr);
    }
  }

  // 4. Direct The Guardian Open Platform Integration
  if (guardianKey) {
    try {
      const gRes = await fetch(`https://content.guardianapis.com/search?section=business|money&show-fields=headline,trailText,byline&api-key=${guardianKey}`);
      if (gRes.ok) {
        const data = await gRes.json();
        const results = data?.response?.results || [];
        if (Array.isArray(results)) {
          results.slice(0, 8).forEach((item: any) => {
            const title = item.fields?.headline || item.webTitle;
            const summary = item.fields?.trailText?.replace(/<[^>]*>?/gm, '') || title;
            directArticles.push({
              id: `guardian-${item.id || Date.now()}`,
              title,
              source: 'The Guardian',
              category: 'Sectors & Equities',
              sentiment: 'Neutral',
              date: item.webPublicationDate || new Date().toISOString(),
              readTime: '4 min read',
              url: item.webUrl || 'https://theguardian.com/business',
              summary,
              sectorTags: ['The Guardian', 'Global Markets', 'Sectors & Equities'],
              provider: 'The Guardian'
            });
          });
        }
      }
    } catch (gErr) {
      console.warn('Direct The Guardian fetch fallback:', gErr);
    }
  }

  // 5. Direct Finnhub Integration
  if (finnhubKey) {
    try {
      const finnhubRes = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`);
      if (finnhubRes.ok) {
        const items = await finnhubRes.json();
        if (Array.isArray(items) && items.length > 0) {
          items.slice(0, 10).forEach((item: any) => {
            directArticles.push({
              id: `finnhub-${item.id || Date.now()}`,
              title: item.headline || 'Market Update',
              source: item.source ? `Finnhub • ${item.source}` : 'Finnhub',
              category: 'US Equities',
              sentiment: 'Neutral',
              date: new Date(item.datetime ? item.datetime * 1000 : Date.now()).toISOString(),
              readTime: '3 min read',
              url: item.url || 'https://finnhub.io',
              summary: item.summary || item.headline || '',
              sectorTags: ['Finnhub', 'US Equities', 'Global Markets'],
              provider: 'Finnhub'
            });
          });
        }
      }
    } catch (finnhubErr) {
      console.warn('Direct Finnhub fetch failed:', finnhubErr);
    }
  }

  // Sort direct articles chronologically
  directArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return directArticles;
}
