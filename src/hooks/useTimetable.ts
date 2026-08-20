import { useState, useEffect, useCallback } from 'react';
import { supabase, getSupabaseUserId } from '../lib/supabase';
import { UniClass } from '../types';

const STORAGE_KEY = 'manageme_timetables';

export function useTimetable() {
  const [classes, setClasses] = useState<UniClass[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load timetables from localStorage:', e);
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  // Load from Supabase if authenticated, else fallback to localStorage
  const loadTimetables = useCallback(async () => {
    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        const { data, error } = await supabase
          .from('timetables')
          .select('*')
          .eq('user_id', userId)
          .order('id', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: UniClass[] = data.map(item => ({
            id: String(item.id),
            moduleName: item.module_name || item.moduleName || '',
            type: item.type || 'Lecture',
            dayOfWeek: item.day_of_week || item.dayOfWeek || 'Monday',
            startTime: item.start_time || item.startTime || '',
            endTime: item.end_time || item.endTime || '',
            location: item.location || '',
            term: item.term || 'Michaelmas',
            timestamp: item.timestamp || Date.now(),
          }));
          setClasses(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
      }
    } catch (err) {
      console.warn('Supabase timetables load error, fallback to localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimetables();
  }, [loadTimetables]);

  // Persist class addition/update
  const addClass = async (newClassData: Omit<UniClass, 'id'> & { id?: string }) => {
    const classId = newClassData.id || `cls_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullClass: UniClass = { ...newClassData, id: classId };

    const updated = [fullClass, ...classes.filter(c => c.id !== classId)];
    setClasses(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Direct Supabase sync if logged in
    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('timetables').upsert({
          id: fullClass.id,
          user_id: userId,
          module_name: fullClass.moduleName,
          type: fullClass.type,
          day_of_week: fullClass.dayOfWeek,
          start_time: fullClass.startTime,
          end_time: fullClass.endTime,
          location: fullClass.location,
          term: fullClass.term,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Failed to persist timetable to Supabase:', err);
    }
  };

  const updateClass = async (id: string, fields: Partial<UniClass>) => {
    let updatedClass: UniClass | undefined;
    const updated = classes.map(c => {
      if (c.id === id) {
        updatedClass = { ...c, ...fields };
        return updatedClass;
      }
      return c;
    });

    setClasses(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (updatedClass) {
      try {
        const userId = await getSupabaseUserId();
        if (userId) {
          await supabase.from('timetables').upsert({
            id: updatedClass.id,
            user_id: userId,
            module_name: updatedClass.moduleName,
            type: updatedClass.type,
            day_of_week: updatedClass.dayOfWeek,
            start_time: updatedClass.startTime,
            end_time: updatedClass.endTime,
            location: updatedClass.location,
            term: updatedClass.term,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Failed to sync updated timetable class to Supabase:', err);
      }
    }
  };

  const deleteClass = async (id: string) => {
    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase
          .from('timetables')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Failed to delete timetable class from Supabase:', err);
    }
  };

  return {
    classes,
    loading,
    addClass,
    updateClass,
    deleteClass,
    refreshTimetables: loadTimetables,
  };
}
