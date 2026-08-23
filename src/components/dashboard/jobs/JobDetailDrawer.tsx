// Component: Slide-Over Job Application Detail Drawer

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Building2, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  Award, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Share2, 
  Edit2, 
  Trash2, 
  Save, 
  User, 
  Link as LinkIcon,
  Tag
} from 'lucide-react';
import { GraduateScheme, TrackerStatus } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { useScrollLock } from '../../../hooks/useScrollLock';

export interface JobDetailDrawerProps {
  job: GraduateScheme | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateJob?: (id: string, updated: Partial<GraduateScheme>) => void;
  onDeleteJob?: (id: string) => void;
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  isOpen,
  onClose,
  onUpdateJob,
  onDeleteJob
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes'>('overview');
  const [notesText, setNotesText] = useState(job?.notes || '');
  const [recruiterContact, setRecruiterContact] = useState(job?.applyVia || '');
  const [isSaved, setIsSaved] = useState(false);

  useScrollLock(isOpen);

  useEffect(() => {
    if (job) {
      setNotesText(job.notes || '');
      setRecruiterContact(job.applyVia || '');
      setIsSaved(false);
    }
  }, [job]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const handleStatusChange = (newStatus: TrackerStatus) => {
    if (onUpdateJob) {
      onUpdateJob(job.id, { status: newStatus });
    }
  };

  const handleSaveNotes = () => {
    if (onUpdateJob) {
      onUpdateJob(job.id, { notes: notesText });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const statusOptions: TrackerStatus[] = [
    'Not Applied',
    'To Apply',
    'Applied',
    'Online Tests',
    'Assessment',
    'Assessment Centre',
    'Video Interview',
    'Interview',
    'Final Interview',
    'Offer 🎉',
    'Rejected ✕'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex justify-end overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-xl bg-[#0D0B18] border-l border-white/10 shadow-2xl h-full flex flex-col z-10 text-white overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0052FF]/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-[#0052FF] shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-white tracking-tight truncate">
                    {job.firm}
                  </h3>
                  <p className="text-sm text-slate-300 truncate">{job.roleTitle}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Selector Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">STAGE:</span>
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(e.target.value as TrackerStatus)}
                  className="bg-white/10 text-white border border-white/15 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-[#0052FF] cursor-pointer"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0D0B18] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                {job.applyVia && (
                  <a
                    href={job.applyVia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#0052FF] hover:bg-[#0045D8] text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Tabs Trigger */}
            <div className="flex gap-2 mt-5 border-t border-white/10 pt-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview & Compensation
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Notes & Interview Prep
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-400" /> Base Salary
                    </span>
                    <p className="text-base font-bold text-white mt-1">{job.salary || 'Competitive'}</p>
                    {job.bonus && (
                      <p className="text-[11px] font-mono text-emerald-400 mt-0.5">+ {job.bonus} Bonus</p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-400" /> Application Closes
                    </span>
                    <p className="text-base font-bold text-white mt-1">{job.appCloses || 'Rolling'}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">Opens: {job.appOpens || 'Open'}</p>
                  </div>
                </div>

                {/* Classification Details */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Scheme Specifications
                  </h4>

                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <span className="text-slate-400">Industry Sector:</span>
                    <span className="text-white font-medium text-right">{job.sector}</span>

                    <span className="text-slate-400">Difficulty Rating:</span>
                    <span className="text-white font-medium text-right">{job.difficulty || 'Medium'}</span>

                    <span className="text-slate-400">ACCA Advantage:</span>
                    <span className="text-emerald-400 font-mono text-right">{job.accaAdvantage || 'High'}</span>

                    <span className="text-slate-400">Filter Risk:</span>
                    <span className="text-amber-400 font-mono text-right">{job.filterRisk || 'Medium'}</span>
                  </div>
                </div>

                {/* Visa & Sponsorship Notes */}
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Award className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-purple-300 uppercase font-mono">
                      Visa & Sponsorship Eligibility
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Tier-2 / Skilled Worker Visa sponsorship eligible for UK graduate intake. Meets the new Home Office minimum salary threshold.
                  </p>
                </div>

                {/* Skills Tags */}
                {job.skills && job.skills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Target Competencies
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Notes Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      Interview Prep & Application Notes
                    </label>
                    {isSaved && (
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={8}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Log technical questions, interview feedback, partner names, commercial awareness bullet points..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0052FF] font-sans leading-relaxed resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveNotes}
                      leftIcon={<Save className="w-3.5 h-3.5" />}
                    >
                      Save Notes
                    </Button>
                  </div>
                </div>

                {/* Recruiter Contact Information */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Recruiter & Point of Contact
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Application Portal:</span>
                      <span className="text-blue-400 truncate max-w-[240px]">
                        {job.applyVia || 'Direct Company Portal'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Date Applied:</span>
                      <span className="text-slate-300 font-mono">
                        {job.dateApplied || 'Not yet submitted'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
            {onDeleteJob && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (confirm(`Remove ${job.firm} application from your pipeline?`)) {
                    onDeleteJob(job.id);
                    onClose();
                  }
                }}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="ml-auto"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default JobDetailDrawer;
