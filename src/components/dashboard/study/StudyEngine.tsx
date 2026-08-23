// Component: Study Engine, CFA Level 1 Revision Matrix & Academic Timetable

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Award, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Sparkles, 
  GraduationCap,
  FileText,
  Layers,
  CheckSquare
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { toast } from '../../ui/Toast';

export interface AcademicModule {
  id: string;
  code: string;
  name: string;
  term: 'Michaelmas' | 'Epiphany' | 'Easter';
  credits: number;
  status: 'In Progress' | 'Completed';
  targetGrade: string;
  currentScore?: number;
  deliverables: { id: string; title: string; weight: number; completed: boolean }[];
}

export interface CfaTopic {
  id: string;
  name: string;
  weightRange: string;
  readings: { id: string; title: string; completed: boolean }[];
}

export interface TimetableClass {
  id: string;
  moduleName: string;
  type: 'Lecture' | 'Seminar' | 'Lab' | 'Study Session';
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  location: string;
}

const STORAGE_KEY = 'manageme_study_engine_data';

const DEFAULT_MODULES: AcademicModule[] = [
  {
    id: 'mod_1',
    code: 'FIN401',
    name: 'Advanced Corporate Finance',
    term: 'Michaelmas',
    credits: 20,
    status: 'In Progress',
    targetGrade: 'Distinction (75%)',
    currentScore: 78,
    deliverables: [
      { id: 'del_1', title: 'M&A Valuation Case Study (DCF & Comps)', weight: 30, completed: true },
      { id: 'del_2', title: 'Capital Structure & WACC Empirical Paper', weight: 30, completed: false },
      { id: 'del_3', title: 'Final Comprehensive Exam', weight: 40, completed: false }
    ]
  },
  {
    id: 'mod_2',
    code: 'FIN402',
    name: 'Financial Reporting & Statement Analysis',
    term: 'Michaelmas',
    credits: 20,
    status: 'In Progress',
    targetGrade: 'Distinction (72%)',
    currentScore: 74,
    deliverables: [
      { id: 'del_4', title: 'IFRS 16 Lease & Revenue Recognition Analysis', weight: 40, completed: true },
      { id: 'del_5', title: 'Earnings Quality & Fraud Detection Project', weight: 60, completed: false }
    ]
  },
  {
    id: 'mod_3',
    code: 'FIN403',
    name: 'Applied Financial Econometrics & Machine Learning',
    term: 'Epiphany',
    credits: 20,
    status: 'In Progress',
    targetGrade: 'Distinction (70%)',
    deliverables: [
      { id: 'del_6', title: 'ARIMA & GARCH Volatility Modeling in Python', weight: 50, completed: false },
      { id: 'del_7', title: 'Asset Pricing Empirical Project', weight: 50, completed: false }
    ]
  },
  {
    id: 'mod_4',
    code: 'FIN404',
    name: 'Equity Valuation & Portfolio Management',
    term: 'Epiphany',
    credits: 20,
    status: 'In Progress',
    targetGrade: 'Distinction (76%)',
    deliverables: [
      { id: 'del_8', title: 'LBO & Multi-Stage DCF Model on LSE FTSE 100 Firm', weight: 50, completed: false },
      { id: 'del_9', title: 'Black-Litterman Portfolio Optimization', weight: 50, completed: false }
    ]
  }
];

