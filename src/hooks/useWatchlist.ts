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
  currency?: string;
  region?: 'US' | 'India' | 'UK' | 'EU' | 'Singapore' | string;
  exchange?: string;
  volatility?: number | string;
  dateAdded?: string;
}

const STORAGE_KEY = 'manageme_watchlist';

export const DEMO_WATCHLIST: WatchlistItem[] = [
  { id: 'w_1', symbol: 'AAPL', name: 'Apple Inc.', price: 232.80, change: +1.95, changePercent: 0.84, currency: '$', region: 'US', exchange: 'NASDAQ', assetClass: 'Stock' },
  { id: 'w_2', symbol: 'NVDA', name: 'NVIDIA Corp', price: 138.45, change: +4.15, changePercent: 3.09, currency: '$', region: 'US', exchange: 'NASDAQ', assetClass: 'Stock' },
  { id: 'w_3', symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2980.50, change: +35.40, changePercent: 1.20, currency: '₹', region: 'India', exchange: 'NSE', assetClass: 'Stock' },
  { id: 'w_4', symbol: 'HSBA.L', name: 'HSBC Holdings plc', price: 692.40, change: +4.20, changePercent: 0.61, currency: '£', region: 'UK', exchange: 'LSE', assetClass: 'Stock' },
  { id: 'w_5', symbol: 'ASML.AS', name: 'ASML Holding NV', price: 792.60, change: +12.40, changePercent: 1.59, currency: '€', region: 'EU', exchange: 'Euronext', assetClass: 'Stock' },
  { id: 'w_6', symbol: 'D05.SI', name: 'DBS Group Holdings', price: 38.60, change: +0.45, changePercent: 1.18, currency: 'S$', region: 'Singapore', exchange: 'SGX', assetClass: 'Stock' }
];

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const isGuest = localStorage.getItem('manageme_guest_session') === 'true';
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      if (isGuest) return DEMO_WATCHLIST;
    } catch (e) {
      console.warn('Failed to load watchlist from localStorage:', e);
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  // Load from Supabase if authenticated, else fallback to localStorage or clean slate
  const loadWatchlist = useCallback(async () => {
    try {
      const isGuest = localStorage.getItem('manageme_guest_session') === 'true';
      const userId = await getSupabaseUserId();
      
      if (userId && !isGuest) {
        const { data, error } = await supabase
          .from('watchlists')
          .select('*')
          .eq('user_id', userId)
          .order('id', { ascending: false });

        if (!error) {
          const mapped: WatchlistItem[] = (data || []).map(w => ({
            id: String(w.id),
            symbol: w.symbol || '',
            name: w.name || w.symbol || '',
            price: Number(w.price) || 0,
            change: Number(w.change) || 0,
            changePercent: Number(w.change_percent || w.changePercent) || 0,
            assetClass: w.asset_class || w.assetClass || 'Stock',
            currency: w.currency || '$',
            region: w.region || 'US',
            exchange: w.exchange || 'NASDAQ',
            dateAdded: w.created_at || w.dateAdded || new Date().toISOString(),
          }));
          setWatchlist(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
      } else if (isGuest) {
        setWatchlist(DEMO_WATCHLIST);
      }
    } catch (err) {
      console.warn('Supabase watchlist load notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  // Add or update item
  const addToWatchlist = async (item: Omit<WatchlistItem, 'id'> & { id?: string }) => {
    const itemId = item.id || `w_${item.symbol.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    const fullItem: WatchlistItem = {
      ...item,
      id: itemId,
      currency: item.currency || '$',
      region: item.region || 'US',
      dateAdded: item.dateAdded || new Date().toISOString(),
    };

    const updated = [fullItem, ...(watchlist || []).filter(w => w.symbol !== item.symbol)];
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
          currency: fullItem.currency || '$',
          region: fullItem.region || 'US',
          exchange: fullItem.exchange || 'NASDAQ',
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Failed to persist watchlist item to Supabase:', err);
    }
  };

  const removeFromWatchlist = async (id: string) => {
    const updated = (watchlist || []).filter(w => w.id !== id);
    setWatchlist(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase
          .from('watchlists')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
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
