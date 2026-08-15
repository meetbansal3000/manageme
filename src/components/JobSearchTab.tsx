import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Settings, Search, Clock, MapPin, DollarSign, Send, MessageSquare, ExternalLink, X, Plus, Linkedin, Sparkles, MessageCircle, Upload, FileSpreadsheet, Layers, CheckSquare, Square, Trash2 } from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { JobApplication, JobPreferences } from '../types';
import { useJobs } from '../hooks/useJobs';
import { AddToCalendar } from './AddToCalendar';
import { useScrollLock } from '../hooks/useScrollLock';
import { useModalDismiss } from '../hooks/useModalDismiss';
import { useOwnerSecurity } from '../context/OwnerSecurityContext';
import { AppleEmptyState } from './AppleEmptyState';
import { processAutoImport, ExtractedJobApplication } from '../utils/autoImportPipeline';
import { ImportProgressBar } from './ImportProgressBar';
import { ReviewJobImportModal } from './ReviewJobImportModal';

interface Props {
  userData: UserTrackerData;
  updateData: (d: Partial<UserTrackerData>) => void;
}

const CATEGORIES = ['Asset Management', 'M&A Advisory', 'Audit', 'Tax', 'Corporate Finance'];
const LOCATIONS = ['On-site', 'Hybrid', 'Remote'];

const MOCK_FEED = [
  { id: '1', title: 'M&A Analyst', company: 'Goldman Sachs', platform: 'LinkedIn', date: '2 hours ago', location: 'London (On-site)', salary: '£70k - £90k', urgent: true },
  { id: '2', title: 'Asset Management Associate', company: 'BlackRock', platform: 'Indeed', date: '5 hours ago', location: 'Hybrid', salary: '£85k - £110k', urgent: false },
];