const DEFAULT_CFA_TOPICS: CfaTopic[] = [
  {
    id: 'cfa_1',
    name: 'Ethical & Professional Standards',
    weightRange: '15-20%',
    readings: [
      { id: 'cfa_r1', title: 'Code of Ethics & Standards of Professional Conduct', completed: true },
      { id: 'cfa_r2', title: 'Guidance for Standards I - VII & GIPS Overview', completed: true },
      { id: 'cfa_r3', title: 'Ethics Case Scenarios & Soft Dollar Standards', completed: false }
    ]
  },
  {
    id: 'cfa_2',
    name: 'Financial Statement Analysis (FSA)',
    weightRange: '11-14%',
    readings: [
      { id: 'cfa_r4', title: 'Income Statement, Balance Sheet & Cash Flow Mechanics', completed: true },
      { id: 'cfa_r5', title: 'Inventories (FIFO vs LIFO) & Long-Lived Assets', completed: true },
      { id: 'cfa_r6', title: 'Income Taxes, DTL/DTA & Financial Reporting Quality', completed: false }
    ]
  },
  {
    id: 'cfa_3',
    name: 'Equity Investments',
    weightRange: '11-14%',
    readings: [
      { id: 'cfa_r7', title: 'Market Organization, Structure & Security Market Indices', completed: true },
      { id: 'cfa_r8', title: 'Industry & Company Analysis / Porter 5 Forces', completed: false },
      { id: 'cfa_r9', title: 'Equity Valuation: DDM, Multiples & Asset-Based Models', completed: false }
    ]
  },
  {
    id: 'cfa_4',
    name: 'Fixed Income',
    weightRange: '11-14%',
    readings: [
      { id: 'cfa_r10', title: 'Fixed-Income Securities: Defining Elements & Issuance', completed: true },
      { id: 'cfa_r11', title: 'Bond Yields, Spreads, Spot Rates & Forward Rates', completed: false },
      { id: 'cfa_r12', title: 'Macaulay / Modified Duration, Convexity & Credit Risk', completed: false }
    ]
  },
  {
    id: 'cfa_5',
    name: 'Quantitative Methods',
    weightRange: '6-9%',
    readings: [
      { id: 'cfa_r13', title: 'Time Value of Money & Statistical Concepts', completed: true },
      { id: 'cfa_r14', title: 'Probability Distributions & Hypothesis Testing', completed: false }
    ]
  },
  {
    id: 'cfa_6',
    name: 'Economics',
    weightRange: '6-9%',
    readings: [
      { id: 'cfa_r15', title: 'Microeconomics: Demand/Supply & Elasticity', completed: true },
      { id: 'cfa_r16', title: 'Macroeconomics: GDP, Monetary & Fiscal Policy, FX Rates', completed: false }
    ]
  },
  {
    id: 'cfa_7',
    name: 'Corporate Issuers',
    weightRange: '6-9%',
    readings: [
      { id: 'cfa_r17', title: 'Corporate Governance, Stakeholder Mgmt & ESG', completed: true },
      { id: 'cfa_r18', title: 'Working Capital Management & Cost of Capital (WACC)', completed: false }
    ]
  },
  {
    id: 'cfa_8',
    name: 'Derivatives',
    weightRange: '5-8%',
    readings: [
      { id: 'cfa_r19', title: 'Derivative Markets: Forwards, Futures & Swaps', completed: false },
      { id: 'cfa_r20', title: 'Option Basics, Put-Call Parity & Binomial Trees', completed: false }
    ]
  },
  {
    id: 'cfa_9',
    name: 'Alternative Investments',
    weightRange: '5-8%',
    readings: [
      { id: 'cfa_r21', title: 'Private Equity, Real Estate, Hedge Funds & Commodities', completed: false }
    ]
  },
  {
    id: 'cfa_10',
    name: 'Portfolio Management',
    weightRange: '8-12%',
    readings: [
      { id: 'cfa_r22', title: 'Portfolio Risk & Return, Capital Allocation Line', completed: true },
      { id: 'cfa_r23', title: 'CAPM, Security Market Line & Investment Policy Statement (IPS)', completed: false }
    ]
  }
];

