import { useState, useEffect, useCallback } from 'react';
import { supabase, getSupabaseUserId } from '../lib/supabase';
import { Subscription } from '../types';

const STORAGE_KEY = 'manageme_subscriptions';

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_1',
    name: 'Adobe Creative Cloud',
    cost: 49.99,
    currency: '£',
    billingCycle: 'Monthly',
    renewalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'sub_2',
    name: 'Spotify Premium',
    cost: 10.99,
    currency: '£',
    billingCycle: 'Monthly',
    renewalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'sub_3',
    name: 'GitHub Copilot',
    cost: 10.00,
    currency: '$',
    billingCycle: 'Monthly',
    renewalDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'sub_4',
    name: 'ChatGPT Plus',
    cost: 20.00,
    currency: '$',
    billingCycle: 'Monthly',
    renewalDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load subscriptions from localStorage:', e);
    }
    return DEFAULT_SUBSCRIPTIONS;
  });
  const [loading, setLoading] = useState(true);

  const loadSubscriptions = useCallback(async () => {
    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .order('id', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: Subscription[] = data.map(item => ({
            id: String(item.id),
            name: item.name || '',
            cost: Number(item.cost || item.amount || 0),
            currency: item.currency || '£',
            billingCycle: (item.billing_cycle || item.billingCycle || 'Monthly') as 'Monthly' | 'Yearly' | 'One-time',
            renewalDate: item.renewal_date || item.renewalDate || new Date().toISOString().split('T')[0],
            category: item.category || 'General',
          }));
          setSubscriptions(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
      }
    } catch (err) {
      console.warn('Supabase subscriptions load error, fallback to localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const addSubscription = async (newSubData: Omit<Subscription, 'id'> & { id?: string }) => {
    const subId = newSubData.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullSub: Subscription = {
      ...newSubData,
      id: subId,
    };

    const updated = [fullSub, ...subscriptions.filter(s => s.id !== subId)];
    setSubscriptions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('subscriptions').upsert({
          id: fullSub.id,
          user_id: userId,
          name: fullSub.name,
          cost: fullSub.cost,
          currency: fullSub.currency,
          billing_cycle: fullSub.billingCycle,
          renewal_date: fullSub.renewalDate,
          category: fullSub.category || 'General',
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Failed to persist subscription to Supabase:', err);
    }
  };

  const updateSubscription = async (id: string, fields: Partial<Subscription>) => {
    let updatedSub: Subscription | undefined;
    const updated = subscriptions.map(s => {
      if (s.id === id) {
        updatedSub = { ...s, ...fields };
        return updatedSub;
      }
      return s;
    });

    setSubscriptions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (updatedSub) {
      try {
        const userId = await getSupabaseUserId();
        if (userId) {
          await supabase.from('subscriptions').upsert({
            id: updatedSub.id,
            user_id: userId,
            name: updatedSub.name,
            cost: updatedSub.cost,
            currency: updatedSub.currency,
            billing_cycle: updatedSub.billingCycle,
            renewal_date: updatedSub.renewalDate,
            category: updatedSub.category || 'General',
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Failed to sync updated subscription to Supabase:', err);
      }
    }
  };

  const deleteSubscription = async (id: string) => {
    const updated = subscriptions.filter(s => s.id !== id);
    setSubscriptions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('subscriptions').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('Failed to delete subscription from Supabase:', err);
    }
  };

  return {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refreshSubscriptions: loadSubscriptions,
  };
}