export const JobSearchTab: React.FC<Props> = ({ userData, updateData }) => {
  const { requireOwnerPermission } = useOwnerSecurity();
  const { addJob } = useJobs();
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefs, setPrefs] = useState<JobPreferences>(() => {
    const raw = userData?.jobPreferences;
    return {
      categories: raw?.categories || [],
      locations: raw?.locations || [],
      salaryRange: raw?.salaryRange || '',
      currency: raw?.currency || '£',
      experienceLevel: raw?.experienceLevel || ''
    };
  });
  const [draftModal, setDraftModal] = useState<any>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  // Batch Operations State
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Smart Import Pipeline State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStepMsg, setImportStepMsg] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [extractedReviewJobs, setExtractedReviewJobs] = useState<ExtractedJobApplication[] | null>(null);

  useScrollLock(showPreferences || !!draftModal || isImporting || !!extractedReviewJobs);
  useModalDismiss(showPreferences, () => setShowPreferences(false));
  useModalDismiss(!!draftModal, () => setDraftModal(null));

  const apps = userData.jobApplications || [];
  const columns = ['Potential', 'Applied', 'Interview', 'Offer'] as const;

  // Batch Action Handlers
  const handleToggleSelectApp = (id: string) => {
    setSelectedAppIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAllApps = () => {
    if (selectedAppIds.length === apps.length && apps.length > 0) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(apps.map(a => a.id));
    }
  };

  const handleBulkUpdateStatus = (newStatus: 'Potential' | 'Applied' | 'Interview' | 'Offer') => {
    if (selectedAppIds.length === 0) return;
    requireOwnerPermission(`Bulk Update ${selectedAppIds.length} Applications to ${newStatus}`, () => {
      const updated = apps.map(a => selectedAppIds.includes(a.id) ? { ...a, status: newStatus } : a);
      updateData({ jobApplications: updated });
      setSelectedAppIds([]);
      setIsBatchMode(false);
    });
  };

  const handleBulkDeleteApps = () => {
    if (selectedAppIds.length === 0) return;
    requireOwnerPermission(`Delete ${selectedAppIds.length} Job Applications`, () => {
      const updated = apps.filter(a => !selectedAppIds.includes(a.id));
      updateData({ jobApplications: updated });
      setSelectedAppIds([]);
      setIsBatchMode(false);
    });
  };

  const handleSmartImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setIsImporting(true);
    setImportProgress(10);
    setImportStepMsg('Initializing AI import engine...');

    try {
      const result = await processAutoImport(file, {
        mode: 'jobs',
        onProgress: (percent, msg) => {
          setImportProgress(percent);
          setImportStepMsg(msg);
        }
      });

      if (result.jobApplications && result.jobApplications.length > 0) {
        setExtractedReviewJobs(result.jobApplications);
      } else {
        setExtractedReviewJobs([
          {
            company: 'Target Company',
            role: 'Graduate Role',
            dateApplied: new Date().toISOString().split('T')[0],
            status: 'Applied',
            salary: '£45,000'
          }
        ]);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error during smart import: ' + err.message);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImportedJobs = (finalJobs: ExtractedJobApplication[]) => {
    requireOwnerPermission('Import Job Applications via AI', () => {
      const newApps: JobApplication[] = finalJobs.map(job => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: job.role || 'Job Application',
        company: job.company || 'Company',
        location: job.location || 'London',
        salary: job.salary || 'Competitive',
        platform: 'LinkedIn',
        status: job.status || 'Applied',
        dateAdded: job.dateApplied || new Date().toISOString()
      }));

      newApps.forEach(app => addJob(app));
      updateData({
        jobApplications: [...(userData.jobApplications || []), ...newApps]
      });

      setExtractedReviewJobs(null);
    });
  };

  useEffect(() => {
    if (!userData?.jobPreferences || !Array.isArray(userData.jobPreferences.categories) || userData.jobPreferences.categories.length === 0) {
      setShowPreferences(true);
    }
  }, [userData?.jobPreferences]);

  const savePreferences = () => {
    requireOwnerPermission('Save Job Preferences', () => {
      updateData({ jobPreferences: prefs });
      setShowPreferences(false);
    });
  };

  const togglePref = (type: 'categories' | 'locations', val: string) => {
    const list = prefs[type] || [];
    if (list.includes(val)) {
      setPrefs({ ...prefs, [type]: list.filter(item => item !== val) });
    } else {
      setPrefs({ ...prefs, [type]: [...list, val] });
    }
  };

  const addApplication = (status: 'Potential' | 'Applied' | 'Interview' | 'Offer', job?: any) => {
    requireOwnerPermission('Add Job Application', () => {
      const newApp: JobApplication = {
        id: Date.now().toString(),
        title: job?.title || 'New Job',
        company: job?.company || 'Company',
        location: job?.location || '',
        salary: job?.salary || '',
        platform: job?.platform || 'LinkedIn',
        status,
        dateAdded: new Date().toISOString()
      };
      addJob(newApp);
      updateData({ jobApplications: [...(userData.jobApplications || []), newApp] });
    });
  };

  const draftMessage = async (job: any) => {
    setIsDrafting(true);
    setDraftModal({ job, message: null, loading: true });
    try {
      const res = await fetch('/api/draft-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: job.title, company: job.company })
      });
      const data = await res.json();
      setDraftModal({ job, message: data.message, loading: false });
    } catch (e) {
      console.error(e);
      setDraftModal(null);
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Job Search & Live Tracker</h1>
          <p className="text-[var(--text-secondary)] mt-1">Aggregated feed and Kanban application board.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleSmartImportFile}
            accept="image/*,.csv,.xlsx,.xls,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/30 transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Smart Import</span>
          </button>
          <button onClick={() => setShowPreferences(true)} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-sm font-medium hover:bg-white/5 transition-colors">
            <Settings className="w-4 h-4 text-gray-400" /> Preferences
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Live Feed Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--accent)]" /> Live Feed
            </h2>
          </div>
          
          <div className="space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {MOCK_FEED.map((job) => (
              <div key={job.id} className="glass-panel border border-[var(--border)] rounded-xl p-4 space-y-3 relative overflow-hidden">
                {job.urgent && (
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded-bl-lg">Rolling Deadline</div>
                )}
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                  <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 ${job.platform === 'LinkedIn' ? 'bg-[#0a66c2]/20 text-[#0a66c2]' : 'bg-blue-500/20 text-blue-400'}`}>
                    {job.platform === 'LinkedIn' ? <Linkedin className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />} {job.platform}
                  </span>
                  <span>{job.date}</span>
                </div>
                
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] leading-tight">{job.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{job.company}</p>
                </div>
                
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</div>
                  <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.salary}</div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex flex-wrap gap-2">
                  <button onClick={() => addApplication('Potential', job)} className="flex-1 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold rounded-md hover:bg-[var(--accent)]/20 transition-colors">
                    Save
                  </button>
                  <button onClick={() => draftMessage(job)} className="flex-1 py-1.5 bg-white/5 text-gray-300 text-xs font-semibold rounded-md hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" /> Draft
                  </button>
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('shareToChat', { 
                        detail: { type: 'job', title: job.title, description: `${job.company} - ${job.location}` } 
                      }));
                    }}
                    className="flex-none p-1.5 bg-indigo-500/10 text-indigo-400 rounded-md hover:bg-indigo-500/20 transition-colors"
                    title="Share to Peer Chat"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold">Kanban Status Board</h2>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isBatchMode) {
                  setIsBatchMode(false);
                  setSelectedAppIds([]);
                } else {
                  setIsBatchMode(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                isBatchMode || selectedAppIds.length > 0
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/10'
                  : 'glass-panel border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Toggle Batch Applications Selection"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isBatchMode ? 'Exit Batch' : 'Batch Edit'}</span>
              {selectedAppIds.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500 text-white text-[10px] font-bold">
                  {selectedAppIds.length}
                </span>
              )}
            </button>
          </div>

          {/* Floating / Sticky Batch Actions Bar */}
          {(isBatchMode || selectedAppIds.length > 0) && (
            <div className="p-3.5 rounded-2xl bg-[#141416] border border-purple-500/40 shadow-lg shadow-purple-500/5 transition-all flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSelectAllApps}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold text-xs hover:bg-purple-500/25 transition-colors"
                >
                  {selectedAppIds.length === apps.length && apps.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {selectedAppIds.length === apps.length && apps.length > 0
                      ? 'Deselect All'
                      : `Select All (${apps.length})`}
                  </span>
                </button>

                <span className="text-xs text-[var(--text-secondary)] font-mono">
                  <span className="text-white font-bold">{selectedAppIds.length}</span> selected
                </span>

                {/* Bulk Status Update */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-secondary)]">Move to:</span>
                  <select
                    disabled={selectedAppIds.length === 0}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkUpdateStatus(e.target.value as any);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-2 py-1 bg-[#1c1c1e] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-primary)] disabled:opacity-50 cursor-pointer focus:outline-none"
                  >
                    <option value="" disabled>Change Status...</option>
                    {columns.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedAppIds.length === 0}
                  onClick={handleBulkDeleteApps}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 font-semibold text-xs hover:bg-red-500 hover:text-white disabled:opacity-40 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedAppIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAppIds([]);
                    setIsBatchMode(false);
                  }}
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                  title="Exit Batch Mode"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map(col => (
              <div key={col} className="glass-panel border border-[var(--border)] rounded-2xl p-4 min-h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-gray-300">
                    {col === 'Potential' ? '📌 Potential' : col === 'Applied' ? '📤 Applied' : col === 'Interview' ? '🗣️ Interview' : '🎉 Offer'}
                  </h3>
                  <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-full">{apps.filter(a => a.status === col).length}</span>
                </div>
                
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {apps.filter(a => a.status === col).length === 0 ? (
                    <AppleEmptyState
                      icon={Briefcase}
                      title={`No ${col} Jobs`}
                      description={`Save roles to track your ${col.toLowerCase()} pipeline.`}
                      actionLabel="Add Role"
                      onAction={() => addApplication(col)}
                      className="h-full border-dashed py-8"
                    />
                  ) : (
                    apps.filter(a => a.status === col).map(app => {
                      const isSelected = selectedAppIds.includes(app.id);
                      return (
                        <div 
                          key={app.id} 
                          onClick={(e) => {
                            if (isBatchMode) {
                              e.stopPropagation();
                              handleToggleSelectApp(app.id);
                            }
                          }}
                          className={`p-3 border rounded-xl transition-all space-y-2 relative ${
                            isSelected 
                              ? 'bg-purple-500/10 border-purple-500/60 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/40' 
                              : 'bg-black/20 border-[var(--border)] hover:border-gray-500'
                          } ${isBatchMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold leading-tight text-[var(--text-primary)] flex-1">{app.title}</h4>
                            {(isBatchMode || selectedAppIds.length > 0) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSelectApp(app.id);
                                }}
                                className={`p-1 rounded-md transition-colors shrink-0 ${
                                  isSelected ? 'text-purple-400 bg-purple-500/20' : 'text-gray-500 hover:text-gray-300'
                                }`}
                              >
                                {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{app.company}</p>
                          {app.deadline && (
                            <div className="pt-1">
                              <AddToCalendar 
                                title={`Deadline: ${app.title} at ${app.company}`} 
                                startDate={`${app.deadline}T09:00:00`}
                              />
                            </div>
                          )}
                          
                          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-1">
                            <select 
                              value={app.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const newStatus = e.target.value as any;
                                requireOwnerPermission(`Update Application Status to ${newStatus}`, () => {
                                  const newApps = apps.map(a => a.id === app.id ? { ...a, status: newStatus } : a);
                                  updateData({ jobApplications: newApps });
                                });
                              }}
                              className="bg-transparent text-xs text-[var(--accent)] outline-none cursor-pointer font-medium"
                            >
                              {columns.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                            </select>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                requireOwnerPermission(`Delete ${app.title}`, () => {
                                  const newApps = apps.filter(a => a.id !== app.id);
                                  updateData({ jobApplications: newApps });
                                });
                              }}
                              className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                              title="Delete application"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) setShowPreferences(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md glass-panel border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden max-h-[90vh] flex flex-col">
              <button onClick={() => setShowPreferences(false)} className="absolute top-4 right-4 p-1.5 bg-[var(--surface-solid)] border border-[var(--border)] shadow rounded-full text-gray-400 hover:text-white transition-colors z-20">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold mb-4 pr-8">Job Search Preferences</h2>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar flex-1">
                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => togglePref('categories', c)} className={`px-3 py-1 text-xs rounded-full border ${prefs.categories.includes(c) ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[var(--border)] text-gray-400'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Workplace Type</label>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map(c => (
                      <button key={c} onClick={() => togglePref('locations', c)} className={`px-3 py-1 text-xs rounded-full border ${prefs.locations.includes(c) ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[var(--border)] text-gray-400'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-300 block mb-1">Currency</label>
                    <input type="text" value={prefs.currency} onChange={e => setPrefs({...prefs, currency: e.target.value})} className="w-full bg-black/20 border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-300 block mb-1">Salary Expectation</label>
                    <input type="text" value={prefs.salaryRange} onChange={e => setPrefs({...prefs, salaryRange: e.target.value})} placeholder="e.g. 50k - 70k" className="w-full bg-black/20 border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-1">Experience Level</label>
                  <input type="text" value={prefs.experienceLevel} onChange={e => setPrefs({...prefs, experienceLevel: e.target.value})} placeholder="e.g. Entry Level, Associate" className="w-full bg-black/20 border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-end">
                <button onClick={savePreferences} className="px-5 py-2 bg-[var(--accent)] text-white font-bold rounded-lg hover:brightness-110 transition-colors">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Draft Modal */}
      <AnimatePresence>
        {draftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) setDraftModal(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md glass-panel border border-[var(--border)] rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setDraftModal(null)} className="absolute top-4 right-4 p-1.5 bg-[var(--surface-solid)] border border-[var(--border)] shadow rounded-full text-gray-400 hover:text-white z-20"><X className="w-5 h-5"/></button>
              
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 pr-8"><Sparkles className="w-5 h-5 text-[var(--accent)]"/> Networking Draft</h2>
              
              {draftModal.loading ? (
                <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div></div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-black/20 border border-[var(--border)] p-4 rounded-xl relative">
                    <button 
                      onClick={() => navigator.clipboard.writeText(draftModal.message)}
                      className="absolute top-2 right-2 px-2 py-1 bg-white/10 text-xs rounded hover:bg-white/20 transition-colors"
                    >Copy</button>
                    <p className="text-sm text-gray-300 leading-relaxed pr-8">{draftModal.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 text-center">Drafted by Gemini for {draftModal.job.company}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Smart Import Progress Bar Overlay */}
      <ImportProgressBar
        isProcessing={isImporting}
        progress={importProgress}
        stepMessage={importStepMsg}
        fileName={importFileName}
        title="AI Job Application Import Engine"
        onCancel={() => setIsImporting(false)}
      />

      {/* Review & Confirm Extracted Applications Modal */}
      {extractedReviewJobs && (
        <ReviewJobImportModal
          isOpen={!!extractedReviewJobs}
          onClose={() => setExtractedReviewJobs(null)}
          extractedJobs={extractedReviewJobs}
          onConfirm={handleConfirmImportedJobs}
          sourceFileName={importFileName}
        />
      )}
    </div>
  );
};
