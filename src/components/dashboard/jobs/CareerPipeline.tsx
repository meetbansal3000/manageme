// Component: Career Pipeline Multi-View Orchestrator (Kanban & High-Density Table)

import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  Table as TableIcon, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Building2, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  ChevronRight,
  Eye,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { GraduateScheme, TrackerStatus } from '../../../types';
import { KanbanBoard } from './KanbanBoard';
import { JobDetailDrawer } from './JobDetailDrawer';
import { JobFilters } from './JobFilters';
import { AddJobModal } from './AddJobModal';
import { QuickAiModal } from './QuickAiModal';
import { TailorModal } from './TailorModal';
import { CalendarExportButton } from './CalendarExportButton';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { toast } from '../../ui/Toast';

export type PipelineViewMode = 'kanban' | 'table';
export type SortField = 'rank' | 'firm' | 'deadline' | 'salary' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface CareerPipelineProps {
  schemes: GraduateScheme[];
  onUpdateStatus?: (id: string, status: TrackerStatus) => void;
  onAddScheme?: (scheme: any) => void;
  onEditScheme?: (id: string, updated: Partial<GraduateScheme>) => void;
  onDeleteScheme?: (id: string) => void;
  searchQuery?: string;
  selectedSector?: string;
}

export const CareerPipeline: React.FC<CareerPipelineProps> = ({
  schemes,
  onUpdateStatus,
  onAddScheme,
  onEditScheme,
  onDeleteScheme,
  searchQuery: initialSearch = '',
  selectedSector: initialSector = 'ALL'
}) => {
  const [viewMode, setViewMode] = useState<PipelineViewMode>('kanban');
  const [search, setSearch] = useState(initialSearch);
  const [sector, setSector] = useState(initialSector);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedJob, setSelectedJob] = useState<GraduateScheme | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [quickAiJob, setQuickAiJob] = useState<GraduateScheme | null>(null);
  const [isQuickAiOpen, setIsQuickAiOpen] = useState(false);
  const [tailorJob, setTailorJob] = useState<GraduateScheme | null>(null);
  const [isTailorOpen, setIsTailorOpen] = useState(false);

  // Derive unique sectors for filter
  const availableSectors = useMemo(() => {
    const set = new Set(schemes.map(s => s.sector).filter(Boolean));
    return Array.from(set).sort();
  }, [schemes]);

  // Filtered & Sorted schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const matchSearch = !search || 
        s.firm.toLowerCase().includes(search.toLowerCase()) ||
        s.roleTitle.toLowerCase().includes(search.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()));

      const matchSector = sector === 'ALL' || s.sector === sector;

      return matchSearch && matchSector;
    });
  }, [schemes, search, sector]);

  const sortedSchemes = useMemo(() => {
    const list = [...filteredSchemes];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'firm') {
        comparison = a.firm.localeCompare(b.firm);
      } else if (sortField === 'deadline') {
        comparison = (a.appCloses || '').localeCompare(b.appCloses || '');
      } else if (sortField === 'salary') {
        comparison = (a.salary || '').localeCompare(b.salary || '');
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      } else {
        comparison = (a.rank || 0) - (b.rank || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredSchemes, sortField, sortOrder]);

  const stats = useMemo(() => {
    const total = schemes.length;
    const applied = schemes.filter(s => s.status.includes('Applied')).length;
    const interviews = schemes.filter(s => s.status.includes('Interview') || s.status.includes('Assessment')).length;
    const offers = schemes.filter(s => s.status.includes('Offer')).length;
    return { total, applied, interviews, offers };
  }, [schemes]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleUpdateStatus = (id: string, newStatus: TrackerStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(id, newStatus);
      toast.info(`Moved application to ${newStatus}`);
    }
  };

  const openDetail = (scheme: GraduateScheme) => {
    setSelectedJob(scheme);
    setIsDrawerOpen(true);
  };

  const getStatusVariant = (status: TrackerStatus): 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate' => {
    if (status.includes('Offer')) return 'emerald';
    if (status.includes('Interview') || status.includes('Assessment')) return 'purple';
    if (status.includes('Applied')) return 'blue';
    if (status.includes('Rejected')) return 'rose';
    if (status.includes('To Apply')) return 'amber';
    return 'slate';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0052FF]" />
            Career Vault & Graduate Schemes
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Active tracking pipeline across top UK investment banking, advisory, and asset management schemes.
          </p>
        </div>

        {/* View Switcher Pill Toggle */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#0052FF] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* Filters & Statistics Row */}
      <JobFilters
        searchQuery={search}
        onSearchChange={setSearch}
        selectedSector={sector}
        onSectorChange={setSector}
        sectors={availableSectors}
        onAddNew={() => setIsAddModalOpen(true)}
        stats={stats}
      />

      {/* Active View Container */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          schemes={sortedSchemes}
          onUpdateStatus={handleUpdateStatus}
          onEdit={openDetail}
          onDelete={onDeleteScheme}
          onQuickAi={(scheme) => {
            setQuickAiJob(scheme);
            setIsQuickAiOpen(true);
          }}
          onTailor={(scheme) => {
            setTailorJob(scheme);
            setIsTailorOpen(true);
          }}
        />
      ) : (
        /* High-Density Spreadsheet Table View */
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden shadow-card-base">
          <div className="overflow-x-auto custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-left text-xs text-slate-300 font-sans min-w-[880px] border-collapse">
              <thead className="bg-[#0c121e] border-b border-white/10 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th 
                    className="sticky left-0 bg-[#0c121e] z-20 shadow-[4px_0_12px_rgba(0,0,0,0.6)] p-3.5 min-w-[240px] cursor-pointer hover:text-white border-r border-white/5"
                    onClick={() => handleSort('firm')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Company & Role</span>
                      {sortField === 'firm' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th 
                    className="p-3.5 min-w-[140px] cursor-pointer hover:text-white"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Stage</span>
                      {sortField === 'status' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th 
                    className="p-3.5 min-w-[130px] whitespace-nowrap cursor-pointer hover:text-white"
                    onClick={() => handleSort('deadline')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Deadline</span>
                      {sortField === 'deadline' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th 
                    className="p-3.5 min-w-[140px] whitespace-nowrap cursor-pointer hover:text-white"
                    onClick={() => handleSort('salary')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Compensation</span>
                      {sortField === 'salary' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="p-3.5 min-w-[130px]">Sector</th>
                  <th className="p-3.5 min-w-[120px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedSchemes.map((scheme) => (
                  <tr
                    key={scheme.id}
                    onClick={() => openDetail(scheme)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="sticky left-0 bg-[#090d16] group-hover:bg-[#121927] transition-colors z-10 shadow-[4px_0_12px_rgba(0,0,0,0.6)] p-3.5 min-w-[240px] border-r border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 font-bold font-mono shrink-0">
                          {scheme.firm.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{scheme.firm}</p>
                          <p className="text-[11px] text-slate-400 truncate">{scheme.roleTitle}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 min-w-[140px] whitespace-nowrap">
                      <Badge variant={getStatusVariant(scheme.status)} dot>
                        {scheme.status}
                      </Badge>
                    </td>

                    <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap min-w-[130px]">
                      {scheme.appCloses || 'Rolling'}
                    </td>

                    <td className="p-3.5 font-mono text-white font-medium whitespace-nowrap min-w-[140px]">
                      {scheme.salary || 'Competitive'}
                      {scheme.bonus && <span className="text-emerald-400 text-[10px] ml-1">+{scheme.bonus}</span>}
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-400 min-w-[130px]">
                      {scheme.sector}
                    </td>

                    <td className="p-3.5 min-w-[140px] text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setTailorJob(scheme);
                            setIsTailorOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                          title="Tailor Cover Letter & CV Bullets"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setQuickAiJob(scheme);
                            setIsQuickAiOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                          title="Quick AI Outreach & Prep"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <CalendarExportButton
                          title={`[Deadline] ${scheme.firm} - ${scheme.roleTitle}`}
                          date={scheme.appCloses}
                          company={scheme.firm}
                          role={scheme.roleTitle}
                          portalUrl={scheme.applyVia}
                          notes={scheme.notes}
                          variant="icon"
                        />
                        <button
                          onClick={() => openDetail(scheme)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {scheme.applyVia && (
                          <a
                            href={scheme.applyVia}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0052FF] hover:bg-white/10 transition-colors"
                            title="Portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {onDeleteScheme && (
                          <button
                            onClick={() => onDeleteScheme(scheme.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {sortedSchemes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                      No graduate schemes found matching active filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Job Detail Drawer */}
      <JobDetailDrawer
        job={selectedJob}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateJob={(id, updated) => {
          if (onEditScheme) onEditScheme(id, updated);
          if (selectedJob && selectedJob.id === id) {
            setSelectedJob({ ...selectedJob, ...updated });
          }
        }}
        onDeleteJob={onDeleteScheme}
      />

      {/* Add Application via AI Modal */}
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(newJob) => {
          if (onAddScheme) onAddScheme(newJob);
        }}
      />

      {/* Quick AI Career Copilot Modal with Error Boundary */}
      <QuickAiModal
        isOpen={isQuickAiOpen}
        onClose={() => setIsQuickAiOpen(false)}
        job={quickAiJob}
      />

      {/* AI Cover Letter & CV Tailor Modal */}
      <TailorModal
        isOpen={isTailorOpen}
        onClose={() => setIsTailorOpen(false)}
        job={tailorJob}
      />
    </div>
  );
};

export default CareerPipeline;
