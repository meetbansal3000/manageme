import { useState, useEffect, useCallback } from 'react';
import { supabase, getSupabaseUserId } from '../lib/supabase';
import { JobApplication } from '../types';

const STORAGE_KEY = 'manageme_job_applications';

export function useJobs() {
  const [jobs, setJobs] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load job applications from localStorage:', e);
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  // Load from Supabase if authenticated, else fallback to localStorage
  const loadJobs = useCallback(async () => {
    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        const { data, error } = await supabase
          .from('job_applications')
          .select('*')
          .order('date_added', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: JobApplication[] = data.map(item => ({
            id: String(item.id),
            title: item.title || '',
            company: item.company || '',
            location: item.location || '',
            salary: item.salary || '',
            platform: item.platform || 'LinkedIn',
            status: item.status || 'Potential',
            dateAdded: item.date_added || item.dateAdded || new Date().toISOString(),
            deadline: item.deadline || undefined,
          }));
          setJobs(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
      }
    } catch (err) {
      console.warn('Supabase job applications load error, fallback to localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Persist job addition or update
  const addJob = async (newJobData: Omit<JobApplication, 'id'> & { id?: string }) => {
    const jobId = newJobData.id || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullJob: JobApplication = {
      ...newJobData,
      id: jobId,
      dateAdded: newJobData.dateAdded || new Date().toISOString().split('T')[0],
    };

    const updated = [fullJob, ...jobs.filter(j => j.id !== jobId)];
    setJobs(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Direct Supabase sync if logged in
    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('job_applications').upsert({
          id: fullJob.id,
          user_id: userId,
          title: fullJob.title,
          company: fullJob.company,
          location: fullJob.location,
          salary: fullJob.salary,
          platform: fullJob.platform,
          status: fullJob.status,
          date_added: fullJob.dateAdded,
          deadline: fullJob.deadline || null,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Failed to persist job application to Supabase:', err);
    }
  };

  const updateJob = async (id: string, fields: Partial<JobApplication>) => {
    let updatedJob: JobApplication | undefined;
    const updated = jobs.map(j => {
      if (j.id === id) {
        updatedJob = { ...j, ...fields };
        return updatedJob;
      }
      return j;
    });

    setJobs(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (updatedJob) {
      try {
        const userId = await getSupabaseUserId();
        if (userId) {
          await supabase.from('job_applications').upsert({
            id: updatedJob.id,
            user_id: userId,
            title: updatedJob.title,
            company: updatedJob.company,
            location: updatedJob.location,
            salary: updatedJob.salary,
            platform: updatedJob.platform,
            status: updatedJob.status,
            date_added: updatedJob.dateAdded,
            deadline: updatedJob.deadline || null,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Failed to sync updated job application to Supabase:', err);
      }
    }
  };

  const deleteJob = async (id: string) => {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const userId = await getSupabaseUserId();
      if (userId) {
        await supabase.from('job_applications').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('Failed to delete job application from Supabase:', err);
    }
  };

  return {
    jobs,
    loading,
    addJob,
    updateJob,
    deleteJob,
    refreshJobs: loadJobs,
  };
}
