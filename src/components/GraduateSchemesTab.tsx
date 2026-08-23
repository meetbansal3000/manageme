import React, { useState, useMemo, useRef } from 'react';
import { List, RowComponentProps } from 'react-window';
import { 
  Share2, 
  ExternalLink, 
  Loader2, 
  Bot, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Tag, 
  LayoutGrid, 
  Table as TableIcon,
  Sparkles,
  Building2,
  Calendar,
  DollarSign,
  Award,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  Coins,
  RotateCcw,
  SlidersHorizontal,
  Zap,
  CheckSquare,
  Square,
  Check,
  Layers,
  CheckCircle2,
  AlertCircle,
  Upload,
  Mail,
  Link2
} from 'lucide-react';
import { GraduateScheme, TrackerStatus, FilterRisk, AccaAdvantage, DifficultyLevel } from '../types';
import { useScrollFadeUp } from "../hooks/useScrollFadeUp";
import { useScrollLock } from '../hooks/useScrollLock';
import { SwipeableCard } from './SwipeableCard';
import { useModalDismiss } from '../hooks/useModalDismiss';
import { useOwnerSecurity } from '../context/OwnerSecurityContext';
import { AppleEmptyState } from './AppleEmptyState';

export type GradSchemeSortKey = 'default' | 'deadline-asc' | 'deadline-desc' | 'salary-desc' | 'salary-asc';

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

export const parseDeadlineDate = (deadlineStr?: string): number => {
  if (!deadlineStr) return 9999999999999;
  const raw = deadlineStr.trim();
  const lower = raw.toLowerCase();
  
  // Clean parenthesized notes like (Rolling)
  const clean = raw.replace(/\(.*?\)/g, '').trim();

  // Try direct date parsing
  const directDate = new Date(clean);
  if (!isNaN(directDate.getTime())) {
    return directDate.getTime();
  }

  // Match "DD Mon YYYY" pattern e.g., "31 Oct 2026" or "1 Nov 2026"
  const dayMonthYearMatch = clean.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
  if (dayMonthYearMatch) {
    const day = parseInt(dayMonthYearMatch[1], 10);
    const monthKey = dayMonthYearMatch[2].slice(0, 3).toLowerCase();
    const year = parseInt(dayMonthYearMatch[3], 10);
    if (MONTH_MAP[monthKey] !== undefined) {
      return new Date(year, MONTH_MAP[monthKey], day).getTime();
    }
  }

  // Match "Mon YYYY" e.g., "Oct 2026"
  const monthYearMatch = clean.match(/([A-Za-z]{3,9})\s+(\d{4})/);
  if (monthYearMatch) {
    const monthKey = monthYearMatch[1].slice(0, 3).toLowerCase();
    const year = parseInt(monthYearMatch[2], 10);
    if (MONTH_MAP[monthKey] !== undefined) {
      return new Date(year, MONTH_MAP[monthKey], 28).getTime();
    }
  }

  // Rolling or open deadlines without exact date
  if (lower.includes('rolling') || lower.includes('open')) {
    return new Date('2026-12-15').getTime();
  }

  return 9999999999999;
};

export const parseSalaryValue = (salaryStr?: string): number => {
  if (!salaryStr) return 0;
  const cleaned = salaryStr.replace(/,/g, '');
  const numbers = cleaned.match(/\d+(\.\d+)?/g);
  if (numbers && numbers.length > 0) {
    const parsedNums = numbers.map(n => {
      let val = parseFloat(n);
      if (val < 1000 && val > 20) val = val * 1000;
      return val;
    });
    return Math.max(...parsedNums);
  }
  return 0;
};

interface GraduateSchemesTabProps {
  gradSchemes: GraduateScheme[];
  onUpdateStatus?: (id: string, status: TrackerStatus) => void;
  onAddScheme?: (scheme: Omit<GraduateScheme, 'id' | 'rank'>) => void;
  onEditScheme?: (id: string, updated: Partial<GraduateScheme>) => void;
  onDeleteScheme?: (id: string) => void;
  onUpdateSchemes?: (schemes: GraduateScheme[]) => void;
  searchQuery: string;
  selectedSector: string;
}

const ALL_STAGES: TrackerStatus[] = [
  'To Apply',
  'Applied',
  'Online Tests',
  'Assessment',
  'Interview',
  'Final Interview',
  'Offer',
  'Rejected'
];

const SECTORS = [
  'Asset Management',
  'M&A Advisory',
  'Audit / Advisory',
  'Corporate Finance',
  'Private Equity',
  'Wealth Management',
  'Consulting',
  'Other'
];

const getStageBadgeStyle = (status: TrackerStatus) => {
  switch (status) {
    case 'Offer':
    case 'Offer 🎉':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Interview':
    case 'Final Interview':
    case 'Video Interview':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'Assessment':
    case 'Assessment Centre':
    case 'Online Tests':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Applied':
    case 'Applied ✓':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Rejected':
    case 'Rejected ✕':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-[var(--surface-solid)] text-[var(--text-secondary)] border-[var(--border)]';
  }
};

interface SchemeRowExtraProps {
  schemes: GraduateScheme[];
  handleStatusChange: (id: string, st: TrackerStatus) => void;
  handleOpenEditModal: (g: GraduateScheme) => void;
  setDeletingId: (id: string | null) => void;
  selectedIds: string[];
  isBatchMode: boolean;
  onToggleSelect: (id: string) => void;
}

