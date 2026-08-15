import { useState, useEffect, useCallback } from 'react';
import { supabase, getSupabaseUserId } from '../lib/supabase';

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  changePercent?: number;
  assetClass?: string;
  dateAdded?: string;
}

const STORAGE_KEY = 'manageme_watchlist';

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { id: 'w_1', symbol: 'AAPL', name: 'Apple Inc.', price: 232.50, change: +1.85, changePercent: 0.80, assetClass: 'Stock' },
  { id: 'w_2', symbol: 'NVDA', name: 'NVIDIA Corp', price: 128.90, change: +3.40, changePercent: 2.71, assetClass: 'Stock' },
  { id: 'w_3', symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 561.20, change: +0.45, changePercent: 0.08, assetClass: 'ETF' },
  { id: 'w_4', symbol: 'BTC-USD', name: 'Bitcoin / USD', price: 62450, change: +1200, changePercent: 1.96, assetClass: 'Crypto' }
];

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load watchlist from localStorage:', e);
    }
    return DEFAULT_WATCHLIST;
  });
  const [loading, setLoading] = useState(true);

  // Load from Supabase if authenticated, else fallback to localStorage
  const loadWatchlist = useCallback(async () => {
    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        const { data, error } = await supabase
          .from('watchlists')
          .select('*')
          .order('id', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: WatchlistItem[] = data.map(w => ({
            id: String(w.id),
            symbol: w.symbol || '',
            name: w.name || w.symbol || '',
            price: Number(w.price) || 0,
            change: Number(w.change) || 0,
            changePercent: Number(w.change_percent || w.changePercent) || 0,
            assetClass: w.asset_class || w.assetClass || 'Stock',
            dateAdded: w.created_at || w.dateAdded || new Date().toISOString(),
          }));
          setWatchlist(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
      }
    } catch (err) {
      console.warn('Supabase watchlist load error, fallback to localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  // Add or update item
  const addToWatchlist = async (item: Omit<WatchlistItem, 'id'> & { id?: string }) => {
    const itemId = item.id || `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullItem: WatchlistItem = {
      ...item,
      id: itemId,
      dateAdded: item.dateAdded || new Date().toISOString(),
    };

    const updated = [fullItem, ...watchlist.filter(w => w.id !== itemId)];
    setWatchlist(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('watchlists').upsert({
          id: fullItem.id,
          user_id: userId,
          symbol: fullItem.symbol,
          name: fullItem.name,
          price: fullItem.price || 0,
          change: fullItem.change || 0,
          change_percent: fullItem.changePercent || 0,
          asset_class: fullItem.assetClass || 'Stock',
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Failed to persist watchlist item to Supabase:', err);
    }
  };

  const removeFromWatchlist = async (id: string) => {
    const updated = watchlist.filter(w => w.id !== id);
    setWatchlist(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('watchlists').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('Failed to remove item from Supabase watchlist:', err);
    }
  };

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    refreshWatchlist: loadWatchlist,
  };
}
