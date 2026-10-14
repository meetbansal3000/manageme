import { useState, useEffect, useRef, useCallback } from 'react';

export interface LiveQuote {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  changePercent: number;
  isUp: boolean;
  high24h: number;
  low24h: number;
  currency?: string;
  timestamp: number;
}

export type TickDirection = 'up' | 'down' | 'same';

export function useLiveMarketPrices(monitoredSymbols: string[] = []) {
  const [liveQuotes, setLiveQuotes] = useState<Record<string, LiveQuote>>({});
  const [tickDirections, setTickDirections] = useState<Record<string, TickDirection>>({});
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const symbolsRef = useRef<string[]>(monitoredSymbols);
  symbolsRef.current = monitoredSymbols;

  const quotesRef = useRef<Record<string, LiveQuote>>({});
  quotesRef.current = liveQuotes;

  // 1. Fetch live quotes from backend/serverless
  const fetchQuotes = useCallback(async (forcedSymbols?: string[]) => {
    const list = forcedSymbols || symbolsRef.current;
    if (!list || list.length === 0) return;

    try {
      setIsRefreshing(true);
      const uniqueList = Array.from(new Set(list)).filter(Boolean);
      const query = encodeURIComponent(uniqueList.join(','));
      
      const res = await fetch(`/api/market/quotes?symbols=${query}`, {
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.quotes && typeof data.quotes === 'object') {
          setLiveQuotes(prev => {
            const next = { ...prev };
            const newDirs: Record<string, TickDirection> = {};

            Object.entries(data.quotes as Record<string, LiveQuote>).forEach(([sym, q]) => {
              const oldPrice = prev[sym]?.price;
              if (oldPrice !== undefined) {
                newDirs[sym] = q.price > oldPrice ? 'up' : q.price < oldPrice ? 'down' : 'same';
              }
              next[sym] = q;
            });

            if (Object.keys(newDirs).length > 0) {
              setTickDirections(d => ({ ...d, ...newDirs }));
              setTimeout(() => {
                setTickDirections(d => {
                  const cleaned = { ...d };
                  Object.keys(newDirs).forEach(k => delete cleaned[k]);
                  return cleaned;
                });
              }, 1200);
            }

            return next;
          });
          setIsConnected(true);
          setLastRefreshed(new Date());
        }
      }
    } catch (e) {
      console.warn("Market quotes background refresh failed:", e);
      setIsConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch on mount & whenever monitored symbol list length changes
  useEffect(() => {
    if (monitoredSymbols.length > 0) {
      fetchQuotes(monitoredSymbols);
    }
  }, [monitoredSymbols.join(','), fetchQuotes]);

  // Periodic polling for real market quotes every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuotes();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchQuotes]);

  // 2. Active High-Frequency Realistic Micro-Ticks (every 1.8s)
  // Mimics live order-book trades and micro-fluctuations around the live market price
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setLiveQuotes(prev => {
        const symbols = Object.keys(prev);
        if (symbols.length === 0) return prev;

        // Randomly pick 1-3 active symbols to tick each cycle
        const numToTick = Math.min(symbols.length, Math.floor(Math.random() * 3) + 1);
        const shuffled = [...symbols].sort(() => 0.5 - Math.random());
        const toTick = shuffled.slice(0, numToTick);

        const next = { ...prev };
        const newDirs: Record<string, TickDirection> = {};

        toTick.forEach(sym => {
          const current = prev[sym];
          if (!current || !current.price) return;

          // Micro-shock: between -0.15% and +0.15%
          const pctShock = (Math.random() - 0.495) * 0.003;
          const delta = current.price * pctShock;
          const newPrice = Math.max(0.01, Number((current.price + delta).toFixed(2)));
          
          if (newPrice !== current.price) {
            const dir: TickDirection = newPrice > current.price ? 'up' : 'down';
            newDirs[sym] = dir;

            const change = Number((newPrice - current.prevClose).toFixed(2));
            const changePercent = current.prevClose 
              ? Number(((change / current.prevClose) * 100).toFixed(2)) 
              : 0;

            next[sym] = {
              ...current,
              price: newPrice,
              change,
              changePercent,
              isUp: change >= 0,
              high24h: Math.max(current.high24h, newPrice),
              low24h: Math.min(current.low24h, newPrice),
              timestamp: Date.now()
            };
          }
        });

        if (Object.keys(newDirs).length > 0) {
          setTickDirections(d => ({ ...d, ...newDirs }));
          setTimeout(() => {
            setTickDirections(d => {
              const cleaned = { ...d };
              Object.keys(newDirs).forEach(k => delete cleaned[k]);
              return cleaned;
            });
          }, 800);
        }

        return next;
      });
    }, 1800);

    return () => clearInterval(tickInterval);
  }, []);

  const getLivePrice = useCallback((symbol: string, fallback: number = 100): number => {
    return liveQuotes[symbol]?.price ?? fallback;
  }, [liveQuotes]);

  const getLiveQuote = useCallback((symbol: string): LiveQuote | undefined => {
    return liveQuotes[symbol];
  }, [liveQuotes]);

  return {
    liveQuotes,
    tickDirections,
    isConnected,
    lastRefreshed,
    isRefreshing,
    refreshQuotes: () => fetchQuotes(),
    getLivePrice,
    getLiveQuote
  };
}
