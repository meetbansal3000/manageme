// Component: Career Vault Search & Sector Filters

import React from 'react';
import { Search, Filter, Plus, Briefcase } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

export interface JobFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  sectors: string[];
  onAddNew?: () => void;
  stats?: {
    total: number;
    applied: number;
    interviews: number;
    offers: number;
  };
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedSector,
  onSectorChange,
  sectors,
  onAddNew,
  stats
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search firms, roles, notes..."
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <select
              value={selectedSector}
              onChange={(e) => onSectorChange(e.target.value)}
              className="w-full bg-[#110D26]/80 text-white border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#0052FF] appearance-none cursor-pointer"
            >
              <option value="ALL">All Sectors</option>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {onAddNew && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAddNew}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add App
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Total Pipeline</p>
            <p className="text-lg font-bold text-white mt-0.5">{stats.total}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-[10px] font-mono text-blue-400 uppercase">Applied</p>
            <p className="text-lg font-bold text-blue-300 mt-0.5">{stats.applied}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-[10px] font-mono text-purple-400 uppercase">Interviews</p>
            <p className="text-lg font-bold text-purple-300 mt-0.5">{stats.interviews}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] font-mono text-emerald-400 uppercase">Offers</p>
            <p className="text-lg font-bold text-emerald-300 mt-0.5">{stats.offers}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFilters;
