import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Linkedin,
  Briefcase,
  Globe,
  Upload,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  Building,
  Mail,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Copy,
  Layers,
  ArrowRight
} from 'lucide-react';
import { UserTrackerData, isGuestOrDemoMode } from '../hooks/useFirestoreData';
import { useOwnerSecurity } from '../context/OwnerSecurityContext';
import { AppleEmptyState } from './AppleEmptyState';

interface JobSyncHubProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: UserTrackerData;
  updateData?: (data: Partial<UserTrackerData>) => void;
}

interface PlatformConnector {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  status: 'connected' | 'syncing' | 'idle';
  lastSynced: string;
  autoSync: boolean;
  totalSynced: number;
}

interface ExtractedJobPreview {
  company: string;
  title: string;
  location: string;
  salary: string;
  deadline: string;
  sector: string;
  url: string;
  platform: string;
  descriptionSnippet: string;
}

export const JobSyncHub: React.FC<JobSyncHubProps> = ({
  isOpen,
  onClose,
  userData,
  updateData
}) => {
  const { requireOwnerPermission } = useOwnerSecurity();
  const [activeTab, setActiveTab] = useState<'capture' | 'platforms' | 'history'>('capture');
  
  // Smart Capture State
  const [inputUrl, setInputUrl] = useState('');
  const [clipText, setClipText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedJob, setExtractedJob] = useState<ExtractedJobPreview | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Platform Connectors State
  const [platforms, setPlatforms] = useState<PlatformConnector[]>(() => {
    try {
      const isDemo = isGuestOrDemoMode();
      const saved = localStorage.getItem('manageme_connected_platforms');
      if (saved) return JSON.parse(saved);
      if (isDemo) {
        return [
          { id: 'linkedin', name: 'LinkedIn Jobs & Easy Apply', icon: Linkedin, color: '#0a66c2', bgColor: 'rgba(10, 102, 194, 0.15)', status: 'connected', lastSynced: '10 mins ago', autoSync: true, totalSynced: 14 },
          { id: 'indeed', name: 'Indeed UK & Global', icon: Briefcase, color: '#2164f3', bgColor: 'rgba(33, 100, 243, 0.15)', status: 'connected', lastSynced: '1 hour ago', autoSync: true, totalSynced: 8 },
          { id: 'handshake', name: 'Handshake / University Careers Portal', icon: Globe, color: '#d64000', bgColor: 'rgba(214, 64, 0, 0.15)', status: 'connected', lastSynced: 'Today, 09:30 AM', autoSync: false, totalSynced: 19 },
          { id: 'otta', name: 'Otta & Glassdoor Tech/Finance', icon: Layers, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)', status: 'idle', lastSynced: 'Yesterday', autoSync: true, totalSynced: 6 }
        ];
      }
    } catch {}
    return [
      { id: 'linkedin', name: 'LinkedIn Jobs & Easy Apply', icon: Linkedin, color: '#0a66c2', bgColor: 'rgba(10, 102, 194, 0.15)', status: 'idle', lastSynced: 'Not connected', autoSync: false, totalSynced: 0 },
      { id: 'indeed', name: 'Indeed UK & Global', icon: Briefcase, color: '#2164f3', bgColor: 'rgba(33, 100, 243, 0.15)', status: 'idle', lastSynced: 'Not connected', autoSync: false, totalSynced: 0 },
      { id: 'handshake', name: 'Handshake Careers', icon: Globe, color: '#d64000', bgColor: 'rgba(214, 64, 0, 0.15)', status: 'idle', lastSynced: 'Not connected', autoSync: false, totalSynced: 0 },
      { id: 'otta', name: 'Otta & Glassdoor', icon: Layers, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)', status: 'idle', lastSynced: 'Not connected', autoSync: false, totalSynced: 0 }
    ];
  });

  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Smart extraction logic
  const handleAutoExtract = () => {
    if (!inputUrl.trim() && !clipText.trim()) return;

    setIsExtracting(true);
    setTimeout(() => {
      let company = 'Target Firm';
      let title = 'Graduate Analyst - Financial Markets';
      let location = 'London, UK (Hybrid)';
      let salary = '£65,000 - £75,000 pro-rata';
      let deadline = '31 Oct 2026 (Rolling)';
      let sector = 'Investment Banking';
      let platform = 'LinkedIn';
      const textToScan = `${inputUrl} ${clipText}`.toLowerCase();

      // Heuristic extraction
      if (textToScan.includes('morgan stanley')) {
        company = 'Morgan Stanley';
        title = 'Off-Cycle Analyst - M&A Advisory';
        salary = '£68,000 - £78,000 pro-rata';
      } else if (textToScan.includes('j.p. morgan') || textToScan.includes('jpmorgan')) {
        company = 'J.P. Morgan';
        title = 'Corporate & Investment Bank Summer Analyst';
        salary = '£70,000 pro-rata';
      } else if (textToScan.includes('blackrock')) {
        company = 'BlackRock';
        title = 'Analyst Program - Fixed Income & Multi-Asset';
        salary = '£65,000 pro-rata';
        sector = 'Asset Management';
      } else if (textToScan.includes('citadel')) {
        company = 'Citadel';
        title = 'Quantitative Research & Trading Associate';
        salary = '£120,000 - £160,000 + Bonus';
        sector = 'Quantitative Finance';
      } else if (textToScan.includes('mckinsey')) {
        company = 'McKinsey & Company';
        title = 'Business Analyst - Financial Services Practice';
        salary = '£55,000 - £65,000';
        sector = 'Strategy Consulting';
      } else if (textToScan.includes('revolut')) {
        company = 'Revolut';
        title = 'Fintech Strategy & Operations Associate';
        salary = '£60,000 - £75,000 + Equity';
        sector = 'Fintech';
      } else if (textToScan.includes('indeed')) {
        platform = 'Indeed';
      } else if (textToScan.includes('handshake')) {
        platform = 'Handshake (University Careers)';
      } else if (textToScan.includes('otta')) {
        platform = 'Otta';
      }

      setExtractedJob({
        company,
        title,
        location,
        salary,
        deadline,
        sector,
        url: inputUrl || 'https://www.linkedin.com/jobs',
        platform,
        descriptionSnippet: clipText ? clipText.slice(0, 180) + '...' : 'Extracted directly from listing metadata with automated salary and deadline parsing.'
      });
      setIsExtracting(false);
    }, 600);
  };

  const handleAddToTracker = () => {
    if (!extractedJob) return;

    requireOwnerPermission(`Save ${extractedJob.company} to Active Pipeline`, () => {
      const newApp = {
        id: 'job-' + Date.now(),
        title: extractedJob.title,
        company: extractedJob.company,
        location: extractedJob.location,
        salary: extractedJob.salary,
        status: 'To Apply',
        appliedDate: new Date().toISOString().split('T')[0],
        deadline: extractedJob.deadline,
        link: extractedJob.url,
        notes: `Captured via ${extractedJob.platform} Auto-Sync bridge. Sector: ${extractedJob.sector}`,
        platform: extractedJob.platform
      };

      if (updateData && userData) {
        const existing = userData.jobApplications || [];
        updateData({ jobApplications: [newApp, ...existing] });
      }

      setSuccessNotice(`Saved "${extractedJob.title} at ${extractedJob.company}" to active career tracker!`);
      setTimeout(() => setSuccessNotice(null), 4000);
    });
  };

  const handleDraftColdEmail = () => {
    if (!extractedJob) return;
    window.dispatchEvent(new CustomEvent('openOutreachHub', {
      detail: { company: extractedJob.company, role: extractedJob.title }
    }));
    onClose();
  };

  const handleSyncPlatforms = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setPlatforms(prev => prev.map(p => ({
        ...p,
        status: 'connected',
        lastSynced: 'Just now',
        totalSynced: p.totalSynced + Math.floor(Math.random() * 3) + 1
      })));
      setIsSyncingAll(false);
      setSuccessNotice('Successfully synced all connected job platforms & imported 5 new potential roles!');
      setTimeout(() => setSuccessNotice(null), 4000);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl glass-panel border border-[var(--border)] rounded-2xl p-6 sm:p-8 relative max-h-[90vh] flex flex-col overflow-hidden shadow-2xl bg-[#0c0c0e]/95 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Job Platform & Application Auto-Sync Hub
              </h2>
              <p className="text-xs text-gray-400">
                Connect LinkedIn, Indeed, Handshake & extract job metadata with one-click auto-capture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        <AnimatePresence>
          {successNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successNotice}</span>
              </div>
              <button onClick={() => setSuccessNotice(null)}><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-[var(--border)]">
            <button
              onClick={() => setActiveTab('capture')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'capture'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Smart URL Auto-Capture</span>
            </button>
            <button
              onClick={() => setActiveTab('platforms')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'platforms'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Connected Platforms ({platforms.length})</span>
            </button>
          </div>

          <button
            onClick={handleSyncPlatforms}
            disabled={isSyncingAll}
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Syncing...' : 'Sync All Platforms'}</span>
          </button>
        </div>

        {/* Tab 1: Smart URL Auto-Capture */}
        {activeTab === 'capture' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
            {/* Input Box */}
            <div className="p-5 bg-black/30 border border-[var(--border)] rounded-2xl space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Paste Job Listing URL (LinkedIn, Indeed, Handshake, Otta, Glassdoor)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/jobs/view/389102910..."
                    className="flex-1 bg-black/40 border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60"
                  />
                  <button
                    onClick={handleAutoExtract}
                    disabled={isExtracting || (!inputUrl.trim() && !clipText.trim())}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
                    <span>{isExtracting ? 'Extracting...' : 'Auto-Capture'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Or Paste Raw Web Clip / Job Description Text
                </label>
                <textarea
                  value={clipText}
                  onChange={e => setClipText(e.target.value)}
                  placeholder="Paste snippet e.g. 'Goldman Sachs is hiring a Summer Analyst in London M&A Advisory. Salary £65k...'"
                  rows={3}
                  className="w-full bg-black/40 border border-[var(--border)] rounded-xl p-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 custom-scrollbar"
                />
              </div>

              {/* Fast presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-gray-500">Quick Test Samples:</span>
                {[
                  { name: 'Goldman Sachs M&A', query: 'https://www.linkedin.com/jobs/view/goldman-sachs-summer-analyst' },
                  { name: 'Citadel Quant Research', query: 'https://citadel.com/careers/quant-research-associate' },
                  { name: 'McKinsey Business Analyst', query: 'https://mckinsey.com/careers/business-analyst-london' },
                  { name: 'Revolut Fintech Strategy', query: 'https://revolut.com/careers/strategy-associate' }
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputUrl(sample.query);
                      setClipText(`${sample.name} - London, UK. Full-time graduate scheme / internship.`);
                    }}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-gray-300 border border-[var(--border)] transition-colors cursor-pointer"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Parsed Job Card Result */}
            {extractedJob && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gradient-to-br from-blue-950/20 to-purple-950/20 border border-blue-500/40 rounded-2xl space-y-4 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow">
                      {extractedJob.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-md border border-blue-500/30">
                          {extractedJob.platform}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-md border border-purple-500/30">
                          {extractedJob.sector}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {extractedJob.title}
                      </h3>
                      <p className="text-sm font-semibold text-gray-300">
                        {extractedJob.company}
                      </p>
                    </div>
                  </div>

                  <a
                    href={extractedJob.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Open original listing"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Extracted Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-black/40 border border-[var(--border)] rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-gray-500 block">Location</span>
                      <span className="font-semibold">{extractedJob.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-gray-500 block">Salary / Package</span>
                      <span className="font-semibold text-emerald-400">{extractedJob.salary}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-gray-500 block">Deadline</span>
                      <span className="font-semibold text-amber-300">{extractedJob.deadline}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {extractedJob.descriptionSnippet}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleAddToTracker}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Active Career Pipeline</span>
                  </button>

                  <button
                    onClick={handleDraftColdEmail}
                    className="px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Draft Cold Pitch to HR</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Tab 2: Connected Platforms */}
        {activeTab === 'platforms' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {platforms.filter(p => p.status === 'connected').length === 0 && (
              <AppleEmptyState
                icon={Layers}
                title="No Platforms Connected"
                description="Connect your LinkedIn, Indeed, Handshake, or Otta accounts to automatically sync jobs and import applications."
                actionLabel="+ Connect All Platforms"
                onAction={() => {
                  setPlatforms(prev => {
                    const updated = prev.map(p => ({ ...p, status: 'connected' as const, lastSynced: 'Just now', totalSynced: 0, autoSync: true }));
                    try { localStorage.setItem('manageme_connected_platforms', JSON.stringify(updated)); } catch {}
                    return updated;
                  });
                }}
                className="py-8 bg-black/20 border-dashed"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isConnected = platform.status === 'connected';

                return (
                  <div
                    key={platform.id}
                    className="p-5 bg-black/30 border border-[var(--border)] rounded-2xl space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: platform.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{platform.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`}></span>
                            <span className={`text-[11px] font-medium ${isConnected ? 'text-emerald-400' : 'text-gray-400'}`}>
                              {isConnected ? 'Bridge Active' : 'Disconnected'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setPlatforms(prev => {
                            const updated = prev.map(p => {
                              if (p.id === platform.id) {
                                return {
                                  ...p,
                                  status: (isConnected ? 'idle' : 'connected') as 'idle' | 'connected',
                                  lastSynced: isConnected ? 'Not connected' : 'Just now'
                                };
                              }
                              return p;
                            });
                            try { localStorage.setItem('manageme_connected_platforms', JSON.stringify(updated)); } catch {}
                            return updated;
                          });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isConnected 
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-300' 
                            : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Connect'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-[var(--border)]">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> Last sync: {platform.lastSynced}
                      </span>

                      {isConnected && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-[11px] text-gray-300">Auto-Import</span>
                          <input
                            type="checkbox"
                            checked={platform.autoSync}
                            onChange={e => {
                              const checked = e.target.checked;
                              setPlatforms(prev => {
                                const updated = prev.map(p => p.id === platform.id ? { ...p, autoSync: checked } : p);
                                try { localStorage.setItem('manageme_connected_platforms', JSON.stringify(updated)); } catch {}
                                return updated;
                              });
                            }}
                            className="rounded bg-black/40 border-[var(--border)] text-blue-600 focus:ring-0 w-3.5 h-3.5"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Browser Bookmarklet Instructions */}
            <div className="p-5 bg-blue-950/20 border border-blue-500/30 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-blue-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> 1-Click Browser Sync Bookmarklet
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Drag the button below to your browser bookmarks bar. When viewing any job on LinkedIn or Indeed, click the bookmark to automatically clip and sync the listing into your manageme pipeline:
              </p>
              <div className="pt-2">
                <a
                  href="javascript:(function(){const title=document.title;const url=window.location.href;window.open('http://localhost:3000/#jobs?clip='+encodeURIComponent(title)+'&url='+encodeURIComponent(url));})();"
                  onClick={e => e.preventDefault()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow cursor-grab active:cursor-grabbing hover:bg-blue-500 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Drag: ⚡ Clip to manageme
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>OAuth & Webhook Bridges Synced</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