const DEFAULT_TIMETABLE: TimetableClass[] = [
  {
    id: 'tt_1',
    moduleName: 'Advanced Corporate Finance',
    type: 'Lecture',
    day: 'Monday',
    startTime: '09:00',
    endTime: '11:00',
    location: 'Teaching & Learning Centre (TLC 101)'
  },
  {
    id: 'tt_2',
    moduleName: 'Financial Reporting & Statement Analysis',
    type: 'Lecture',
    day: 'Tuesday',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Durham Business School - W204'
  },
  {
    id: 'tt_3',
    moduleName: 'Applied Econometrics Lab',
    type: 'Lab',
    day: 'Wednesday',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Computer Lab 3 (Python/Stata)'
  },
  {
    id: 'tt_4',
    moduleName: 'Equity Valuation Seminar',
    type: 'Seminar',
    day: 'Thursday',
    startTime: '11:00',
    endTime: '13:00',
    location: 'Business School Executive Suite'
  },
  {
    id: 'tt_5',
    moduleName: 'CFA Level 1 Study Session',
    type: 'Study Session',
    day: 'Friday',
    startTime: '13:00',
    endTime: '16:00',
    location: 'Bill Bryson Library - Silent Study Room 4'
  }
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export const StudyEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'modules' | 'cfa' | 'timetable'>('modules');

  // Stored state
  const [modules, setModules] = useState<AcademicModule[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_modules`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MODULES;
  });

  const [cfaTopics, setCfaTopics] = useState<CfaTopic[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_cfa`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CFA_TOPICS;
  });

  const [timetable, setTimetable] = useState<TimetableClass[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_timetable`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TIMETABLE;
  });

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_modules`, JSON.stringify(modules));
    } catch {}
  }, [modules]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_cfa`, JSON.stringify(cfaTopics));
    } catch {}
  }, [cfaTopics]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_timetable`, JSON.stringify(timetable));
    } catch {}
  }, [timetable]);

  // Timetable Add Class Form
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClass, setNewClass] = useState<Partial<TimetableClass>>({
    moduleName: '',
    type: 'Lecture',
    day: 'Monday',
    startTime: '09:00',
    endTime: '11:00',
    location: ''
  });

  // CFA overall readiness score
  const cfaProgress = useMemo(() => {
    let total = 0;
    let completed = 0;
    (cfaTopics || []).forEach(t => {
      (t.readings || []).forEach(r => {
        total++;
        if (r.completed) completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [cfaTopics]);

  // Handlers for CFA Checklist
  const handleToggleCfaReading = (topicId: string, readingId: string) => {
    const updated = cfaTopics.map(t => {
      if (t.id === topicId) {
        return {
          ...t,
          readings: t.readings.map(r => r.id === readingId ? { ...r, completed: !r.completed } : r)
        };
      }
      return t;
    });
    setCfaTopics(updated);
  };

  // Handlers for Academic Deliverables
  const handleToggleDeliverable = (moduleId: string, delId: string) => {
    const updated = modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          deliverables: m.deliverables.map(d => d.id === delId ? { ...d, completed: !d.completed } : d)
        };
      }
      return m;
    });
    setModules(updated);
  };

  // Handlers for Timetable
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.moduleName) {
      toast.error('Please enter a module or session name');
      return;
    }

    const item: TimetableClass = {
      id: `tt_${Date.now()}`,
      moduleName: newClass.moduleName,
      type: (newClass.type as any) || 'Lecture',
      day: (newClass.day as any) || 'Monday',
      startTime: newClass.startTime || '09:00',
      endTime: newClass.endTime || '11:00',
      location: newClass.location || 'Durham Business School'
    };

    setTimetable([...timetable, item]);
    toast.success(`Scheduled ${item.moduleName} on ${item.day}`);
    setIsAddClassModalOpen(false);
    setNewClass({
      moduleName: '',
      type: 'Lecture',
      day: 'Monday',
      startTime: '09:00',
      endTime: '11:00',
      location: ''
    });
  };

  const handleDeleteClass = (id: string) => {
    setTimetable(timetable.filter(c => c.id !== id));
    toast.info('Session removed from timetable');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span>Study Engine, CFA Roadmap & Timetable</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Durham University MSc Finance modules, CFA Level 1 10-topic revision matrix, and weekly schedule.
          </p>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'modules' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 inline mr-1.5" />
            MSc Modules ({modules.length})
          </button>
          <button
            onClick={() => setActiveTab('cfa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'cfa' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 inline mr-1.5 text-amber-300" />
            CFA Level 1 ({cfaProgress}%)
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'timetable' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 inline mr-1.5" />
            Weekly Timetable
          </button>
        </div>
      </div>

      {/* VIEW 1: DURHAM MSC ACADEMIC MODULES */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod) => (
              <Card key={mod.id} variant="glass" padding="md" className="border border-white/10 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">{mod.code} • {mod.term} Term</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{mod.name}</h3>
                    </div>
                    <Badge variant={mod.status === 'Completed' ? 'success' : 'info'} size="sm">
                      {mod.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-2">
                    <span>Credits: <strong className="text-slate-200">{mod.credits}</strong></span>
                    <span>•</span>
                    <span>Target: <strong className="text-emerald-400">{mod.targetGrade}</strong></span>
                  </div>
                </div>

                {/* Deliverables Checklist */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                    Assessment & Coursework Deliverables
                  </span>
                  <div className="space-y-1.5">
                    {mod.deliverables.map((del) => (
                      <div
                        key={del.id}
                        onClick={() => handleToggleDeliverable(mod.id, del.id)}
                        className="flex items-center justify-between text-xs font-mono text-slate-300 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {del.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span className={del.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                            {del.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{del.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: CFA LEVEL 1 REVISION MATRIX */}
      {activeTab === 'cfa' && (
        <div className="space-y-6">
          {/* CFA Readiness Summary Banner */}
          <Card variant="glass" padding="md" className="border border-purple-500/30 bg-purple-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-purple-300 uppercase font-semibold block">CFA Program Level 1 Candidate Matrix</span>
                <h3 className="text-lg font-bold font-mono text-white mt-1">10 Core Topic Areas Revision Tracker</h3>
                <p className="text-xs text-slate-400 mt-1">Comprehensive checklist covering all readings, ethics standards, and formula mechanics.</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-amber-300">{cfaProgress}%</div>
                  <span className="text-[10px] font-mono text-slate-400">Total Read / Revised</span>
                </div>
                <div className="w-16 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-amber-400 h-full rounded-full" style={{ width: `${cfaProgress}%` }} />
                </div>
              </div>
            </div>
          </Card>

          {/* CFA 10-Topic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cfaTopics.map((topic) => {
              const topicCompleted = topic.readings.filter(r => r.completed).length;
              const topicTotal = topic.readings.length;
              const topicPct = Math.round((topicCompleted / topicTotal) * 100);

              return (
                <Card key={topic.id} variant="glass" padding="md" className="border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-white">{topic.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">Exam Weight: {topic.weightRange}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {topicCompleted}/{topicTotal} ({topicPct}%)
                    </span>
                  </div>

                  <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${topicPct}%` }} />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {topic.readings.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleToggleCfaReading(topic.id, r.id)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 text-xs font-mono cursor-pointer text-slate-300 transition-colors"
                      >
                        {r.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className={r.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                          {r.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: WEEKLY TIMETABLE GRID */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Monday–Friday Interactive University & Study Schedule
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddClassModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              + Add Class / Session
            </Button>
          </div>

          {/* 5-Day Monday - Friday Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const dayClasses = (timetable || [])
                .filter(c => c.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <Card key={day} variant="glass" padding="sm" className="border border-white/10 flex flex-col gap-3 min-h-[220px]">
                  <div className="text-center pb-2 border-b border-white/10">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      {day}
                    </span>
                  </div>

                  {dayClasses.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 relative group space-y-1">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-xs text-purple-300 font-mono truncate max-w-[110px]">
                          {c.moduleName}
                        </span>
                        <button
                          onClick={() => handleDeleteClass(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition-opacity"
                          title="Remove session"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                        <span>{c.startTime} - {c.endTime}</span>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{c.location}</span>
                      </div>

                      <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                        {c.type}
                      </span>
                    </div>
                  ))}

                  {dayClasses.length === 0 && (
                    <div className="my-auto text-center py-6 text-[11px] font-mono text-slate-600">
                      No classes
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD CLASS MODAL */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <Card variant="glass" padding="lg" className="w-full max-w-md border border-white/20 shadow-2xl">
            <h3 className="text-base font-bold font-mono text-white uppercase mb-4">
              Schedule Academic Class / Study Session
            </h3>

            <form onSubmit={handleAddClass} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Module / Session Title *</label>
                <Input
                  required
                  placeholder="e.g. Econometrics Lab or CFA Review"
                  value={newClass.moduleName}
                  onChange={(e) => setNewClass({ ...newClass, moduleName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Day of Week</label>
                  <select
                    value={newClass.day}
                    onChange={(e) => setNewClass({ ...newClass, day: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  >
                    {DAYS_OF_WEEK.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Session Type</label>
                  <select
                    value={newClass.type}
                    onChange={(e) => setNewClass({ ...newClass, type: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Lecture" className="bg-slate-900">Lecture</option>
                    <option value="Seminar" className="bg-slate-900">Seminar</option>
                    <option value="Lab" className="bg-slate-900">Lab</option>
                    <option value="Study Session" className="bg-slate-900">Study Session</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={newClass.startTime}
                    onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">End Time</label>
                  <Input
                    type="time"
                    value={newClass.endTime}
                    onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Location / Room</label>
                <Input
                  placeholder="e.g. TLC 101 or Online"
                  value={newClass.location}
                  onChange={(e) => setNewClass({ ...newClass, location: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddClassModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add to Timetable
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudyEngine;
