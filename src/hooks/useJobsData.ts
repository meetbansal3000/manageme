// Hook: Career Vault & Graduate Scheme Pipeline State & Metrics

import { useMemo } from 'react';
import { useJobs } from './useJobs';
import { GraduateScheme, TrackerStatus } from '../types';

export function useJobsData(schemes: GraduateScheme[] = [], searchQuery: string = '', selectedSector: string = 'ALL') {
  const { jobs, loading, addJob, updateJob, deleteJob } = useJobs();

  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      const matchSearch = !searchQuery || 
        scheme.firm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.notes.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchSector = selectedSector === 'ALL' || scheme.sector === selectedSector;

      return matchSearch && matchSector;
    });
  }, [schemes, searchQuery, selectedSector]);

  const stats = useMemo(() => {
    const total = schemes.length;
    const applied = schemes.filter(s => s.status.includes('Applied')).length;
    const interviews = schemes.filter(s => s.status.includes('Interview') || s.status.includes('Assessment')).length;
    const offers = schemes.filter(s => s.status.includes('Offer')).length;
    const rejected = schemes.filter(s => s.status.includes('Rejected')).length;
    
    return {
      total,
      applied,
      interviews,
      offers,
      rejected,
      conversionRate: applied > 0 ? Math.round((offers / applied) * 100) : 0
    };
  }, [schemes]);

  return {
    schemes: filteredSchemes,
    allSchemes: schemes,
    jobs,
    loading,
    stats,
    addJob,
    updateJob,
    deleteJob
  };
}

export { useJobs };
export default useJobsData;
