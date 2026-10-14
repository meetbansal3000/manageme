
import { validateAndCalculatePaperTrade } from '../server/security';
import { fetchLiveQuote, fetchMultipleLiveQuotes } from '../server/marketQuoteService';

export default async function handler(req: any, res: any) {
  // Strict CORS for web and Vercel clients
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
      const { symbol, orderSide, orderMode, orderType, quantity, limitPrice, triggerPrice, cashBalance, positions } = req.body || {};
      const result = validateAndCalculatePaperTrade({
        symbol: String(symbol || ''),
        orderSide,
        orderMode,
        orderType,
        quantity: Number(quantity),
        limitPrice: limitPrice ? Number(limitPrice) : undefined,
        triggerPrice: triggerPrice ? Number(triggerPrice) : undefined,
        cashBalance: Number(cashBalance || 0),
        positions: Array.isArray(positions) ? positions : []
      });

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
