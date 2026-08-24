// Component: AI Cover Letter & CV Tailor Suite Modal

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Copy, 
  Download, 
  Check, 
  FileText, 
  ListChecks, 
  Target, 
  RefreshCw, 
  Building2, 
  Briefcase,
  AlertCircle,
  Award,
  ChevronRight
} from 'lucide-react';
import { GraduateScheme } from '../../../types';
import { Badge } from '../../ui/Badge';
import { toast } from '../../ui/Toast';

export interface TailorModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: GraduateScheme | null;
}

interface TailoredOutput {
  coverLetter: string;
  cvBulletPoints: string[];
  atsKeywords: {
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  };
}

export const TailorModal: React.FC<TailorModalProps> = ({
  isOpen,
  onClose,
  job
}) => {
  const [activeTab, setActiveTab] = useState<'coverLetter' | 'cvBullets' | 'atsKeywords'>('coverLetter');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [candidateProfile, setCandidateProfile] = useState(
    '[Your Degree/Major] candidate with background in [Your Key Specializations / Certifications].'
  );
  const [tailoredData, setTailoredData] = useState<TailoredOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load cache or generate on open
  useEffect(() => {
    if (isOpen && job) {
      const cacheKey = `manageme_tailor_${job.id}`;
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        try {
          setTailoredData(JSON.parse(saved));
        } catch {
          // ignore error
        }
      } else {
        handleGenerate();
      }
    }
  }, [isOpen, job?.id]);

  if (!isOpen || !job) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tailor-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: job.roleTitle,
          company: job.firm,
          jobDescription: job.description || job.notes || `${job.firm} ${job.roleTitle} ${job.sector}`,
          candidateBackground: candidateProfile
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate tailored application documents.');
      }

      const data: TailoredOutput = await res.json();
      setTailoredData(data);
      localStorage.setItem(`manageme_tailor_${job.id}`, JSON.stringify(data));
      toast.success(`Tailored application ready for ${job.firm}!`);
    } catch (err: any) {
      console.error('[Tailor Modal Error]:', err);
      setError(err.message || 'Error tailoring application. Please try again.');
      toast.error('Tailoring failed: check network or API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadTxt = () => {
    if (!tailoredData) return;

    const content = `=====================================================
MANAGEME OS // AI TAILORED APPLICATION SUITE
=====================================================
Target Firm: ${job.firm}
Target Role: ${job.roleTitle}
Sector: ${job.sector}
Generated: ${new Date().toLocaleDateString('en-GB')}
ATS Match Score: ${tailoredData.atsKeywords?.matchScore || 85}%

-----------------------------------------------------
1. FORMAL UK COVER LETTER
-----------------------------------------------------
${tailoredData.coverLetter}

-----------------------------------------------------
2. TAILORED CV ACHIEVEMENT BULLETS (Google X-Y-Z)
-----------------------------------------------------
${tailoredData.cvBulletPoints?.map((b, i) => `[${i + 1}] ${b}`).join('\n\n')}

-----------------------------------------------------
3. ATS KEYWORD ANALYSIS
-----------------------------------------------------
MATCHED KEYWORDS:
${tailoredData.atsKeywords?.matchedKeywords?.join(', ')}

STRATEGIC MISSING KEYWORDS TO ADDRESS:
${tailoredData.atsKeywords?.missingKeywords?.join(', ')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tailored_${job.firm.replace(/[^a-zA-Z0-9]/g, '_')}_${job.roleTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded application suite .txt');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl max-h-[90vh] bg-[#0c121e] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white font-sans"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-[#0052FF] p-0.5 shrink-0 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">AI Application Tailor Suite</h3>
                <Badge variant="purple" size="sm">UK Standard</Badge>
              </div>
              <p className="text-xs text-slate-400">
                {job.roleTitle} at <span className="text-white font-medium">{job.firm}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Regenerate artifacts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/10 bg-white/[0.01] px-4 sm:px-5">
          <button
            onClick={() => setActiveTab('coverLetter')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'coverLetter'
                ? 'border-[#0052FF] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Cover Letter</span>
          </button>

          <button
            onClick={() => setActiveTab('cvBullets')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'cvBullets'
                ? 'border-[#0052FF] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>CV Bullets</span>
          </button>

          <button
            onClick={() => setActiveTab('atsKeywords')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'atsKeywords'
                ? 'border-[#0052FF] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>ATS Matcher</span>
            {tailoredData?.atsKeywords?.matchScore && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                {tailoredData.atsKeywords.matchScore}%
              </span>
            )}
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-300">Synthesizing job requirements with your candidate profile...</p>
              <p className="text-xs text-slate-500">Generating formal UK cover letter & Google X-Y-Z bullet points</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={handleGenerate}
                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-rose-200 font-semibold"
              >
                Retry
              </button>
            </div>
          ) : !tailoredData ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Click "Regenerate" to generate tailored application assets.
            </div>
          ) : (
            <>
              {/* TAB 1: COVER LETTER */}
              {activeTab === 'coverLetter' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      UK Standard 3-Paragraph High-Impact Letter
                    </div>
                    <button
                      onClick={() => handleCopy(tailoredData.coverLetter, 'coverLetter')}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'coverLetter' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'coverLetter' ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-black/40 border border-white/10 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-[#0052FF]">
                    {tailoredData.coverLetter}
                  </div>
                </div>
              )}

              {/* TAB 2: CV BULLETS */}
              {activeTab === 'cvBullets' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Targeted Achievement Bullet Points (Google X-Y-Z Formula)
                    </div>
                    <button
                      onClick={() => handleCopy(tailoredData.cvBulletPoints.join('\n\n'), 'allBullets')}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'allBullets' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'allBullets' ? 'Copied All' : 'Copy All Bullets'}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tailoredData.cvBulletPoints.map((bullet, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#0052FF]/40 transition-colors group relative"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#0052FF]/20 text-[#0052FF] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                              {bullet}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopy(bullet, `bullet_${idx}`)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                            title="Copy bullet"
                          >
                            {copiedKey === `bullet_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ATS KEYWORDS */}
              {activeTab === 'atsKeywords' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-blue-950/40 border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">
                        ATS Resume Match Score
                      </div>
                      <div className="text-2xl font-black text-white font-mono mt-0.5">
                        {tailoredData.atsKeywords?.matchScore || 88}% Match
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-500/40 flex items-center justify-center font-bold text-sm font-mono text-emerald-300">
                      {tailoredData.atsKeywords?.matchScore || 88}%
                    </div>
                  </div>

                  {/* Matched Keywords */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <Check className="w-4 h-4" />
                      <span>Matched Keywords in Candidate Profile ({tailoredData.atsKeywords?.matchedKeywords?.length || 0})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tailoredData.atsKeywords?.matchedKeywords?.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-medium"
                        >
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>Recommended Missing Keywords from Job Description ({tailoredData.atsKeywords?.missingKeywords?.length || 0})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tailoredData.atsKeywords?.missingKeywords?.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Targeting: {job.firm} • {job.sector}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleDownloadTxt}
              disabled={!tailoredData || isLoading}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>Download .txt Suite</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#0052FF] hover:bg-blue-600 text-xs font-semibold text-white transition-colors cursor-pointer shadow-lg shadow-blue-500/20"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TailorModal;
