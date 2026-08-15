import React from 'react';
import { Search } from 'lucide-react';
import { PriorityTrackerItem, GraduateScheme, PartTimeRole } from '../types';

interface Props {
  priorityItems: PriorityTrackerItem[];
  gradSchemes: GraduateScheme[];
  partTimeRoles: PartTimeRole[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  sectorsList: string[];
}

export const StatsBar: React.FC<Props> = ({
  priorityItems = [],
  gradSchemes = [],
  partTimeRoles = [],
  searchQuery,
  setSearchQuery,
  selectedSector,
  setSelectedSector,
  sectorsList
}) => {
  const safeGrad = gradSchemes || [];
  const safePT = partTimeRoles || [];
  const safePriority = priorityItems || [];

  const totalOpportunities = safeGrad.length + safePT.length;
  const activeApplied = safePriority.filter(p => p.status !== 'Not Applied' && p.status !== 'Rejected' && p.status !== 'Rejected ✕').length;
  const testsACs = safePriority.filter(p => ['Online Tests', 'Video Interview', 'Assessment Centre', 'Final Interview'].includes(p.status)).length;
  const offers = safePriority.filter(p => p.status === 'Offer 🎉').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <div className="glass-panel border border-[var(--border)] rounded-2xl flex flex-col md:flex-row items-center justify-between p-2 gap-4">
        
        {/* Unified Metrics */}
        <div className="flex items-center gap-4 px-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Opportunities</span>
            <span className="text-sm font-bold text-[#f5f5f7]">{totalOpportunities} <span className="text-xs font-normal text-[var(--text-secondary)]">({safeGrad.length} Grad / {safePT.length} PT)</span></span>
          </div>
          <div className="w-[1px] h-8 bg-[rgba(255,255,255,0.1)] shrink-0"></div>
          
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Active Applied</span>
            <span className="text-sm font-bold text-[#f5f5f7]">{activeApplied} <span className="text-xs font-normal text-[var(--text-secondary)]">/ {safePriority.length} Tracked</span></span>
          </div>
          <div className="w-[1px] h-8 bg-[rgba(255,255,255,0.1)] shrink-0"></div>
          
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Tests & ACs</span>
            <span className="text-sm font-bold text-[#f5f5f7]">{testsACs} <span className="text-xs font-normal text-[var(--text-secondary)]">In Pipeline</span></span>
          </div>
          <div className="w-[1px] h-8 bg-[rgba(255,255,255,0.1)] shrink-0"></div>
          
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Offers Goal</span>
            <span className="text-sm font-bold text-[#f5f5f7]">{offers} <span className="text-xs font-normal text-[var(--text-secondary)]">(Target: 1+ Tier 1)</span></span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.1)] pt-2 md:pt-0 md:pl-4 px-2 shrink-0">
          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Search firms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="apple-input bg-[#1c1c1e] border-transparent text-xs py-1.5 pl-8 pr-3 w-full"
            />
          </div>
          <select 
            className="apple-input bg-[#1c1c1e] border-transparent text-xs py-1.5 px-3 md:w-32"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
          >
            <option value="ALL">All Sectors</option>
            {sectorsList.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};
