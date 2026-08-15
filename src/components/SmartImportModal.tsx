import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  FileSpreadsheet,
  CheckSquare, 
  Briefcase, 
  Target, 
  DollarSign, 
  Sparkles,
  AlertCircle,
  ArrowRight,
  Database
} from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { UniversalTask, GraduateScheme, SkillTask, CourseCertification, Expense } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';
import { useModalDismiss } from '../hooks/useModalDismiss';

export type ImportScope = 'all' | 'tasks' | 'skills' | 'jobs' | 'finance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userData: UserTrackerData;
  updateData: (d: Partial<UserTrackerData>) => void;
  targetScope?: ImportScope;
}

interface ParsedImportResults {
  tasks: UniversalTask[];
  jobs: GraduateScheme[];
  skills: SkillTask[];
  courses: CourseCertification[];
  expenses: Expense[];
  rawSummary: string;
}

export const SmartImportModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  userData, 
  updateData,
  targetScope = 'all'
}) => {
  useScrollLock(isOpen);
  useModalDismiss(isOpen, onClose);

  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResults, setParsedResults] = useState<ParsedImportResults | null>(null);
  const [selectedItems, setSelectedItems] = useState<{ [category: string]: { [id: string]: boolean } }>({
    tasks: {},
    jobs: {},
    skills: {},
    courses: {},
    expenses: {}
  });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const parseCSVText = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i];
      // Basic CSV split ignoring commas inside quotes
      const values = currentLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
    return rows;
  };

  const processFileContent = async (file: File) => {
    setIsProcessing(true);
    const fileName = file.name.toLowerCase();
    const isJson = fileName.endsWith('.json');
    const isCsv = fileName.endsWith('.csv');
    const isTxt = fileName.endsWith('.txt') || fileName.endsWith('.md');

    try {
      let rawText = '';
      if (isJson || isCsv || isTxt) {
        rawText = await file.text();
      } else {
        // Excel or binary format - try reading or send to categorizer API
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/smart-categorizer', {
          method: 'POST',
          body: formData
        }).catch(() => null);

        if (res && res.ok) {
          const apiData = await res.json();
          // Map API data
          const apiTasks: UniversalTask[] = (apiData.checklistItems || apiData.trackerItems || []).map((item: any, idx: number) => ({
            id: `task-imp-${Date.now()}-${idx}`,
            title: item.title || item.name || 'Imported Task',
            priority: (item.priority as any) || 'Medium',
            completed: false,
            category: item.category || 'Work'
          }));
          const apiJobs: GraduateScheme[] = (apiData.trackerItems || []).map((item: any, idx: number) => ({
            id: `job-imp-${Date.now()}-${idx}`,
            rank: idx + 1,
            firm: item.firm || item.company || 'Company',
            roleTitle: item.role || item.title || 'Role',
            sector: item.sector || 'Asset Management',
            appOpens: 'Open',
            appCloses: item.deadline || 'Rolling',
            salary: 'Competitive',
            notes: item.notes || 'Imported via Smart Sync',
            status: 'Applied'
          }));

          const results: ParsedImportResults = {
            tasks: apiTasks,
            jobs: apiJobs,
            skills: [],
            courses: [],
            expenses: [],
            rawSummary: `Parsed ${apiTasks.length} tasks and ${apiJobs.length} roles from ${file.name}`
          };
          applyParsedResults(results);
          setIsProcessing(false);
          return;
        } else {
          rawText = await file.text().catch(() => '');
        }
      }

      // Client-side heuristics and parsing
      const tasks: UniversalTask[] = [];
      const jobs: GraduateScheme[] = [];
      const skills: SkillTask[] = [];
      const courses: CourseCertification[] = [];
      const expenses: Expense[] = [];

      if (isJson) {
        try {
          const parsed = JSON.parse(rawText);
          const list = Array.isArray(parsed) ? parsed : (parsed.items || parsed.tasks || parsed.data || [parsed]);
          
          list.forEach((item: any, idx: number) => {
            const title = item.title || item.name || item.task || item.role || item.firm || 'Item';
            if (targetScope === 'jobs' || item.firm || item.company || item.salary) {
              jobs.push({
                id: `job-imp-${Date.now()}-${idx}`,
                rank: idx + 1,
                firm: item.firm || item.company || 'Enterprise',
                roleTitle: item.role || item.title || 'Analyst',
                sector: item.sector || 'Asset Management',
                appOpens: 'Open',
                appCloses: item.deadline || item.appCloses || 'Rolling',
                salary: item.salary || 'Competitive',
                notes: item.notes || 'Imported via Smart Sync',
                status: 'Applied'
              });
            } else if (targetScope === 'skills' || item.skill || item.provider || item.certification) {
              if (item.provider || item.progress !== undefined) {
                courses.push({
                  id: `course-imp-${Date.now()}-${idx}`,
                  title: title,
                  provider: item.provider || 'Coursera',
                  status: item.status || 'In Progress',
                  progress: typeof item.progress === 'number' ? item.progress : 50
                });
              } else {
                skills.push({
                  id: `skill-imp-${Date.now()}-${idx}`,
                  name: title,
                  category: item.category || 'Technical',
                  status: item.completed ? 'Done' : 'In Progress',
                  proficiency: 'Intermediate'
                });
              }
            } else {
              tasks.push({
                id: `task-imp-${Date.now()}-${idx}`,
                title: title,
                priority: (item.priority as any) || 'Medium',
                dueDate: item.dueDate || item.date || '',
                completed: !!item.completed,
                category: item.category || 'General'
              });
            }
          });
        } catch (e) {
          console.warn('JSON parse error, falling back to line parser', e);
        }
      } else if (isCsv) {
        const rows = parseCSVText(rawText);
        rows.forEach((row, idx) => {
          const title = row.title || row.task || row.name || row.role || row.item || row['to do'] || 'Item';
          if (!title || title === 'title') return;

          if (targetScope === 'jobs' || row.firm || row.company || row.employer) {
            jobs.push({
              id: `job-imp-${Date.now()}-${idx}`,
              rank: idx + 1,
              firm: row.firm || row.company || row.employer || 'Company',
              roleTitle: row.role || row.position || title,
              sector: row.sector || 'Asset Management',
              appOpens: 'Open',
              appCloses: row.deadline || row['due date'] || 'Rolling',
              salary: row.salary || 'Competitive',
              notes: row.notes || 'Imported via CSV',
              status: 'Applied'
            });
          } else if (targetScope === 'skills' || row.skill || row.provider || row.course) {
            if (row.provider || row.progress) {
              courses.push({
                id: `course-imp-${Date.now()}-${idx}`,
                title: row.course || row.title || title,
                provider: row.provider || 'Online Provider',
                status: 'In Progress',
                progress: parseInt(row.progress) || 25
              });
            } else {
              skills.push({
                id: `skill-imp-${Date.now()}-${idx}`,
                name: title,
                category: row.category || 'Technical',
                status: row.completed === 'true' || row.status === 'done' ? 'Done' : 'In Progress',
                proficiency: 'Intermediate'
              });
            }
          } else if (row.amount || row.price || row.cost) {
            expenses.push({
              id: `exp-imp-${Date.now()}-${idx}`,
              category: row.category || 'General',
              amount: parseFloat(row.amount || row.price || row.cost || '0') || 0,
              date: row.date || new Date().toISOString().split('T')[0],
              description: title
            });
          } else {
            tasks.push({
              id: `task-imp-${Date.now()}-${idx}`,
              title: title,
              priority: (row.priority?.toLowerCase() === 'high' ? 'High' : row.priority?.toLowerCase() === 'low' ? 'Low' : 'Medium'),
              dueDate: row['due date'] || row.date || row.deadline || '',
              completed: row.completed === 'true' || row.status === 'done',
              category: row.category || 'General'
            });
          }
        });
      } else {
        // Plain text / Markdown line parser
        const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
        lines.forEach((line, idx) => {
          let cleanText = line.replace(/^[-*+]\s*(\[[ xX]\]\s*)?/, '').trim();
          const isDone = line.includes('[x]') || line.includes('[X]');
          if (!cleanText) return;

          if (targetScope === 'jobs') {
            jobs.push({
              id: `job-imp-${Date.now()}-${idx}`,
              rank: idx + 1,
              firm: cleanText.split('-')[0]?.trim() || cleanText,
              roleTitle: cleanText.split('-')[1]?.trim() || 'Role',
              sector: 'Asset Management',
              appOpens: 'Open',
              appCloses: 'Rolling',
              salary: 'Competitive',
              notes: 'Imported via Text/Notion List',
              status: 'Applied'
            });
          } else if (targetScope === 'skills') {
            skills.push({
              id: `skill-imp-${Date.now()}-${idx}`,
              name: cleanText,
              category: 'Technical',
              status: isDone ? 'Done' : 'In Progress',
              proficiency: 'Intermediate'
            });
          } else {
            tasks.push({
              id: `task-imp-${Date.now()}-${idx}`,
              title: cleanText,
              priority: cleanText.toLowerCase().includes('urgent') || cleanText.toLowerCase().includes('high') ? 'High' : 'Medium',
              completed: isDone,
              category: 'Work'
            });
          }
        });
      }

      const results: ParsedImportResults = {
        tasks,
        jobs,
        skills,
        courses,
        expenses,
        rawSummary: `Parsed ${tasks.length} tasks, ${jobs.length} jobs, ${skills.length + courses.length} skills from ${file.name}`
      };

      applyParsedResults(results);
    } catch (err) {
      console.error('File parsing error:', err);
      alert('Error parsing uploaded file format. Please check the structure and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyParsedResults = (results: ParsedImportResults) => {
    setParsedResults(results);

    // Default all items to checked
    const initialSelection: { [cat: string]: { [id: string]: boolean } } = {
      tasks: {},
      jobs: {},
      skills: {},
      courses: {},
      expenses: {}
    };

    results.tasks.forEach(t => initialSelection.tasks[t.id] = true);
    results.jobs.forEach(j => initialSelection.jobs[j.id] = true);
    results.skills.forEach(s => initialSelection.skills[s.id] = true);
    results.courses.forEach(c => initialSelection.courses[c.id] = true);
    results.expenses.forEach(e => initialSelection.expenses[e.id] = true);

    setSelectedItems(initialSelection);
  };

  const toggleItemSelection = (category: string, id: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: !prev[category]?.[id]
      }
    }));
  };

  const handleConfirmSave = () => {
    if (!parsedResults) return;

    const filteredTasks = parsedResults.tasks.filter(t => selectedItems.tasks[t.id]);
    const filteredJobs = parsedResults.jobs.filter(j => selectedItems.jobs[j.id]);
    const filteredSkills = parsedResults.skills.filter(s => selectedItems.skills[s.id]);
    const filteredCourses = parsedResults.courses.filter(c => selectedItems.courses[c.id]);
    const filteredExpenses = parsedResults.expenses.filter(e => selectedItems.expenses[e.id]);

    const updatedData: Partial<UserTrackerData> = {};

    if (filteredTasks.length > 0) {
      updatedData.universalTasks = [...(userData.universalTasks || []), ...filteredTasks];
      localStorage.setItem('manageme_universal_tasks', JSON.stringify(updatedData.universalTasks));
    }
    if (filteredJobs.length > 0) {
      updatedData.gradSchemes = [...(userData.gradSchemes || []), ...filteredJobs];
    }
    if (filteredSkills.length > 0) {
      updatedData.skillsTracker = [...(userData.skillsTracker || []), ...filteredSkills];
    }
    if (filteredCourses.length > 0) {
      updatedData.courses = [...(userData.courses || []), ...filteredCourses];
    }
    if (filteredExpenses.length > 0) {
      updatedData.expenses = [...(userData.expenses || []), ...filteredExpenses];
    }

    updateData(updatedData);
    setParsedResults(null);
    onClose();
  };

  const totalItemsCount = parsedResults ? (
    parsedResults.tasks.length +
    parsedResults.jobs.length +
    parsedResults.skills.length +
    parsedResults.courses.length +
    parsedResults.expenses.length
  ) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-neutral-950/95 border border-white/15 rounded-3xl p-6 sm:p-8 relative shadow-2xl space-y-6 text-white max-h-[90vh] flex flex-col justify-between"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Universal Smart Import & File Sync</h2>
              <p className="text-xs text-neutral-400">
                Upload CSV, JSON, TXT, or Excel files to automatically sync tasks, applications, and skill certs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-5">
          {!parsedResults ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.[0]) processFileContent(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
                dragOver 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-white/15 bg-neutral-900/50 hover:border-white/30 hover:bg-neutral-900/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt,.xlsx,.xls,.tsv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) processFileContent(e.target.files[0]);
                }}
              />

              <div className="w-16 h-16 rounded-full bg-blue-600/15 text-blue-400 flex items-center justify-center">
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">
                  {isProcessing ? 'Analyzing & Structuring File...' : 'Drop your file here or click to browse'}
                </h3>
                <p className="text-xs text-neutral-400">
                  Supports CSV spreadsheets, JSON exports, Notion To-Do lists (.txt), and Excel workbooks.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-white/5 border border-white/10 text-neutral-300">
                  .CSV
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-white/5 border border-white/10 text-neutral-300">
                  .JSON
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-white/5 border border-white/10 text-neutral-300">
                  .TXT
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-white/5 border border-white/10 text-neutral-300">
                  .XLSX
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Summary Banner */}
              <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Detected {totalItemsCount} Importable Rows</h4>
                    <p className="text-[11px] text-neutral-400">{parsedResults.rawSummary}</p>
                  </div>
                </div>
                <button
                  onClick={() => setParsedResults(null)}
                  className="text-xs text-neutral-400 hover:text-white underline font-mono"
                >
                  Upload different file
                </button>
              </div>

              {/* Tasks Preview List */}
              {parsedResults.tasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tasks & To-Dos ({parsedResults.tasks.length})</span>
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                    {parsedResults.tasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => toggleItemSelection('tasks', t.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                          selectedItems.tasks[t.id]
                            ? 'bg-blue-600/15 border-blue-500/40 text-white'
                            : 'bg-black/30 border-white/5 text-neutral-500 line-through'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!selectedItems.tasks[t.id]}
                            onChange={() => {}}
                            className="rounded border-white/20 text-blue-600"
                          />
                          <span className="font-semibold">{t.title}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10">
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jobs / Applications Preview List */}
              {parsedResults.jobs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                      <span>Job Applications ({parsedResults.jobs.length})</span>
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                    {parsedResults.jobs.map(j => (
                      <div
                        key={j.id}
                        onClick={() => toggleItemSelection('jobs', j.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                          selectedItems.jobs[j.id]
                            ? 'bg-purple-600/15 border-purple-500/40 text-white'
                            : 'bg-black/30 border-white/5 text-neutral-500 line-through'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!selectedItems.jobs[j.id]}
                            onChange={() => {}}
                            className="rounded border-white/20 text-purple-600"
                          />
                          <span className="font-semibold">{j.firm} — {j.roleTitle}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10">
                          {j.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills & Certs Preview List */}
              {(parsedResults.skills.length > 0 || parsedResults.courses.length > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Skills & Certifications ({parsedResults.skills.length + parsedResults.courses.length})</span>
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                    {parsedResults.skills.map(s => (
                      <div
                        key={s.id}
                        onClick={() => toggleItemSelection('skills', s.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                          selectedItems.skills[s.id]
                            ? 'bg-emerald-600/15 border-emerald-500/40 text-white'
                            : 'bg-black/30 border-white/5 text-neutral-500 line-through'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!selectedItems.skills[s.id]}
                            onChange={() => {}}
                            className="rounded border-white/20 text-emerald-600"
                          />
                          <span className="font-semibold">{s.name}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10">
                          {s.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {parsedResults && (
            <button
              onClick={handleConfirmSave}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Save to Workspace</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
