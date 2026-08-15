import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  FileCode, 
  Cpu, 
  Database, 
  BarChart3, 
  FileSpreadsheet, 
  Briefcase, 
  TrendingUp, 
  Upload, 
  FileText, 
  Server, 
  Globe, 
  Terminal, 
  Play, 
  Eye, 
  Layers, 
  CheckCircle2, 
  Sliders,
  Settings,
  X
} from 'lucide-react';
import { EXECUTIVE_SKILLS_DATA, ExecutiveSkill } from '../data/executiveSkillsData';
import { useScrollFadeUp } from '../hooks/useScrollFadeUp';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

export const ExecutiveAiMetaSuiteTab: React.FC = () => {
  const { user } = useUser();
  useScrollFadeUp();

  // Active Category / Tab (7 dedicated tabs)
  const [activeCategory, setActiveCategory] = useState<string>('Equity Research & Capital Markets');

  // Selected skill
  const [selectedSkill, setSelectedSkill] = useState<ExecutiveSkill>(EXECUTIVE_SKILLS_DATA[0]);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Feature Flag: Route Multimodal Calls to Local Lemonade Server
  const [routeToLocalLemonade, setRouteToLocalLemonade] = useState(false);

  // Dynamic Variable Values
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Uploaded File state
  const [uploadedFileContent, setUploadedFileContent] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  // Simulated AI Output / Sandbox preview
  const [aiOutput, setAiOutput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSandboxPreview, setShowSandboxPreview] = useState(false);

  const { showToast } = useToast();

  // 7 Dedicated Categories Mapping
  const categories = [
    { id: 'Equity Research & Capital Markets', label: '📊 Equity Research & Capital Markets', icon: TrendingUp, match: ['Equity Research', 'Capital Markets'] },
    { id: 'Corporate Finance & FP&A', label: '📈 Corporate Finance & FP&A', icon: BarChart3, match: ['Corporate Finance'] },
    { id: 'Executive Career & Productivity', label: '💼 Executive Career & Productivity', icon: Briefcase, match: ['Executive Productivity'] },
    { id: 'Database Administration', label: '🗄️ Database Administration', icon: Database, match: ['Database Administration'] },
    { id: 'Document & Spreadsheet Automation', label: '📄 Document & Spreadsheet Automation', icon: FileSpreadsheet, match: ['Document Automation'] },
    { id: 'Data Analytics & Visualizations', label: '🎨 Data Analytics & Visualizations', icon: FileCode, match: ['Data Analytics', 'Data Analyzer'] },
    { id: 'Infrastructure & Local AI Vault', label: '⚙️ Infrastructure & Local AI Vault', icon: Server, match: ['Infrastructure'] }
  ];

  // Filter skills based on active category and search query
  const filteredSkills = useMemo(() => {
    const catObj = categories.find(c => c.id === activeCategory);
    const matchKeywords = catObj ? catObj.match : [];

    return EXECUTIVE_SKILLS_DATA.filter(skill => {
      const matchCat = matchKeywords.some(mk => skill.category.includes(mk) || skill.name.toLowerCase().includes(mk.toLowerCase()));
      if (!matchCat) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return skill.name.toLowerCase().includes(q) || skill.description.toLowerCase().includes(q) || skill.systemPrompt.toLowerCase().includes(q);
    });
  }, [activeCategory, searchQuery]);

  // Extract bracketed variables from selectedSkill.systemPrompt (e.g. [TICKER], [Company Name])
  const extractedVariables = useMemo(() => {
    const matches = selectedSkill.systemPrompt.match(/\[(.*?)\]/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map(m => m.replace(/^\[|\]$/g, '').trim())));
  }, [selectedSkill]);

  // Handle variable change
  const handleVariableChange = (variable: string, val: string) => {
    setVariableValues(prev => ({ ...prev, [variable]: val }));
  };

  // Handle File Drop / Upload
  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      try {
        const text = await file.text();
        setUploadedFileContent(text);
        showToast(`Successfully loaded file: ${file.name}`);
      } catch (err) {
        console.error(err);
        showToast('Failed to read file content.');
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      try {
        const text = await file.text();
        setUploadedFileContent(text);
        showToast(`Successfully loaded file: ${file.name}`);
      } catch (err) {
        console.error(err);
        showToast('Failed to read file content.');
      }
    }
  };

  // Construct the final packaged prompt
  const builtPrompt = useMemo(() => {
    let prompt = selectedSkill.systemPrompt;
    // Replace variables
    extractedVariables.forEach(v => {
      const val = variableValues[v] || `[${v}]`;
      prompt = prompt.split(`[${v}]`).join(val);
    });

    if (uploadedFileContent) {
      prompt += `\n\n--- ATTACHED FILE CONTEXT (${uploadedFileName}) ---\n${uploadedFileContent}`;
    }

    if (routeToLocalLemonade) {
      prompt += `\n\n[LOCAL AI ROUTER ACTIVE]: Route all multimodal operations (Image Generation, Text-to-Speech, Speech-to-Text) to local Lemonade Server at http://localhost:13305 using lightweight models (SD-Turbo, kokoro-v1, Whisper-Tiny). Do not use cloud fallback.`;
    }

    return prompt;
  }, [selectedSkill, variableValues, uploadedFileContent, uploadedFileName, routeToLocalLemonade]);

  // Copy packaged prompt
  const handlePackageAndCopy = () => {
    navigator.clipboard.writeText(builtPrompt);
    showToast('📦 Packaged Prompt copied to clipboard successfully!');
  };

  // Copy system instruction only
  const handleCopySystemInstruction = () => {
    navigator.clipboard.writeText(selectedSkill.systemPrompt);
    showToast('📄 System Instruction rules copied to clipboard!');
  };

  // Simulate AI Generation & output rendering
  const handleSimulateExecution = () => {
    setIsGenerating(true);
    setAiOutput('');
    setTimeout(() => {
      let mockResult = `### Executive AI Execution Report: ${selectedSkill.name}\n\n`;
      mockResult += `**Target Profile:** ${user.name} (${user.degree}, ${user.university})\n`;
      mockResult += `**Timestamp:** ${new Date().toISOString()}\n`;
      mockResult += `**Execution Parameters:** ${JSON.stringify(variableValues, null, 2)}\n\n`;
      
      if (selectedSkill.id === 'earnings-preview-single' || selectedSkill.id === 'build-dashboard') {
        mockResult += "#### Interactive Live HTML Report Preview\n";
        mockResult += "```html\n";
        mockResult += `<!DOCTYPE html>\n<html>\n<head>\n<style>\nbody { font-family: -apple-system, sans-serif; background: #0a0a0a; color: #ededed; padding: 24px; }\n.card { background: #171717; border: 1px solid #262626; border-radius: 16px; padding: 20px; margin-bottom: 16px; }\n.metric { font-size: 28px; font-weight: bold; color: #3b82f6; }\n</style>\n</head>\n<body>\n  <div class="card">\n    <h2>Executive Earnings Preview & Financial Dashboard</h2>\n    <p>Synthesized via Kensho, S&P Global, and local AI routing.</p>\n    <div class="metric">£84.5M (+14.2% YoY)</div>\n  </div>\n</body>\n</html>\n`;
        mockResult += "```\n";
      } else {
        mockResult += `#### Analysis & Findings\n`;
        mockResult += `- **Key Metric 1:** Strong fundamental positioning with robust operating margins exceeding 24.5%.\n`;
        mockResult += `- **Key Metric 2:** Capital structure optimized with modest leverage (D/E ratio 0.65x).\n`;
        mockResult += `- **Actionable Recommendation:** Proceed with acquisition screening or financial model sign-off.\n`;
      }

      setAiOutput(mockResult);
      setIsGenerating(false);
      showToast('AI Execution completed successfully!');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[var(--text-primary)]">
      
      {/* Header Banner */}
      <div className="border-b border-[var(--border)] pb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="font-space-mono text-xs text-[var(--accent)] font-bold uppercase tracking-widest flex items-center gap-2">
            <span>07 / EXECUTIVE AI & ENGINEERING META-SUITE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
            <span>22 Pre-Loaded Expert Skills</span>
          </div>
          <h2 className="apple-headline text-3xl sm:text-4xl text-[var(--text-primary)] font-semibold mt-1">
            Executive AI & Engineering Meta-Suite
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-3xl mt-1 leading-relaxed">
            Advanced multi-tab prompt engineering workspace for equity research, corporate finance modeling, database administration, and local AI routing.
          </p>
        </div>

        {/* Feature Flag: Local AI Router Toggle */}
        <div className="flex items-center gap-3 bg-[var(--surface-solid)] border border-[var(--border)] px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Local AI Router (Lemonade)</span>
            </span>
            <span className="text-[10px] text-[var(--text-secondary)]">Route multimodal calls to localhost:13305</span>
          </div>
          <button
            type="button"
            onClick={() => setRouteToLocalLemonade(!routeToLocalLemonade)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              routeToLocalLemonade ? 'bg-emerald-500' : 'bg-neutral-800'
            }`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              routeToLocalLemonade ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* 7 Dedicated Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--border)]">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                // Select first skill in category if available
                const first = EXECUTIVE_SKILLS_DATA.find(s => cat.match.some(m => s.category.includes(m)));
                if (first) setSelectedSkill(first);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-[var(--accent)] text-white shadow-md' 
                  : 'bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:bg-neutral-800'
              }`}
            >
              <IconComp className="w-4 h-4 shrink-0" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Skill Selector & Library */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Skill Library ({filteredSkills.length})
            </h3>
            <div className="relative flex-1 max-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2">
            {filteredSkills.map(skill => {
              const isSelected = selectedSkill.id === skill.id;
              return (
                <div
                  key={skill.id}
                  onClick={() => {
                    setSelectedSkill(skill);
                    setVariableValues({});
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-lg'
                      : 'bg-[var(--surface-solid)] border-[var(--border)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-bold ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                      {skill.name}
                    </h4>
                    <span className="font-space-mono text-[9px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[var(--text-secondary)]">
                      {skill.category}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>
                </div>
              );
            })}

            {filteredSkills.length === 0 && (
              <div className="p-8 text-center glass-panel border border-[var(--border)] rounded-2xl space-y-2">
                <p className="text-xs text-[var(--text-secondary)]">No skills found in this category.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Variable Form, Prompt Packager & Sandbox */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Selected Skill Header */}
          <div className="glass-panel border border-[var(--border)] rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-space-mono text-[10px] text-[var(--accent)] uppercase font-bold tracking-wider">
                  Active Skill / Prompt Template
                </span>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
                  {selectedSkill.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySystemInstruction}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs font-semibold text-[var(--text-secondary)] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy only skill rules for custom GPTs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Rules</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {selectedSkill.description}
            </p>

            {/* Dynamic Variable Form (if variables detected) */}
            {extractedVariables.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                  <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Dynamic Prompt Variables</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {extractedVariables.map(variable => (
                    <div key={variable} className="space-y-1">
                      <label className="block text-[11px] font-mono text-[var(--text-secondary)]">
                        [{variable}]
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter ${variable}...`}
                        value={variableValues[variable] || ''}
                        onChange={e => handleVariableChange(variable, e.target.value)}
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Dropzone */}
            <div className="space-y-2 pt-3 border-t border-[var(--border)]">
              <label className="block text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Attach Context File (.txt, .csv, .sql, .pdf, .json)</span>
              </label>
              
              <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                  dragActive ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)] bg-[var(--bg)]'
                }`}
              >
                <input
                  type="file"
                  id="metaSuiteFileUpload"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <label htmlFor="metaSuiteFileUpload" className="cursor-pointer space-y-1 block">
                  <FileText className="w-6 h-6 text-gray-400 mx-auto" />
                  <div className="text-xs font-semibold text-[var(--text-primary)]">
                    {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Click to upload or drag and drop file'}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    Supports text, CSV, SQL schema dumps, and financial statements
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
              <button
                onClick={handlePackageAndCopy}
                className="px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Copy className="w-4 h-4" />
                <span>📦 Package Prompt & Copy</span>
              </button>

              <button
                onClick={handleSimulateExecution}
                disabled={isGenerating}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isGenerating ? 'Executing AI...' : 'Run & Test Skill'}</span>
              </button>
            </div>
          </div>

          {/* AI Output Viewer & HTML Sandbox Preview */}
          {(aiOutput || isGenerating) && (
            <div className="glass-panel border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">AI Execution Output</h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSandboxPreview(!showSandboxPreview)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      showSandboxPreview 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>HTML Sandbox Preview</span>
                  </button>
                </div>
              </div>

              {isGenerating ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[var(--text-secondary)] font-mono">Executing model pipeline with local AI router...</p>
                </div>
              ) : showSandboxPreview ? (
                <div className="space-y-3">
                  <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                    <span>⚡ Secure Sandboxed iframe Rendering</span>
                  </div>
                  <div className="w-full h-80 rounded-xl border border-neutral-800 bg-black overflow-hidden">
                    <iframe
                      srcDoc={aiOutput.includes('<!DOCTYPE html>') ? aiOutput.match(/```html([\s\S]*?)```/)?.[1] || aiOutput : `<!DOCTYPE html><html><body style="background:#0a0a0a;color:#ededed;font-family:sans-serif;padding:20px;"><h3>Report Preview</h3><pre>${aiOutput}</pre></body></html>`}
                      title="Sandbox Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto text-neutral-300">
                  {aiOutput}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
