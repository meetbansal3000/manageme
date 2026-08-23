// Component: Add Job Application Modal with AI Job Description Ingestion

import React, { useState } from 'react';
import { 
  Sparkles, 
  Building2, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  X,
  Plus
} from 'lucide-react';
import { GraduateScheme, TrackerStatus } from '../../../types';
import { ModalWrapper } from '../../modals/ModalWrapper';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

export interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newJob: Omit<GraduateScheme, 'id' | 'rank'>) => void;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [rawJdText, setRawJdText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedSuccess, setExtractedSuccess] = useState(false);

  // Form Fields
  const [firm, setFirm] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [sector, setSector] = useState('Asset Management');
  const [salary, setSalary] = useState('£55,000');
  const [bonus, setBonus] = useState('');
  const [appCloses, setAppCloses] = useState('Rolling');
  const [location, setLocation] = useState('London, UK');
  const [visaSponsorship, setVisaSponsorship] = useState('Eligible (Tier-2 / Skilled Worker)');
  const [applyVia, setApplyVia] = useState('');
  const [notes, setNotes] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [status, setStatus] = useState<TrackerStatus>('To Apply');

  const handleExtractFromJd = async () => {
    if (!rawJdText.trim() || rawJdText.trim().length < 15) {
      setExtractError('Please paste at least a paragraph of the job description or LinkedIn post.');
      return;
    }

    setIsExtracting(true);
    setExtractError(null);
    setExtractedSuccess(false);

    try {
      const res = await fetch('/api/parse-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawJdText })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to parse job description.');
      }

      const data = await res.json();
      
      // Auto-populate extracted fields
      if (data.company) setFirm(data.company);
      if (data.role) setRoleTitle(data.role);
      if (data.location) setLocation(data.location);
      if (data.deadline) setAppCloses(data.deadline);
      if (data.salaryRange) setSalary(data.salaryRange);
      if (data.visaSponsorship) setVisaSponsorship(data.visaSponsorship);
      if (data.keyRequirements && Array.isArray(data.keyRequirements)) {
        setSkills(data.keyRequirements);
      }

      // Build structured notes
      const prepPoints = data.suggestedTalkingPoints && Array.isArray(data.suggestedTalkingPoints)
        ? `\n\n🎯 AI Recommended Interview Talking Points:\n• ${data.suggestedTalkingPoints.join('\n• ')}`
        : '';
      
      const visaNote = data.visaSponsorship ? `\n🛂 Visa: ${data.visaSponsorship}` : '';
      setNotes(`Location: ${data.location || 'London, UK'}${visaNote}${prepPoints}`);

      setExtractedSuccess(true);
      setActiveTab('manual'); // Switch to review form
    } catch (err: any) {
      setExtractError(err.message || 'Error extracting fields from job description.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firm.trim() || !roleTitle.trim()) {
      setExtractError('Firm name and Role Title are required.');
      return;
    }

    const newScheme: Omit<GraduateScheme, 'id' | 'rank'> = {
      firm,
      roleTitle,
      sector,
      salary,
      bonus: bonus || undefined,
      appOpens: 'Open',
      appCloses,
      status,
      applyVia: applyVia || undefined,
      notes,
      skills: skills.length > 0 ? skills : ['Financial Analysis', 'Excel Modeling'],
      difficulty: 'Medium',
      accaAdvantage: 'High',
      filterRisk: 'Low'
    };

    onAdd(newScheme);
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Add Career Application"
      subtitle="Paste a job posting for 1-click AI parsing or enter details manually"
      icon={<Building2 className="w-5 h-5" />}
      maxWidth="2xl"
    >
      {/* Mode Switcher */}
      <div className="flex gap-2 mb-6 p-1 bg-white/5 border border-white/10 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-[#0052FF] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ingest JD with AI
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-[#0052FF] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Review & Manual Form
        </button>
      </div>

      {extractError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{extractError}</span>
        </div>
      )}

      {extractedSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>✨ Gemini extracted all role requirements! Review and customize below.</span>
        </div>
      )}

      {activeTab === 'ai' ? (
        /* AI Raw Text Ingestion View */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
              Paste Raw Job Posting / LinkedIn Description
            </label>
            <textarea
              rows={9}
              value={rawJdText}
              onChange={(e) => setRawJdText(e.target.value)}
              placeholder="Paste job posting text from LinkedIn, eFinancialCareers, or company careers page here..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0052FF] font-mono leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-400 font-mono">
              Extracts company, compensation, deadline, sponsorship & prep talking points.
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={handleExtractFromJd}
              isLoading={isExtracting}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Extract & Auto-Fill
            </Button>
          </div>
        </div>
      ) : (
        /* Review & Manual Details Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Company / Firm"
              placeholder="e.g. Goldman Sachs, PwC"
              value={firm}
              onChange={(e) => setFirm(e.target.value)}
              required
            />
            <Input
              label="Role Title / Scheme"
              placeholder="e.g. 2027 Graduate Analyst - M&A"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wide mb-1.5">
                Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-[#110D26]/80 text-white border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#0052FF]"
              >
                <option value="Asset Management">Asset Management</option>
                <option value="M&A Advisory">M&A Advisory</option>
                <option value="Audit / Advisory">Audit / Advisory</option>
                <option value="Real Estate PE">Real Estate PE</option>
                <option value="Sovereign Wealth">Sovereign Wealth</option>
                <option value="Fund Admin / AM">Fund Admin / AM</option>
                <option value="Corporate Finance">Corporate Finance</option>
              </select>
            </div>

            <Input
              label="Salary Range"
              placeholder="e.g. £55,000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />

            <Input
              label="Deadline / Closes"
              placeholder="e.g. 31 Dec 2026 or Rolling"
              value={appCloses}
              onChange={(e) => setAppCloses(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Office Location"
              placeholder="e.g. London, UK"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              label="Application Portal Link"
              placeholder="https://..."
              value={applyVia}
              onChange={(e) => setApplyVia(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wide mb-1.5">
              Interview Prep Notes & Talking Points
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Technical topics, recruiter notes, commercial awareness talking points..."
              className="w-full bg-[#110D26]/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0052FF] font-sans leading-relaxed resize-none"
            />
          </div>

          {skills.length > 0 && (
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wide mb-1.5">
                Key Extracted Competencies
              </label>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Save Application to Pipeline
            </Button>
          </div>
        </form>
      )}
    </ModalWrapper>
  );
};

export default AddJobModal;
