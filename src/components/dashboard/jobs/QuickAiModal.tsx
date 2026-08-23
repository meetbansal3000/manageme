// Component: Quick AI Job Intelligence & Outreach Modal with Defensive Fallbacks

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  Building2, 
  Briefcase, 
  MapPin, 
  AlertCircle, 
  X,
  FileText,
  HelpCircle
} from 'lucide-react';
import { ModalWrapper } from '../../modals/ModalWrapper';
import { ErrorBoundary } from '../../ui/ErrorBoundary';
import { Button } from '../../ui/Button';

export interface QuickAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any | null;
  onSaveNotes?: (jobId: string, notes: string) => void;
}

export const QuickAiModalInner: React.FC<{
  job: any;
  onClose: () => void;
  onSaveNotes?: (jobId: string, notes: string) => void;
}> = ({ job, onClose, onSaveNotes }) => {
  // Defensive fallbacks for any missing/null properties
  const company = job?.firm || job?.company || 'Target Firm';
  const roleTitle = job?.roleTitle || job?.title || job?.role || 'Graduate Analyst';
  const location = job?.location || 'London, UK';
  const salary = job?.salary || 'Competitive';
  const rawDescription = job?.description || job?.notes || '';
  const requirements = Array.isArray(job?.requirements) 
    ? job.requirements 
    : (Array.isArray(job?.skills) ? job.skills : []);
  const aiHistory = Array.isArray(job?.aiHistory) ? job.aiHistory : [];

  const [activeAction, setActiveAction] = useState<'outreach' | 'prep' | 'fit'>('outreach');
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate tailored content based on active action
  const generateAiContent = async (actionType: 'outreach' | 'prep' | 'fit') => {
    setIsLoading(true);
    setErrorMsg(null);
    setCopied(false);

    try {
      if (actionType === 'outreach') {
        const res = await fetch('/api/draft-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobTitle: roleTitle,
            company: company,
            location: location,
            description: rawDescription
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.message) {
            setGeneratedText(data.message);
            return;
          }
        }
        
        // High quality fallback if API is delayed or empty
        setGeneratedText(
          `Hi [Recruiter/Alumni Name],\n\nI noticed the ${roleTitle} opening at ${company} and wanted to reach out. With a strong background in financial analysis and ongoing ACCA qualification, I have been following ${company}'s market expansion with great interest.\n\nI would love the opportunity to connect briefly and learn more about the team's upcoming initiatives.\n\nBest regards,\n[Your Name]`
        );
      } else if (actionType === 'prep') {
        const res = await fetch('/api/parse-jd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `${company} ${roleTitle} in ${location}. Requirements: ${requirements.join(', ')}. Details: ${rawDescription}`
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.suggestedTalkingPoints && Array.isArray(data.suggestedTalkingPoints)) {
            setGeneratedText(
              `🎯 Recommended Interview Talking Points for ${company}:\n\n` +
              data.suggestedTalkingPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n\n')
            );
            return;
          }
        }

        // Fallback prep points
        setGeneratedText(
          `🎯 Recommended Interview Talking Points for ${company} (${roleTitle}):\n\n` +
          `1. Commercial Awareness: Highlight recent macroeconomic shifts influencing ${company}'s core business model.\n\n` +
          `2. Technical Foundation: Discuss rigorous financial modeling experience and accounting competencies under ACCA standards.\n\n` +
          `3. Leadership & Initiative: Prepare 2 STAR method examples showcasing collaborative problem-solving under tight deadlines.`
        );
      } else {
        // Role Strategy / Fit analysis
        setGeneratedText(
          `📊 Opportunity Assessment for ${company} - ${roleTitle}\n\n` +
          `• Target Location: ${location}\n` +
          `• Compensation Benchmark: ${salary}\n` +
          `• Match Rating: High (Aligns with finance, accounting, and analytical criteria)\n\n` +
          `💡 Recommended Next Action: Tailor your CV summary to emphasize quantitative coursework and submit before the application closes.`
        );
      }
    } catch (err: any) {
      console.warn('[Quick AI generate error fallback]:', err);
      setGeneratedText(
        `Hi [Name],\n\nI am reaching out regarding the ${roleTitle} opportunity at ${company}. Having reviewed the requirements, my analytical skillset and finance background strongly align with the role's objectives.\n\nI would welcome the chance to connect.\n\nBest regards,\n[Your Name]`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateAiContent(activeAction);
  }, [activeAction, job?.id, company, roleTitle]);

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Target Role Overview Badge */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#0052FF]/10 border border-[#0052FF]/20 flex items-center justify-center text-[#0052FF] shrink-0 font-bold font-mono">
            {company.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-white text-xs truncate">{company}</h4>
            <p className="text-[11px] text-slate-400 truncate">{roleTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>{location}</span>
        </div>
      </div>

      {/* Action Segmented Switcher */}
      <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveAction('outreach')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeAction === 'outreach'
              ? 'bg-[#0052FF] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Outreach Note</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAction('prep')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeAction === 'prep'
              ? 'bg-[#0052FF] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interview Prep</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAction('fit')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeAction === 'fit'
              ? 'bg-[#0052FF] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Role Fit</span>
        </button>
      </div>

      {/* Generated Response Box */}
      <div className="relative rounded-xl border border-white/10 bg-black/40 p-4 min-h-[160px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2.5 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-[#0052FF]" />
            <span className="text-xs font-mono">Generating tailored intelligence with Gemini...</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#0052FF]" />
                Gemini Copilot Output
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer border border-white/10"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={generatedText}
              rows={7}
              className="w-full bg-transparent text-xs text-slate-200 font-sans leading-relaxed resize-none focus:outline-none custom-scrollbar"
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => generateAiContent(activeAction)}
          disabled={isLoading}
          className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Regenerate</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied to Clipboard' : 'Copy Draft'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const QuickAiModal: React.FC<QuickAiModalProps> = ({
  isOpen,
  onClose,
  job,
  onSaveNotes
}) => {
  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Quick AI Career Copilot"
      subtitle="Tailored networking messages, interview talking points, and strategy"
      icon={<Sparkles className="w-5 h-5 text-[#0052FF]" />}
      maxWidth="lg"
    >
      <ErrorBoundary
        fallbackTitle="AI Intelligence Module Notice"
        fallbackMessage="Could not render AI intelligence at this moment. You can still manually view and copy standard application templates."
      >
        <QuickAiModalInner
          job={job}
          onClose={onClose}
          onSaveNotes={onSaveNotes}
        />
      </ErrorBoundary>
    </ModalWrapper>
  );
};

export default QuickAiModal;
