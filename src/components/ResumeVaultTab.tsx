import React, { useState } from 'react';
import { useFirestoreData, ResumeVariant } from '../hooks/useFirestoreData';
import { FileText, Plus, Sparkles, Target, Save, FileDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf'; // I should install jspdf

export default function ResumeVaultTab() {
  const { data, updateData } = useFirestoreData();
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  
  const resumes = data.resumes || [];
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [jdText, setJdText] = useState('');
  const [matchResult, setMatchResult] = useState<{score: number, matched: string[], missing: string[], suggestions: string[]} | null>(null);
  
  const [humanizeResult, setHumanizeResult] = useState<{text: string, aiWords: string[], improvements: string[]} | null>(null);
  const [isHumanizing, setIsHumanizing] = useState(false);

  const activeResume = resumes.find(r => r.id === activeResumeId);

  const handleCreateNew = () => {
    const newResume: ResumeVariant = {
      id: Date.now().toString(),
      name: `Untitled Resume ${resumes.length + 1}`,
      targetRole: 'Target Role',
      content: 'Your resume content here...',
      dateCreated: new Date().toISOString()
    };
    updateData({ resumes: [...resumes, newResume] });
    setActiveResumeId(newResume.id);
  };

  const handleUpdateActive = (updates: Partial<ResumeVariant>) => {
    if (!activeResume) return;
    const updated = resumes.map(r => r.id === activeResume.id ? { ...r, ...updates } : r);
    updateData({ resumes: updated });
  };

  const handleMatchJD = async () => {
    if (!activeResume || !jdText) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/match-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd: jdText, resumeText: activeResume.content })
      });
      const result = await res.json();
      setMatchResult({
        score: result.matchScore,
        matched: result.matchedKeywords || [],
        missing: result.missingKeywords || [],
        suggestions: result.suggestions || []
      });
      
      // Update the resume with the match score
      handleUpdateActive({ matchScore: result.matchScore });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHumanize = async () => {
    if (!activeResume) return;
    setIsHumanizing(true);
    try {
      const res = await fetch('/api/humanize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: activeResume.content })
      });
      const result = await res.json();
      setHumanizeResult({
        text: result.humanizedText,
        aiWords: result.detectedAIWords || [],
        improvements: result.improvements || []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsHumanizing(false);
    }
  };

  const applyHumanizedText = () => {
    if (humanizeResult) {
      handleUpdateActive({ content: humanizeResult.text });
      setHumanizeResult(null);
    }
  };

  const handleExportPDF = async () => {
      // Basic PDF Export for demo purposes
      try {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text(activeResume?.name || 'Resume', 20, 20);
        
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(activeResume?.content || '', 170);
        doc.text(splitText, 20, 30);
        
        doc.save(`${activeResume?.name || 'Resume'}.pdf`);
      } catch (e) {
         alert("Could not load pdf library.");
      }
  };

  return (
    <div className="px-4 sm:px-6 w-full max-w-4xl mx-auto pb-28">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:h-[calc(100vh-140px)]">
        {/* Sidebar: Vault List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 max-h-[250px] md:max-h-none overflow-y-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Resume Vault</h2>
            <button 
              onClick={handleCreateNew}
              className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-colors"
              title="Create New Resume"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            {resumes.map(r => (
              <button
                key={r.id}
                onClick={() => setActiveResumeId(r.id)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  activeResumeId === r.id 
                    ? 'bg-blue-500/20 border-blue-500/50 text-white' 
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <div className="font-semibold truncate">{r.name}</div>
                <div className="text-sm opacity-70 truncate">{r.targetRole}</div>
                {r.matchScore !== undefined && (
                  <div className="mt-2 text-xs font-medium px-2 py-1 bg-black/30 rounded-lg inline-block">
                    Match: {r.matchScore}%
                  </div>
                )}
              </button>
            ))}
            {resumes.length === 0 && (
              <div className="text-center text-white/50 py-8">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No resumes yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden min-h-[400px] md:min-h-0">
          {activeResume ? (
            <>
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20 gap-2">
                <div className="flex flex-col gap-1 w-full max-w-sm">
                  <input 
                    value={activeResume.name}
                    onChange={(e) => handleUpdateActive({ name: e.target.value })}
                    className="bg-transparent text-xl font-bold text-white border-none focus:ring-0 focus:outline-none p-0"
                    placeholder="Resume Name"
                  />
                  <input 
                    value={activeResume.targetRole}
                    onChange={(e) => handleUpdateActive({ targetRole: e.target.value })}
                    className="bg-transparent text-sm text-white/70 border-none focus:ring-0 focus:outline-none p-0"
                    placeholder="Target Role"
                  />
                </div>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors shrink-0"
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <textarea 
                  value={activeResume.content}
                  onChange={(e) => handleUpdateActive({ content: e.target.value })}
                  className="w-full h-full min-h-[300px] md:min-h-[400px] bg-transparent text-white/90 border-none focus:ring-0 focus:outline-none resize-none font-mono text-sm"
                  placeholder="Paste or write your resume content here..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/50 p-8 text-center">
              <Sparkles className="w-12 h-12 mb-4 opacity-30" />
              <p>Select or create a resume to begin.</p>
            </div>
          )}
        </div>

        {/* AI Tools Panel */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            ATS Suite
          </h2>

          {/* Humanizer */}
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <h3 className="font-semibold text-white mb-2">AI Tone Humanizer</h3>
            <p className="text-xs text-white/60 mb-4">Detects and rewrites robotic phrasing.</p>
            <button 
              onClick={handleHumanize}
              disabled={!activeResume || isHumanizing}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 font-medium shadow-sm flex items-center justify-center gap-2"
            >
              {isHumanizing ? 'Analyzing...' : 'Scan & Humanize'}
            </button>

            {humanizeResult && (
              <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex gap-2 items-start mb-2 text-yellow-400 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Detected {humanizeResult.aiWords?.length || 0} AI buzzwords</span>
                </div>
                <div className="text-xs text-white/70 mb-3">{humanizeResult.aiWords?.join(', ') || 'None'}</div>
                
                <div className="text-sm text-white/90 mb-3 line-clamp-3 italic">
                  "{humanizeResult.text}"
                </div>
                
                <button 
                  onClick={applyHumanizedText}
                  className="w-full py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors"
                >
                  Apply Changes
                </button>
              </div>
            )}
          </div>

          {/* JD Matcher */}
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col">
            <h3 className="font-semibold text-white mb-2">JD Matcher</h3>
            <textarea 
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste Job Description..."
              className="w-full min-h-[120px] h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/40 mb-4 resize-y focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors border-solid"
            />
            <button 
              onClick={handleMatchJD}
              disabled={!activeResume || !jdText || isGenerating}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <Target className="w-4 h-4" />
              {isGenerating ? 'Analyzing...' : 'Run Gap Analysis'}
            </button>

            {matchResult && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-sm text-white/70">Match Score</span>
                  <span className={`text-lg font-bold ${(matchResult.score || 0) >= 80 ? 'text-emerald-400' : (matchResult.score || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {matchResult.score || 0}%
                  </span>
                </div>
                
                {(matchResult.missing?.length || 0) > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-red-400 mb-1">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {matchResult.missing?.map(k => (
                        <span key={k} className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs border border-red-500/20">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
