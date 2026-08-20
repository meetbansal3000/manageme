import { useState, useEffect, useCallback } from 'react';
import { supabase, getSupabaseUserId } from '../lib/supabase';
import { VehicleCost } from '../types';

const STORAGE_KEY = 'manageme_vehicle_costs';

const DEFAULT_VEHICLES: VehicleCost[] = [
  {
    id: 'veh_1',
    vehicleName: 'Audi A4 Avant',
    purchasePrice: 18000,
    monthlyFinance: 250,
    insurance: 80,
    fuel: 120,
    maintenance: 25,
    currency: '£',
  },
];

export function useVehicleCosts() {
  const [vehicles, setVehicles] = useState<VehicleCost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load vehicle costs from localStorage:', e);
    }
    return DEFAULT_VEHICLES;
  });

  const [activeVehicleId, setActiveVehicleId] = useState<string>(() => {
    return vehicles[0]?.id || 'veh_1';
  });

  const [loading, setLoading] = useState(true);

  const loadVehicles = useCallback(async () => {
    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        const { data, error } = await supabase
          .from('vehicle_costs')
          .select('*')
          .eq('user_id', userId)
          .order('id', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: VehicleCost[] = data.map(v => ({
            id: String(v.id),
            vehicleName: v.vehicle_name || v.vehicleName || 'Target Vehicle',
            purchasePrice: Number(v.purchase_price || v.purchasePrice || 0),
            monthlyFinance: Number(v.monthly_finance || v.monthlyFinance || 0),
            insurance: Number(v.insurance || 0),
            fuel: Number(v.fuel || 0),
            maintenance: Number(v.maintenance || v.servicing || 0),
            currency: v.currency || '£',
          }));
          setVehicles(mapped);
          if (mapped.length > 0) setActiveVehicleId(mapped[0].id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
      }
    } catch (err) {
      console.warn('Supabase vehicle costs load error, fallback to localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const addVehicle = async (newVeh: Omit<VehicleCost, 'id'> & { id?: string }) => {
    const vehId = newVeh.id || `veh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullVeh: VehicleCost = { ...newVeh, id: vehId };

    const updated = [...vehicles, fullVeh];
    setVehicles(updated);
    setActiveVehicleId(vehId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('vehicle_costs').upsert({
          id: fullVeh.id,
          user_id: userId,
          vehicle_name: fullVeh.vehicleName,
          purchase_price: fullVeh.purchasePrice,
          monthly_finance: fullVeh.monthlyFinance,
          insurance: fullVeh.insurance,
          fuel: fullVeh.fuel,
          maintenance: fullVeh.maintenance,
          currency: fullVeh.currency,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Failed to persist vehicle cost to Supabase:', err);
    }
  };

  const updateVehicle = async (id: string, fields: Partial<VehicleCost>) => {
    let updatedVeh: VehicleCost | undefined;
    const updated = vehicles.map(v => {
      if (v.id === id) {
        updatedVeh = { ...v, ...fields };
        return updatedVeh;
      }
      return v;
    });

    setVehicles(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (updatedVeh) {
      try {
        const userId = await getSupabaseUserId();
        if (userId) {
          await supabase.from('vehicle_costs').upsert({
            id: updatedVeh.id,
            user_id: userId,
            vehicle_name: updatedVeh.vehicleName,
            purchase_price: updatedVeh.purchasePrice,
            monthly_finance: updatedVeh.monthlyFinance,
            insurance: updatedVeh.insurance,
            fuel: updatedVeh.fuel,
            maintenance: updatedVeh.maintenance,
            currency: updatedVeh.currency,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Failed to sync vehicle update to Supabase:', err);
      }
    }
  };

  const deleteVehicle = async (id: string) => {
    const updated = vehicles.filter(v => v.id !== id);
    setVehicles(updated);
    if (activeVehicleId === id && updated.length > 0) {
      setActiveVehicleId(updated[0].id);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase
          .from('vehicle_costs')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Failed to delete vehicle cost from Supabase:', err);
    }
  };

  const resetToDefault = async () => {
    setVehicles(DEFAULT_VEHICLES);
    setActiveVehicleId('veh_1');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VEHICLES));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0] || DEFAULT_VEHICLES[0];

  return {
    vehicles,
    activeVehicle,
    activeVehicleId,
    setActiveVehicleId,
    loading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    resetToDefault,
    refreshVehicles: loadVehicles,
  };
}