const SchemeRowItem = ({ 
  index, 
  style, 
  schemes, 
  handleStatusChange, 
  handleOpenEditModal, 
  setDeletingId,
  selectedIds,
  isBatchMode,
  onToggleSelect
}: RowComponentProps<SchemeRowExtraProps>) => {
  const g = schemes[index];
  if (!g) return null;
  const isSelected = selectedIds.includes(g.id);

  return (
    <div
      style={style}
      className={`flex items-center text-xs transition-colors py-2 px-3 border-b border-[var(--border)]/50 ${
        isSelected ? 'bg-blue-500/10 border-blue-500/30' : 'hover:bg-[var(--bg)]/50'
      }`}
    >
      <div className="w-12 text-center flex items-center justify-center shrink-0">
        {isBatchMode ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(g.id);
            }}
            className="p-1 text-[var(--accent)] hover:scale-110 transition-transform"
            title={isSelected ? "Deselect" : "Select"}
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-400 fill-blue-500/20" />
            ) : (
              <Square className="w-4 h-4 text-[var(--text-secondary)] hover:text-white" />
            )}
          </button>
        ) : (
          <span className="font-space-mono text-[var(--accent)] font-bold">
            {index + 1}
          </span>
        )}
      </div>
      <div className="w-44 px-2 shrink-0 overflow-hidden">
        <div className="font-bold text-[var(--text-primary)] truncate">{g.firm}</div>
        {g.notes && <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">{g.notes}</p>}
      </div>
      <div className="w-28 text-center font-space-mono text-[10px] text-[var(--text-secondary)] truncate shrink-0">
        {g.sector}
      </div>
      <div className="w-48 px-2 text-xs text-[var(--text-primary)] font-medium truncate shrink-0">
        {g.roleTitle}
      </div>
      <div className="w-36 text-center shrink-0 px-1">
        <select
          value={g.status || 'To Apply'}
          onChange={(e) => handleStatusChange(g.id, e.target.value as TrackerStatus)}
          className={`w-full px-2 py-1 text-xs font-semibold rounded-md border cursor-pointer focus:outline-none ${getStageBadgeStyle(g.status || 'To Apply')}`}
        >
          {ALL_STAGES.map(st => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>
      <div className="w-36 font-space-mono text-[10px] text-center text-amber-500 font-semibold shrink-0">
        {g.appCloses || 'Rolling'}
      </div>
      <div className="w-32 font-space-mono text-center font-bold text-[var(--accent)] shrink-0">
        {g.salary || '—'}
      </div>
      <div className="w-48 px-2 shrink-0">
        <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
          {g.skills && g.skills.length > 0 ? (
            g.skills.slice(0, 3).map((s, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-[var(--bg)] border border-[var(--border)] rounded text-[10px] font-medium truncate max-w-[120px]">
                {s}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-[var(--text-secondary)] italic">—</span>
          )}
          {(g.skills?.length || 0) > 3 && (
            <span className="text-[10px] text-[var(--text-secondary)] self-center font-mono">
              +{(g.skills?.length || 0) - 3}
            </span>
          )}
        </div>
      </div>
      <div className="w-24 text-center shrink-0">
        {g.applyVia ? (
          <a
            href={g.applyVia.startsWith('http') ? g.applyVia : `https://${g.applyVia}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--accent)] text-white rounded text-[10px] font-medium hover:brightness-110"
          >
            <span>Apply</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        ) : (
          <span className="text-[11px] text-[var(--text-secondary)]">—</span>
        )}
      </div>
      <div className="w-24 text-center shrink-0">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => handleOpenEditModal(g)}
            className="p-1 rounded hover:bg-[var(--surface-solid)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Edit Scheme"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingId(g.id)}
            className="p-1 rounded hover:bg-red-500/10 text-red-400"
            title="Delete Scheme"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const GraduateSchemesTab: React.FC<GraduateSchemesTabProps> = ({
  gradSchemes = [],
  onUpdateStatus,
  onAddScheme,
  onEditScheme,
  onDeleteScheme,
  onUpdateSchemes,
  searchQuery,
  selectedSector
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  
  // Batch Edit Mode State
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = (visibleList: GraduateScheme[]) => {
    if (selectedIds.length === visibleList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleList.map(s => s.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setIsBatchMode(false);
  };

  const handleBulkStatusChange = (status: TrackerStatus) => {
    if (selectedIds.length === 0) return;
    if (onUpdateSchemes) {
      const updated = gradSchemes.map(s => selectedIds.includes(s.id) ? { ...s, status } : s);
      onUpdateSchemes(updated);
    } else if (onUpdateStatus) {
      selectedIds.forEach(id => onUpdateStatus(id, status));
    }
  };

  const handleBulkSectorChange = (sector: string) => {
    if (selectedIds.length === 0) return;
    if (onUpdateSchemes) {
      const updated = gradSchemes.map(s => selectedIds.includes(s.id) ? { ...s, sector } : s);
      onUpdateSchemes(updated);
    }
  };

  const handleBulkDifficultyChange = (difficulty: DifficultyLevel) => {
    if (selectedIds.length === 0) return;
    if (onUpdateSchemes) {
      const updated = gradSchemes.map(s => selectedIds.includes(s.id) ? { ...s, difficulty } : s);
      onUpdateSchemes(updated);
    }
  };

  const handleBulkRiskChange = (filterRisk: FilterRisk) => {
    if (selectedIds.length === 0) return;
    if (onUpdateSchemes) {
      const updated = gradSchemes.map(s => selectedIds.includes(s.id) ? { ...s, filterRisk } : s);
      onUpdateSchemes(updated);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    requireOwnerPermission(`Batch Delete ${selectedIds.length} Target Graduate Schemes`, () => {
      if (onUpdateSchemes) {
        const remaining = gradSchemes.filter(s => !selectedIds.includes(s.id));
        onUpdateSchemes(remaining);
      } else if (onDeleteScheme) {
        selectedIds.forEach(id => onDeleteScheme(id));
      }
      setSelectedIds([]);
      setIsBatchMode(false);
      setIsBulkDeleting(false);
    });
  };

  // Persistent Sort State (saved across sessions and tab switches)
  const [sortBy, setSortBy] = useState<GradSchemeSortKey>(() => {
    try {
      const saved = localStorage.getItem('grad_schemes_sort_key');
      if (saved && ['default', 'deadline-asc', 'deadline-desc', 'salary-desc', 'salary-asc'].includes(saved)) {
        return saved as GradSchemeSortKey;
      }
    } catch {
      // LocalStorage access fallback
    }
    return 'default';
  });

  const handleSortChange = (newSort: GradSchemeSortKey) => {
    setSortBy(newSort);
    try {
      localStorage.setItem('grad_schemes_sort_key', newSort);
    } catch {}
  };

  const [loadingPitch, setLoadingPitch] = useState<string | null>(null);
  const [pitchData, setPitchData] = useState<Record<string, string[]>>({});

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<GraduateScheme | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    firm: '',
    roleTitle: '',
    sector: 'Asset Management',
    appOpens: '',
    appCloses: '',
    salary: '£60,000 - £75,000',
    bonus: '£10,000 - £20,000',
    status: 'To Apply' as TrackerStatus,
    filterRisk: 'Medium' as FilterRisk,
    accaAdvantage: 'High' as AccaAdvantage,
    difficulty: 'Hard' as DifficultyLevel,
    applyVia: '',
    notes: '',
    skills: [] as string[],
    newSkillInput: ''
  });

  useScrollLock(isModalOpen || !!deletingId);
  useModalDismiss(isModalOpen, () => setIsModalOpen(false));
  useModalDismiss(!!deletingId, () => setDeletingId(null));

  const { requireOwnerPermission } = useOwnerSecurity();

  const handleOpenAddModal = () => {
    requireOwnerPermission('Add New Target Graduate Scheme', () => {
      setEditingScheme(null);
      setFormData({
        firm: '',
        roleTitle: '',
        sector: 'Asset Management',
        appOpens: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        appCloses: '31 Oct 2026',
        salary: '£60,000 - £75,000',
        bonus: '£10,000 - £15,000',
        status: 'To Apply',
        filterRisk: 'Medium',
        accaAdvantage: 'High',
        difficulty: 'Hard',
        applyVia: 'https://',
        notes: '',
        skills: ['Financial Modeling', 'Valuation'],
        newSkillInput: ''
      });
      setIsModalOpen(true);
    });
  };

  const handleOpenEditModal = (scheme: GraduateScheme) => {
    requireOwnerPermission('Edit Graduate Scheme Details', () => {
      setEditingScheme(scheme);
      setFormData({
        firm: scheme.firm,
        roleTitle: scheme.roleTitle,
        sector: scheme.sector || 'Asset Management',
        appOpens: scheme.appOpens || '',
        appCloses: scheme.appCloses || '',
        salary: scheme.salary || '',
        bonus: scheme.bonus || '',
        status: scheme.status || 'To Apply',
        filterRisk: scheme.filterRisk || 'Medium',
        accaAdvantage: scheme.accaAdvantage || 'High',
        difficulty: scheme.difficulty || 'Medium',
        applyVia: scheme.applyVia || '',
        notes: scheme.notes || '',
        skills: scheme.skills || [],
        newSkillInput: ''
      });
      setIsModalOpen(true);
    });
  };

  const handleAddSkillTag = () => {
    const trimmed = formData.newSkillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed],
        newSkillInput: ''
      }));
    }
  };

  const handleRemoveSkillTag = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSaveScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firm || !formData.roleTitle) return;

    if (editingScheme) {
      // Edit existing
      const updatedFields: Partial<GraduateScheme> = {
        firm: formData.firm,
        roleTitle: formData.roleTitle,
        sector: formData.sector,
        appOpens: formData.appOpens,
        appCloses: formData.appCloses,
        salary: formData.salary,
        bonus: formData.bonus,
        status: formData.status,
        filterRisk: formData.filterRisk,
        accaAdvantage: formData.accaAdvantage,
        difficulty: formData.difficulty,
        applyVia: formData.applyVia,
        notes: formData.notes,
        skills: formData.skills
      };

      if (onEditScheme) {
        onEditScheme(editingScheme.id, updatedFields);
      } else if (onUpdateSchemes) {
        onUpdateSchemes(gradSchemes.map(g => g.id === editingScheme.id ? { ...g, ...updatedFields } : g));
      }
    } else {
      // Add new
      const newScheme: GraduateScheme = {
        id: `gs-${Date.now()}`,
        rank: gradSchemes.length + 1,
        firm: formData.firm,
        roleTitle: formData.roleTitle,
        sector: formData.sector,
        appOpens: formData.appOpens || 'Open',
        appCloses: formData.appCloses || 'Rolling',
        salary: formData.salary || 'Competitive',
        bonus: formData.bonus || 'Discretionary',
        status: formData.status,
        filterRisk: formData.filterRisk,
        accaAdvantage: formData.accaAdvantage,
        difficulty: formData.difficulty,
        applyVia: formData.applyVia || '#',
        notes: formData.notes || 'Target graduate scheme added by candidate',
        skills: formData.skills
      };

      if (onAddScheme) {
        onAddScheme(newScheme);
      } else if (onUpdateSchemes) {
        onUpdateSchemes([newScheme, ...gradSchemes]);
      }
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    requireOwnerPermission('Delete Target Graduate Scheme', () => {
      if (onDeleteScheme) {
        onDeleteScheme(deletingId);
      } else if (onUpdateSchemes) {
        onUpdateSchemes(gradSchemes.filter(g => g.id !== deletingId));
      }
      setDeletingId(null);
    });
  };

  const handleStatusChange = (id: string, newStatus: TrackerStatus) => {
    requireOwnerPermission(`Update Application Status to ${newStatus}`, () => {
      if (onUpdateStatus) {
        onUpdateStatus(id, newStatus);
      } else if (onUpdateSchemes) {
        onUpdateSchemes(gradSchemes.map(g => g.id === id ? { ...g, status: newStatus } : g));
      }
    });
  };

  const handleShare = () => {
    requireOwnerPermission('Export Graduate Schemes JSON', () => {
      const json = JSON.stringify(gradSchemes, null, 2);
      navigator.clipboard.writeText(json);
      alert('Graduate Schemes data copied to clipboard as JSON!');
    });
  };

  const handleGeneratePitch = async (id: string, firm: string, role: string) => {
    setLoadingPitch(id);
    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firm, role })
      });
      if (!response.ok) throw new Error('Failed to generate pitch');
      const data = await response.json();
      setPitchData(prev => ({ ...prev, [id]: data.bullets }));
    } catch (error) {
      console.error(error);
      alert('Error generating AI pitch');
    } finally {
      setLoadingPitch(null);
    }
  };

  useScrollFadeUp([gradSchemes, searchQuery, selectedDifficulty, selectedRisk, selectedStageFilter, sortBy, viewMode]);

  const filtered = gradSchemes.filter(g => {
    if (selectedSector !== 'ALL' && g.sector !== selectedSector) return false;
    if (selectedDifficulty !== 'ALL' && g.difficulty !== selectedDifficulty) return false;
    if (selectedRisk !== 'ALL' && g.filterRisk !== selectedRisk) return false;
    if (selectedStageFilter !== 'ALL' && g.status !== selectedStageFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.firm.toLowerCase().includes(q) ||
      g.roleTitle.toLowerCase().includes(q) ||
      (g.sector && g.sector.toLowerCase().includes(q)) ||
      (g.notes && g.notes.toLowerCase().includes(q)) ||
      (g.salary && g.salary.toLowerCase().includes(q)) ||
      (g.skills && g.skills.some(s => s.toLowerCase().includes(q)))
    );
  });

  const sortedSchemes = useMemo(() => {
    const list = [...filtered];
    if (sortBy === 'deadline-asc') {
      list.sort((a, b) => parseDeadlineDate(a.appCloses) - parseDeadlineDate(b.appCloses));
    } else if (sortBy === 'deadline-desc') {
      list.sort((a, b) => parseDeadlineDate(b.appCloses) - parseDeadlineDate(a.appCloses));
    } else if (sortBy === 'salary-desc') {
      list.sort((a, b) => parseSalaryValue(b.salary) - parseSalaryValue(a.salary));
    } else if (sortBy === 'salary-asc') {
      list.sort((a, b) => parseSalaryValue(a.salary) - parseSalaryValue(b.salary));
    }
    return list;
  }, [filtered, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Editorial Header */}
      <div className="border-b border-[var(--border)] pb-6 flex flex-col lg:flex-row justify-between items-start gap-8 w-full">
        <div className="flex-1">
          <div className="font-space-mono text-xs text-[var(--accent)] font-bold uppercase tracking-widest flex items-center gap-2">
            <span>02 / TARGET OPPORTUNITIES</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
            <span>{gradSchemes.length} Target Roles</span>
          </div>
          <h2 className="apple-headline text-3xl sm:text-4xl text-[var(--text-primary)] font-semibold mt-1">
            Graduate Schemes & Applications
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mt-1 leading-relaxed">
            Interactive application tracker for target roles, M&A boutiques, advisory, and corporate pipelines.
          </p>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex flex-wrap items-center gap-3 self-start mt-4 lg:mt-0">
          {/* Batch Mode Toggle */}
          <button
            onClick={() => {
              if (isBatchMode) {
                handleClearSelection();
              } else {
                setIsBatchMode(true);
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isBatchMode || selectedIds.length > 0
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm shadow-blue-500/10'
                : 'glass-panel border-[var(--border)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)]'
            }`}
            title="Toggle Batch Selection Mode"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isBatchMode ? 'Exit Batch' : 'Batch Edit'}</span>
            {selectedIds.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                {selectedIds.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openSmartImport', { detail: { scope: 'jobs' } }))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold text-blue-300 transition-colors cursor-pointer"
            title="Import target roles from CSV, JSON, TXT or Excel"
          >
            <Upload className="w-3.5 h-3.5" /> Smart Import / File Sync
          </button>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openJobSyncHub'))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold text-blue-300 transition-colors cursor-pointer"
            title="Connect LinkedIn, Indeed & Auto-Capture Job URLs"
          >
            <Link2 className="w-3.5 h-3.5" /> Job Platforms Sync
          </button>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openOutreachHub', { detail: { company: 'Goldman Sachs', role: 'Summer Analyst - M&A Advisory' } }))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 transition-colors cursor-pointer"
            title="Find HR email & draft cold pitch"
          >
            <Mail className="w-3.5 h-3.5" /> Cold Outreach & HR Finder
          </button>

          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 active:scale-95 transition-all"
            id="addGradSchemeBtn"
          >
            <Plus className="w-4 h-4" /> Add Target Role
          </button>

          <div className="flex items-center p-1 rounded-xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards' ? 'bg-[var(--bg)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-[var(--bg)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2 rounded-xl glass-panel border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* Floating / Sticky Batch Actions Bar */}
      {(isBatchMode || selectedIds.length > 0) && (
        <div className="p-4 rounded-2xl bg-[var(--surface-solid)] border border-blue-500/40 shadow-xl shadow-blue-500/5 transition-all flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(sortedSchemes)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-semibold text-xs hover:bg-blue-500/25 transition-colors"
              >
                {selectedIds.length === sortedSchemes.length && sortedSchemes.length > 0 ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>
                  {selectedIds.length === sortedSchemes.length && sortedSchemes.length > 0
                    ? 'Deselect All'
                    : `Select All (${sortedSchemes.length})`}
                </span>
              </button>
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                <span className="text-white font-bold">{selectedIds.length}</span> selected
              </span>
            </div>

            {/* Quick Bulk Update Stage */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono text-[var(--text-secondary)]">Stage:</span>
              <select
                disabled={selectedIds.length === 0}
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusChange(e.target.value as TrackerStatus);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="px-2.5 py-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-primary)] disabled:opacity-50 cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="" disabled>Set Status...</option>
                {ALL_STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Quick Bulk Update Sector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono text-[var(--text-secondary)]">Sector:</span>
              <select
                disabled={selectedIds.length === 0}
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkSectorChange(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="px-2.5 py-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-primary)] disabled:opacity-50 cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="" disabled>Set Sector...</option>
                {SECTORS.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {/* Quick Bulk Update Difficulty */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono text-[var(--text-secondary)]">Difficulty:</span>
              <select
                disabled={selectedIds.length === 0}
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkDifficultyChange(e.target.value as DifficultyLevel);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="px-2.5 py-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-primary)] disabled:opacity-50 cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="" disabled>Set Difficulty...</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Very Hard">Very Hard</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 font-semibold text-xs hover:bg-red-500 hover:text-white disabled:opacity-40 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              title="Clear & Exit Batch"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter & Sorting Bar */}
      <div className="space-y-3 p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">Stage Filter</label>
              <select
                value={selectedStageFilter}
                onChange={(e) => setSelectedStageFilter(e.target.value)}
                className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg font-space-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="ALL">ALL STAGES</option>
                {ALL_STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg font-space-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="ALL">ALL DIFFICULTIES</option>
                <option value="Easy">EASY</option>
                <option value="Medium">MEDIUM</option>
                <option value="Hard">HARD</option>
                <option value="Very Hard">VERY HARD</option>
              </select>
            </div>

            <div>
              <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1">2:1 Filter Risk</label>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg font-space-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="ALL">ALL RISKS</option>
                <option value="Low">LOW RISK</option>
                <option value="Medium">MEDIUM RISK</option>
                <option value="High">HIGH RISK (BIG 4)</option>
                <option value="Variable">VARIABLE</option>
              </select>
            </div>

            {/* Persistent Sorting Selection */}
            <div>
              <label className="block font-space-mono text-[10px] uppercase text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-[var(--accent)]" />
                <span>Sort Pipeline</span>
              </label>
              <div className="relative">
                <select
                  id="gradSchemesSortSelect"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as GradSchemeSortKey)}
                  className={`px-3 py-1.5 bg-[var(--bg)] border rounded-lg font-space-mono text-xs focus:outline-none transition-colors ${
                    sortBy !== 'default' 
                      ? 'border-[var(--accent)] text-[var(--accent)] font-semibold' 
                      : 'border-[var(--border)] text-[var(--text-primary)]'
                  }`}
                >
                  <option value="default">Default (Pipeline Order)</option>
                  <option value="deadline-asc">⏳ Deadline: Soonest First (Ascending)</option>
                  <option value="deadline-desc">⏳ Deadline: Latest First (Descending)</option>
                  <option value="salary-desc">💰 Salary: Highest First (High → Low)</option>
                  <option value="salary-asc">💰 Salary: Lowest First (Low → High)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
            <span>
              Showing <span className="font-bold text-[var(--accent)]">{sortedSchemes.length}</span> of {gradSchemes.length} schemes
            </span>
          </div>
        </div>

        {/* Quick-Click Sort Toggles & Persistence Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]/60 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase text-[var(--text-secondary)] mr-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Quick Sort:
            </span>

            {/* Toggle Deadline Sort */}
            <button
              id="sortToggleDeadlineBtn"
              onClick={() => {
                if (sortBy === 'deadline-asc') handleSortChange('deadline-desc');
                else if (sortBy === 'deadline-desc') handleSortChange('default');
                else handleSortChange('deadline-asc');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
                sortBy === 'deadline-asc'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-sm font-semibold'
                  : sortBy === 'deadline-desc'
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-sm font-semibold'
                  : 'bg-[var(--bg)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
              title="Toggle sorting by Deadline (Ascending / Descending)"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Deadline</span>
              {sortBy === 'deadline-asc' && <ArrowUp className="w-3 h-3 text-amber-400" />}
              {sortBy === 'deadline-desc' && <ArrowDown className="w-3 h-3 text-amber-400" />}
            </button>

            {/* Toggle Salary Sort */}
            <button
              id="sortToggleSalaryBtn"
              onClick={() => {
                if (sortBy === 'salary-desc') handleSortChange('salary-asc');
                else if (sortBy === 'salary-asc') handleSortChange('default');
                else handleSortChange('salary-desc');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
                sortBy === 'salary-desc'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm font-semibold'
                  : sortBy === 'salary-asc'
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 shadow-sm font-semibold'
                  : 'bg-[var(--bg)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
              title="Toggle sorting by Salary (High-to-Low / Low-to-High)"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Salary</span>
              {sortBy === 'salary-desc' && <ArrowDown className="w-3 h-3 text-emerald-400" />}
              {sortBy === 'salary-asc' && <ArrowUp className="w-3 h-3 text-emerald-400" />}
            </button>

            {/* Reset Sort Button */}
            {sortBy !== 'default' && (
              <button
                onClick={() => handleSortChange('default')}
                className="px-2 py-1 rounded-lg text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] border border-transparent hover:border-[var(--border)] flex items-center gap-1 transition-all"
                title="Reset to default pipeline order"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="font-mono text-[10px] text-[var(--text-secondary)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Persistent Preference Saved</span>
          </div>
        </div>
      </div>

      {/* Main Content: Cards or Table */}
      {sortedSchemes.length === 0 ? (
        <AppleEmptyState
          icon={Award}
          title={gradSchemes.length === 0 ? "No applications yet" : "No Graduate Schemes Found"}
          description={gradSchemes.length === 0 
            ? "No applications yet. Click '+ Add Application' or 'Ingest via AI' to add your first role."
            : "Try adjusting your sector, status, or search filters to find matching schemes."}
          actionLabel={gradSchemes.length === 0 ? "+ Add Application" : "Reset Filters"}
          onAction={() => {
            if (gradSchemes.length === 0) {
              setEditingScheme(null);
              setFormData(INITIAL_FORM_STATE);
              setIsModalOpen(true);
            } else {
              setSelectedStageFilter('ALL');
              setSelectedDifficulty('ALL');
              setSelectedRisk('ALL');
            }
          }}
          className="my-8 py-16"
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSchemes.map((g) => {
            const isWarn = g.notes && g.notes.includes('⚠️');
            const isSelected = selectedIds.includes(g.id);
            return (
              <SwipeableCard
                key={g.id}
                onSwipeRight={() => {
                  const currentIdx = ALL_STAGES.indexOf(g.status);
                  const nextStage = currentIdx >= 0 && currentIdx < ALL_STAGES.length - 1 ? ALL_STAGES[currentIdx + 1] : ALL_STAGES[ALL_STAGES.length - 1];
                  if (onUpdateStatus) onUpdateStatus(g.id, nextStage);
                }}
                onSwipeLeft={() => setDeletingId(g.id)}
                rightLabel="Advance Stage"
                leftLabel="Delete Scheme"
              >
                <div 
                  className={`bento-card p-6 flex flex-col justify-between group relative overflow-hidden rounded-2xl transition-all shadow-sm h-full ${
                    isSelected
                      ? 'border-2 border-blue-500 bg-blue-500/5 shadow-blue-500/10'
                      : 'border border-[var(--border)] hover:border-[var(--accent)]/50'
                  }`}
                >
                {/* Top Bar: Selection Checkbox, Sector & Action Buttons */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Batch Selection Checkbox */}
                    {(isBatchMode || selectedIds.length > 0) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(g.id);
                        }}
                        className="p-1 rounded-md bg-[var(--surface-solid)] border border-[var(--border)] hover:border-blue-400 text-blue-400 mr-1"
                        title={isSelected ? "Deselect" : "Select"}
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-[var(--text-secondary)]" />}
                      </button>
                    )}
                    <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {g.sector}
                    </span>
                    {g.difficulty && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)]/80">
                        {g.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Edit / Delete / Pitch Tools */}
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    {!isBatchMode && (
                      <button
                        onClick={() => {
                          setIsBatchMode(true);
                          handleToggleSelect(g.id);
                        }}
                        className="p-1.5 rounded-lg bg-[var(--surface-solid)] border border-[var(--border)] hover:bg-blue-500/20 hover:text-blue-400 text-[var(--text-secondary)] transition-colors"
                        title="Select for Batch Action"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(g)}
                      className="p-1.5 rounded-lg bg-[var(--surface-solid)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-secondary)] transition-colors"
                      title="Edit Graduate Scheme"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(g.id)}
                      className="p-1.5 rounded-lg bg-[var(--surface-solid)] border border-[var(--border)] hover:bg-red-500 hover:text-white text-[var(--text-secondary)] transition-colors"
                      title="Delete Graduate Scheme"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Company Name & Role Title */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="apple-headline text-xl font-bold text-[var(--text-primary)]">
                      {g.firm}
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]/90 mt-1">
                    {g.roleTitle}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs mb-4">
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-[var(--text-secondary)]">Salary</span>
                    <span className="font-semibold text-[var(--accent)]">{g.salary || 'Competitive'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-[var(--text-secondary)]">Deadline</span>
                    <span className="font-semibold text-amber-500">{g.appCloses || 'Rolling'}</span>
                  </div>
                </div>

                {/* Skill Tags Section */}
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase font-mono text-[var(--text-secondary)]">
                    <Tag className="w-3 h-3 text-[var(--accent)]" />
                    <span>Required Competencies</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.skills && g.skills.length > 0 ? (
                      g.skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--text-primary)]"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-[var(--text-secondary)] italic">No skills tagged</span>
                    )}
                  </div>
                </div>

                {/* Strategy Notes */}
                {g.notes && (
                  <p className={`text-xs leading-relaxed mb-4 p-2.5 rounded-lg bg-[var(--surface-solid)] border border-[var(--border)] ${
                    isWarn ? 'text-amber-400 font-medium' : 'text-[var(--text-secondary)]'
                  }`}>
                    {g.notes}
                  </p>
                )}

                {/* AI Pitch Preview if generated */}
                {pitchData[g.id] && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-[var(--text-primary)] space-y-1">
                    <div className="font-semibold text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Tailored Pitch Bullets
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-[var(--text-secondary)]">
                      {pitchData[g.id].map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                )}

                {/* Card Footer: Interactive Status Dropdown & Action CTA */}
                <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <select
                      value={g.status || 'To Apply'}
                      onChange={(e) => handleStatusChange(g.id, e.target.value as TrackerStatus)}
                      className={`w-full appearance-none px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer focus:outline-none transition-all ${getStageBadgeStyle(g.status || 'To Apply')}`}
                    >
                      {ALL_STAGES.map(st => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('openOutreachHub', { detail: { company: g.firm, role: g.roleTitle } }))}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title={`Find HR email & draft cold pitch for ${g.firm}`}
                    >
                      <Mail className="w-3 h-3" />
                      <span className="hidden sm:inline">Cold Email</span>
                    </button>

                    <button
                      onClick={() => handleGeneratePitch(g.id, g.firm, g.roleTitle)}
                      disabled={loadingPitch === g.id}
                      className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      title="AI Resume Pitch"
                    >
                      {loadingPitch === g.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                    </button>

                    {g.applyVia && (
                      <a
                        href={g.applyVia.startsWith('http') ? g.applyVia : `https://${g.applyVia}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[var(--accent)]/10 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white border border-[var(--accent)]/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </SwipeableCard>
            );
          })}
        </div>
      ) : (
        /* Table Display with Action Columns & Virtualization */
        <div className="border border-[var(--border)] overflow-hidden bg-[var(--surface-solid)] rounded-2xl">
          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
              {/* Table Header Row */}
              <div className="bg-[var(--bg)] text-[var(--text-primary)] border-b border-[var(--border)] font-space-mono text-[10px] uppercase tracking-wider flex items-center py-3 px-3">
                <div className="w-12 text-center shrink-0 font-bold flex items-center justify-center">
                  {isBatchMode ? (
                    <button
                      type="button"
                      onClick={() => handleSelectAll(sortedSchemes)}
                      className="p-1 hover:text-[var(--accent)] text-[var(--text-secondary)] transition-colors"
                      title={selectedIds.length === sortedSchemes.length && sortedSchemes.length > 0 ? "Deselect All" : "Select All"}
                    >
                      {selectedIds.length === sortedSchemes.length && sortedSchemes.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <span>#</span>
                  )}
                </div>
                <div className="w-44 px-2 shrink-0">Firm</div>
                <div className="w-28 text-center shrink-0">Sector</div>
                <div className="w-48 px-2 shrink-0">Role Title</div>
                <div className="w-36 text-center shrink-0">Stage / Status</div>
                <div className="w-36 text-center shrink-0">
                  <button
                    onClick={() => {
                      if (sortBy === 'deadline-asc') handleSortChange('deadline-desc');
                      else if (sortBy === 'deadline-desc') handleSortChange('default');
                      else handleSortChange('deadline-asc');
                    }}
                    className={`inline-flex items-center gap-1.5 uppercase font-space-mono text-[10px] tracking-wider py-1 px-2 rounded-lg transition-colors group ${
                      sortBy.startsWith('deadline') 
                        ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30' 
                        : 'hover:text-[var(--accent)] hover:bg-[var(--surface-solid)] text-[var(--text-primary)]'
                    }`}
                    title="Click to sort by Deadline (Ascending / Descending / Default)"
                  >
                    <span>Deadline</span>
                    {sortBy === 'deadline-asc' ? (
                      <ArrowUp className="w-3 h-3 text-amber-400" />
                    ) : sortBy === 'deadline-desc' ? (
                      <ArrowDown className="w-3 h-3 text-amber-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                </div>
                <div className="w-32 text-center shrink-0">
                  <button
                    onClick={() => {
                      if (sortBy === 'salary-desc') handleSortChange('salary-asc');
                      else if (sortBy === 'salary-asc') handleSortChange('default');
                      else handleSortChange('salary-desc');
                    }}
                    className={`inline-flex items-center gap-1.5 uppercase font-space-mono text-[10px] tracking-wider py-1 px-2 rounded-lg transition-colors group ${
                      sortBy.startsWith('salary') 
                        ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30' 
                        : 'hover:text-[var(--accent)] hover:bg-[var(--surface-solid)] text-[var(--text-primary)]'
                    }`}
                    title="Click to sort by Salary (High-to-Low / Low-to-High / Default)"
                  >
                    <span>Salary</span>
                    {sortBy === 'salary-desc' ? (
                      <ArrowDown className="w-3 h-3 text-emerald-400" />
                    ) : sortBy === 'salary-asc' ? (
                      <ArrowUp className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                </div>
                <div className="w-48 px-2 shrink-0">Required Skills</div>
                <div className="w-24 text-center shrink-0">Portal</div>
                <div className="w-24 text-center shrink-0">Actions</div>
              </div>

              {/* Virtualized Rows List (react-window) */}
              <List
                style={{ height: Math.min(600, Math.max(240, sortedSchemes.length * 76)), width: '100%' }}
                rowCount={sortedSchemes.length}
                rowHeight={76}
                rowComponent={SchemeRowItem}
                rowProps={{
                  schemes: sortedSchemes,
                  handleStatusChange,
                  handleOpenEditModal,
                  setDeletingId,
                  selectedIds,
                  isBatchMode,
                  onToggleSelect: handleToggleSelect,
                }}
                className="custom-scrollbar"
              />
            </div>
          </div>
          
          <div className="px-4 py-2.5 bg-[var(--bg)] border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Virtualized Table Engine active (react-window)</span>
            </div>
            <span>{sortedSchemes.length} total entries optimized</span>
          </div>
        </div>
      )}

      {/* Add / Edit Graduate Scheme Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="w-full max-w-xl glass-panel border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 p-1.5 bg-[var(--surface-solid)] border border-[var(--border)] shadow rounded-full text-gray-400 hover:text-white transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="border-b border-[var(--border)] pb-3 mb-4">
              <div className="font-space-mono text-[10px] text-[var(--accent)] font-bold uppercase tracking-widest">
                {editingScheme ? 'UPDATE RECORD' : 'NEW OPPORTUNITY'}
              </div>
              <h3 className="apple-headline text-2xl font-bold text-[var(--text-primary)] mt-1">
                {editingScheme ? `Edit ${editingScheme.firm}` : 'Add Graduate Scheme'}
              </h3>
            </div>

            <form onSubmit={handleSaveScheme} className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Company / Firm Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., BlackRock, Lazard, Schroders"
                    value={formData.firm}
                    onChange={e => setFormData({ ...formData, firm: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Global Investment Graduate Analyst"
                    value={formData.roleTitle}
                    onChange={e => setFormData({ ...formData, roleTitle: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Sector / Practice</label>
                  <select
                    value={formData.sector}
                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Pipeline Stage</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as TrackerStatus })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    {ALL_STAGES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g., £65,000 - £75,000"
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Deadline / Window</label>
                  <input
                    type="text"
                    placeholder="e.g., 31 Oct 2026 (Rolling)"
                    value={formData.appCloses}
                    onChange={e => setFormData({ ...formData, appCloses: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Skill Tagging Section */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Required Competencies & Skills (Press Enter or Add)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Financial Modeling, DCF, Python, Valuation"
                    value={formData.newSkillInput}
                    onChange={e => setFormData({ ...formData, newSkillInput: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkillTag();
                      }
                    }}
                    className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkillTag}
                    className="px-3 py-2 bg-[var(--surface-solid)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Add Tag
                  </button>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] min-h-[42px]">
                  {formData.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 text-xs font-medium"
                    >
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkillTag(skill)} 
                        className="hover:text-red-400 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="text-xs text-[var(--text-secondary)] self-center">No skill tags added yet</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Application URL / Portal</label>
                <input
                  type="text"
                  placeholder="https://careers.company.com"
                  value={formData.applyVia}
                  onChange={e => setFormData({ ...formData, applyVia: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Key Strategy Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Tailor for Asset Management stream, focus on DCF valuation and ACCA exam exemptions..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold hover:bg-[var(--surface-solid)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 transition-all"
                >
                  {editingScheme ? 'Save Changes' : 'Create Graduate Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setDeletingId(null); }}
        >
          <div className="w-full max-w-sm glass-panel border border-red-500/30 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Delete Scheme?</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to delete this graduate scheme record? This action will remove it from your pipeline.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--surface-solid)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
