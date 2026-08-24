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

const DEFAULT_MODULES: AcademicModule[] = [];
const DEFAULT_CFA_TOPICS: CfaTopic[] = [];
const DEFAULT_TIMETABLE: TimetableClass[] = [];

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
      location: newClass.location || 'Campus / Online'
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

  // Custom Module Modal State
  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
  const [newModule, setNewModule] = useState<Partial<AcademicModule>>({
    code: '',
    name: '',
    term: 'Autumn',
    credits: 20,
    status: 'In Progress',
    targetGrade: 'First Class (70%+)'
  });

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModule.name || !newModule.code) {
      toast.error('Module code and title are required.');
      return;
    }
    const item: AcademicModule = {
      id: `mod_${Date.now()}`,
      code: newModule.code.toUpperCase(),
      name: newModule.name,
      term: newModule.term || 'Autumn',
      credits: newModule.credits || 20,
      status: (newModule.status as any) || 'In Progress',
      targetGrade: newModule.targetGrade || '70%+',
      deliverables: []
    };
    setModules([...modules, item]);
    toast.success(`Added module ${item.code}: ${item.name}`);
    setIsAddModuleModalOpen(false);
    setNewModule({ code: '', name: '', term: 'Autumn', credits: 20, status: 'In Progress', targetGrade: 'First Class (70%+)' });
  };

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
    toast.info('Academic module removed');
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
            Academic degree modules, CFA Level 1 10-topic revision matrix, and weekly schedule.
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
            Academic Modules ({modules.length})
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

      {/* VIEW 1: ACADEMIC DEGREE MODULES */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Academic Courses, Credits & Deliverables Checklist
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModuleModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              + Add Custom Module
            </Button>
          </div>

          {modules.length === 0 ? (
            <Card variant="glass" padding="lg" className="border border-white/10 text-center py-12 space-y-3">
              <BookOpen className="w-8 h-8 text-purple-400 mx-auto opacity-60" />
              <p className="font-semibold text-white text-sm">
                No academic modules added yet.
              </p>
              <p className="text-xs text-slate-400">
                Click '+ Add Custom Module' above to track your courses, assessments, and grade targets.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((mod) => (
                <Card key={mod.id} variant="glass" padding="md" className="border border-white/10 flex flex-col justify-between space-y-4 relative group">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">{mod.code} • {mod.term} Term</span>
                        <h3 className="text-sm font-bold text-white mt-0.5">{mod.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={mod.status === 'Completed' ? 'success' : 'info'} size="sm">
                          {mod.status}
                        </Badge>
                        <button
                          onClick={() => handleDeleteModule(mod.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity cursor-pointer"
                          title="Delete module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
          )}
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

      {/* ADD CUSTOM MODULE MODAL */}
      {isAddModuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <Card variant="glass" padding="lg" className="w-full max-w-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-base font-bold font-mono text-white uppercase flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>+ Add Custom Academic Module</span>
              </h3>
              <button onClick={() => setIsAddModuleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Module Code *</label>
                  <Input
                    required
                    placeholder="e.g. FIN401 or CS101"
                    value={newModule.code}
                    onChange={(e) => setNewModule({ ...newModule, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Academic Term</label>
                  <Input
                    placeholder="e.g. Autumn / Semester 1"
                    value={newModule.term}
                    onChange={(e) => setNewModule({ ...newModule, term: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Module Title *</label>
                <Input
                  required
                  placeholder="e.g. Corporate Strategy & Financial Markets"
                  value={newModule.name}
                  onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Academic Credits</label>
                  <Input
                    type="number"
                    value={newModule.credits}
                    onChange={(e) => setNewModule({ ...newModule, credits: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Grade</label>
                  <Input
                    placeholder="e.g. Distinction / 75%"
                    value={newModule.targetGrade}
                    onChange={(e) => setNewModule({ ...newModule, targetGrade: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddModuleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Module
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
