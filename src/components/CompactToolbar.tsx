import React, { useState } from 'react';
import { Search, X, Briefcase, Clock, DollarSign, Activity } from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';

interface CompactToolbarProps {
  userData: UserTrackerData;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  sectorsList: string[];
}

export const CompactToolbar: React.FC<CompactToolbarProps> = ({
  userData,
  searchQuery,
  setSearchQuery,
  selectedSector,
  setSelectedSector,
  sectorsList
}) => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  const oppsCount = (userData.gradSchemes?.length || 0) + (userData.partTimeRoles?.length || 0);
  const totalHours = (userData.workShifts || []).reduce((sum, s) => sum + s.hours, 0);
  const earnings = totalHours * (userData.hourlyRate || 0);
  const totalExpenses = (userData.expenses || []).reduce((sum, e) => sum + e.amount, 0);
  const netCashFlow = earnings - totalExpenses;
  
  const currencySymbol = userData.currency === 'USD' ? '$' : userData.currency === 'INR' ? '₹' : '£';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 mt-6">
      <div className="glass-panel border border-[var(--border)] rounded-full px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-4 relative pr-10">
        <button onClick={() => setIsVisible(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(128,128,128,0.1)] rounded-full transition-colors"><X className="w-4 h-4" /></button>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              id="globalSearchInput"
              type="text"
              placeholder="Search target firms... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[rgba(128,128,128,0.1)] border border-transparent focus:border-[var(--accent)] text-[var(--text-primary)] text-sm rounded-full pl-9 pr-4 py-1.5 outline-none transition-all"
            />
          </div>
          
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-[rgba(128,128,128,0.1)] border border-transparent text-[var(--text-primary)] text-sm rounded-full px-4 py-1.5 outline-none focus:border-[var(--accent)] cursor-pointer hidden sm:block"
          >
            {sectorsList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold overflow-x-auto hide-scrollbar w-full md:w-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0 text-[var(--text-secondary)]">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Opps: <span className="text-[var(--text-primary)]">[{oppsCount}]</span></span>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0 text-[var(--text-secondary)]">
            <Clock className="w-3.5 h-3.5" />
            <span>Work: <span className="text-[var(--text-primary)]">[{totalHours} / 20 hrs]</span></span>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0 text-[var(--text-secondary)]">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Earnings: <span className="text-[var(--text-primary)]">[{currencySymbol}{earnings.toFixed(2)}]</span></span>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0 text-[var(--text-secondary)]">
            <Activity className="w-3.5 h-3.5" />
            <span>Net Flow: <span className={netCashFlow >= 0 ? "text-emerald-500" : "text-red-500"}>[{currencySymbol}{netCashFlow.toFixed(2)}]</span></span>
          </div>
        </div>

      </div>
    </div>
  );
};
