import React, { useState } from 'react';
import { 
  Share2, 
  CheckCircle2, 
  ExternalLink,
  CheckSquare,
  Plus,
  Trash2,
  Pencil,
  Clock,
  Calendar,
  AlertCircle,
  Tag,
  Filter,
  Check,
  X,
  Sparkles,
  Layers,
  ListTodo,
  Download,
  FileDown,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NoteSection, UniversalTask, TaskPriority, ChecklistItem } from '../types';
import { getAccessToken } from '../firebase';
import { SwipeableCard } from './SwipeableCard';
import { useScrollFadeUp } from "../hooks/useScrollFadeUp";
import { useScrollLock } from '../hooks/useScrollLock';
import { useModalDismiss } from '../hooks/useModalDismiss';
import { ImportChecklistModal } from './ImportChecklistModal';
import { useOwnerSecurity } from '../context/OwnerSecurityContext';
import { useToast } from '../context/ToastContext';
import { AppleEmptyState } from './AppleEmptyState';

interface KeyNotesChecklistTabProps {
  notesSections: NoteSection[];
  onToggleItem: (secId: string, itemId: string) => void;
  onUpdateNotesSections?: (newSections: NoteSection[]) => void;
  searchQuery: string;
  universalTasks?: UniversalTask[];
  onUpdateTasks?: (tasks: UniversalTask[]) => void;
}

const TASK_CATEGORIES = [
  'All',
  'Finance',
  'Study',
  'Apps',
  'Academics / Exams',
  'Job Applications',
  'Arrival Checklist',
  'Finance & Shifts',
  'Interview Prep',
  'Personal / Admin'
];

export const KeyNotesChecklistTab: React.FC<KeyNotesChecklistTabProps> = ({
  notesSections = [],
  onToggleItem,
  onUpdateNotesSections,
  searchQuery,
  universalTasks = [],
  onUpdateTasks
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'checklists'>('tasks');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('All');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [isSyncing, setIsSyncing] = useState(false);

  // Quick Add State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('High');
  const [quickCategory, setQuickCategory] = useState('Job Applications');
  const [quickDueDate, setQuickDueDate] = useState('2026-10-06');
  const [quickNotes, setQuickNotes] = useState('');

  // Task Edit Modal State
  const [editingTask, setEditingTask] = useState<UniversalTask | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UniversalTask>>({});

  // Add Item to Checklist Section Modal
  const [addingToSectionId, setAddingToSectionId] = useState<string | null>(null);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistDetails, setNewChecklistDetails] = useState('');
  const [newChecklistUrgent, setNewChecklistUrgent] = useState(false);

  const { showToast } = useToast();

  // Import Checklist Modal State
  const [importingSectionId, setImportingSectionId] = useState<string | null>(null);

  useScrollLock(!!editingTask || !!addingToSectionId || !!importingSectionId);
  useModalDismiss(!!editingTask, () => setEditingTask(null));
  useModalDismiss(!!addingToSectionId, () => setAddingToSectionId(null));
  useModalDismiss(!!importingSectionId, () => setImportingSectionId(null));

  // --- IMPORT CHECKLIST HANDLER ---
  const handleImportChecklist = (
    targetSectionId: string, 
    importedItems: ChecklistItem[], 
    mode: 'append' | 'overwrite'
  ) => {
    const sectionIndex = notesSections.findIndex(s => s.id === targetSectionId);
    if (sectionIndex === -1) return;

    const targetSec = notesSections[sectionIndex];
    const newItems = mode === 'overwrite' 
      ? importedItems 
      : [...(targetSec.items || []), ...importedItems];

    const updatedSections = notesSections.map(s => 
      s.id === targetSectionId ? { ...s, items: newItems } : s
    );

    if (onUpdateNotesSections) {
      onUpdateNotesSections(updatedSections);
    } else {
      // Direct state mutation fallback for in-place updates
      targetSec.items = newItems;
      try {
        const stored = localStorage.getItem('manageme_career_tracker_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.notesSections = updatedSections;
          localStorage.setItem('manageme_career_tracker_v1', JSON.stringify(parsed));
        }
      } catch (err) {
        console.error('LocalStorage sync error:', err);
      }
    }

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`Successfully imported ${importedItems.length} items into "${targetSec.title}"!`);
  };

  // --- TASK ENGINE CRUD HANDLERS ---
  const { requireOwnerPermission } = useOwnerSecurity();

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    requireOwnerPermission('Create New Master Task', () => {
      const newTask: UniversalTask = {
        id: `task-${Date.now()}`,
        title: quickTitle.trim(),
        priority: quickPriority,
        category: quickCategory,
        dueDate: quickDueDate || undefined,
        completed: false,
        notes: quickNotes.trim() || undefined
      };

      if (onUpdateTasks) {
        onUpdateTasks([newTask, ...universalTasks]);
      }

      showToast(`Added "${newTask.title}" [${newTask.category}] to Tasks`, 'success');
      setQuickTitle('');
      setQuickNotes('');
    });
  };

  const handleToggleTask = (id: string) => {
    if (!onUpdateTasks) return;
    const task = universalTasks.find(t => t.id === id);
    const willComplete = task ? !task.completed : false;

    requireOwnerPermission(`Update Task Status to ${willComplete ? 'Completed' : 'Pending'}`, () => {
      if (willComplete) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }

      onUpdateTasks(
        universalTasks.map(t => t.id === id ? {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : undefined
        } : t)
      );

      showToast(willComplete ? 'Task marked as completed 🎉' : 'Task marked as pending', 'info');
    });
  };

  const handleDeleteTask = (id: string) => {
    if (!onUpdateTasks) return;
    requireOwnerPermission('Delete Task Item', () => {
      onUpdateTasks(universalTasks.filter(t => t.id !== id));
    });
  };

  const handleOpenEditTask = (task: UniversalTask) => {
    requireOwnerPermission('Edit Task Details', () => {
      setEditingTask(task);
      setEditFormData({ ...task });
    });
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editFormData.title || !onUpdateTasks) return;

    requireOwnerPermission('Save Task Edits', () => {
      onUpdateTasks(
        universalTasks.map(t => t.id === editingTask.id ? { ...t, ...editFormData } as UniversalTask : t)
      );
      setEditingTask(null);
    });
  };

  // --- CHECKLIST ADD HANDLERS ---

  const handleAddChecklistItem = (secId: string) => {
    if (!newChecklistTitle.trim()) return;
    const section = notesSections.find(s => s.id === secId);
    if (!section) return;

    requireOwnerPermission('Add Checklist Item', () => {
      const newItem = {
        id: `chk-${Date.now()}`,
        title: newChecklistTitle.trim(),
        details: newChecklistDetails.trim() || 'Added by user',
        completed: false,
        isUrgent: newChecklistUrgent
      };

      section.items.push(newItem);
      setAddingToSectionId(null);
      setNewChecklistTitle('');
      setNewChecklistDetails('');
      setNewChecklistUrgent(false);
    });
  };

  // --- GOOGLE TASKS SYNC ---

  const handleSyncTasks = async () => {
    setIsSyncing(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        alert("Please sign in to Google to sync with Tasks.");
        setIsSyncing(false);
        return;
      }
      
      const listRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listData = await listRes.json();
      
      let listId = listData.items?.find((l: any) => l.title === 'manageme Master Tasks')?.id;
      if (!listId) {
        const createListRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'manageme Master Tasks' })
        });
        const newList = await createListRes.json();
        listId = newList.id;
      }
      
      let syncedCount = 0;
      for (const task of universalTasks) {
        if (!task.completed) {
          await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              title: `[${task.priority}] ${task.title}`, 
              notes: `${task.category ? `Category: ${task.category}\n` : ''}${task.notes || ''}` 
            })
          });
          syncedCount++;
        }
      }
      alert(`Successfully synced ${syncedCount} pending tasks to Google Tasks!`);
    } catch (e) {
      console.error(e);
      alert('Failed to sync with Google Tasks.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleShare = () => {
    const payload = {
      universalTasks,
      notesSections
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    alert('Tasks & Checklist data copied to clipboard as JSON!');
  };

  useScrollFadeUp([universalTasks, notesSections, activeTab, taskCategoryFilter, taskStatusFilter]);

  const filteredTasks = universalTasks.filter(t => {
    const matchesCategory = taskCategoryFilter === 'All' || t.category === taskCategoryFilter;
    const matchesStatus = taskStatusFilter === 'All' ? true : 
                          taskStatusFilter === 'Active' ? !t.completed : t.completed;
    if (!matchesCategory || !matchesStatus) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  });

  const activeCount = universalTasks.filter(t => !t.completed).length;
  const completedCount = universalTasks.filter(t => t.completed).length;
  const highPriorityCount = universalTasks.filter(t => !t.completed && t.priority === 'High').length;

  const getPriorityBadgeStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="border-b border-[var(--border)] pb-6 flex flex-col lg:flex-row justify-between items-start gap-8 w-full">
        <div className="flex-1">
          <div className="font-space-mono text-xs text-[var(--accent)] font-bold uppercase tracking-widest flex items-center gap-2">
            <span>05 / EXECUTION & CHECKLISTS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
            <span>{activeCount} Active Tasks</span>
          </div>
          <h2 className="apple-headline text-3xl sm:text-4xl text-[var(--text-primary)] font-semibold mt-1">
            Universal Tasks & Master Checklist
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mt-1 leading-relaxed">
            Manage your daily to-dos, academic deadlines, work shifts, and recruitment milestones with priority tagging and Google Tasks synchronization.
          </p>
        </div>

        {/* Top Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3 self-start mt-4 lg:mt-0">
          <div className="flex p-1 rounded-xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'tasks' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" /> Todo Engine ({universalTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('checklists')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'checklists' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Master Sections
            </button>
          </div>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openSmartImport', { detail: { scope: 'tasks' } }))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold text-blue-300 transition-colors cursor-pointer"
            title="Import tasks from CSV, JSON, TXT or Excel"
          >
            <Upload className="w-3.5 h-3.5" /> Smart Import / File Sync
          </button>

          <button 
            onClick={handleSyncTasks} 
            disabled={isSyncing} 
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel border border-[var(--border)] text-xs font-semibold text-blue-400 hover:bg-blue-400/10 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" /> {isSyncing ? 'Syncing...' : 'G-Tasks Sync'}
          </button>

          <button onClick={handleShare} className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] hover:bg-white/5 transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. UNIVERSAL TODO ENGINE VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          
          {/* Quick-Add Task Input Bar */}
          <div className="p-5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" /> Quick Add Task
              </h3>
              {highPriorityCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold">
                  {highPriorityCount} High Priority Pending
                </span>
              )}
            </div>

            <form onSubmit={handleAddTask} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="What needs to get done? (e.g. Register for professional exam, Book BRP collection, Practice SHL test...)"
                  value={quickTitle}
                  onChange={e => setQuickTitle(e.target.value)}
                  className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />

                <select
                  value={quickPriority}
                  onChange={e => setQuickPriority(e.target.value as TaskPriority)}
                  className={`bg-[var(--bg)] border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none ${getPriorityBadgeStyle(quickPriority)}`}
                >
                  <option value="High" className="text-red-500">High Priority</option>
                  <option value="Medium" className="text-amber-500">Medium Priority</option>
                  <option value="Low" className="text-blue-500">Low Priority</option>
                </select>

                <select
                  value={quickCategory}
                  onChange={e => setQuickCategory(e.target.value)}
                  className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  {TASK_CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={quickDueDate}
                  onChange={e => setQuickDueDate(e.target.value)}
                  className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
                />

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-md shadow-[var(--accent)]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
                  id="quickAddTaskBtn"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>

              <input
                type="text"
                placeholder="Optional notes or sub-details..."
                value={quickNotes}
                onChange={e => setQuickNotes(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </form>
          </div>

          {/* Filter & Category Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {TASK_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setTaskCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    taskCategoryFilter === cat 
                      ? 'bg-[var(--accent)] text-white font-bold' 
                      : 'bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  {cat} {cat === 'All' ? `(${universalTasks.length})` : ''}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-solid)] border border-[var(--border)] text-xs">
              {(['All', 'Active', 'Completed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setTaskStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    taskStatusFilter === st ? 'bg-[var(--bg)] text-[var(--accent)] font-bold shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Tasks List */}
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <SwipeableCard
                key={task.id}
                onSwipeRight={() => handleToggleTask(task.id)}
                onSwipeLeft={() => handleDeleteTask(task.id)}
                rightLabel={task.completed ? "Reopen" : "Complete"}
                leftLabel="Delete"
              >
                <div
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 group ${
                    task.completed 
                      ? 'bg-[var(--bg)]/50 border-[var(--border)] opacity-60' 
                      : 'bg-[var(--surface-solid)] border-[var(--border)] hover:border-[var(--accent)]/40 shadow-sm'
                  }`}
                >
                  {/* Checkbox & Content */}
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                      task.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-gray-500 hover:border-[var(--accent)] bg-[var(--bg)]'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-[var(--text-primary)]'}`}>
                        {task.title}
                      </span>
                      
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getPriorityBadgeStyle(task.priority)}`}>
                        {task.priority}
                      </span>

                      {task.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)]">
                          {task.category}
                        </span>
                      )}
                    </div>

                    {task.notes && (
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {task.notes}
                      </p>
                    )}

                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 pt-0.5">
                        <Calendar className="w-3 h-3" /> Due {task.dueDate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit / Delete Actions */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEditTask(task)}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-secondary)] hover:text-white transition-colors"
                    title="Edit Task"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </SwipeableCard>
          ))}

            {filteredTasks.length === 0 && (
              <div className="p-8 text-center glass-panel border border-[var(--border)] rounded-2xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[var(--accent)] mx-auto opacity-60" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {universalTasks.length === 0 
                    ? "All clear! Add your first task above." 
                    : "No tasks found in this view."}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {universalTasks.length === 0
                    ? "Organize your finance, study, and application goals in one unified pipeline."
                    : "Try adjusting your category or status filters to view other tasks."}
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MASTER CHECKLISTS & RULES SECTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'checklists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {notesSections.map((sec) => (
            <div
              key={sec.id}
              className="border border-[var(--border)] bg-[var(--surface-solid)] p-6 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] flex-wrap gap-2">
                  <h3 className="apple-headline text-xl font-semibold text-[var(--text-primary)]">
                    {sec.title}
                  </h3>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      id={`importChecklistBtn-${sec.id}`}
                      onClick={() => setImportingSectionId(sec.id)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700/80 hover:border-neutral-500 hover:bg-neutral-800 text-[var(--text-secondary)] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      title="Import Checklist from text, JSON, or CSV"
                    >
                      <Download className="w-3 h-3 text-[var(--accent)]" />
                      <span>📥 Import Checklist</span>
                    </button>

                    <button
                      id={`addChecklistItemBtn-${sec.id}`}
                      onClick={() => setAddingToSectionId(sec.id)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {(sec.items || []).map((item) => {
                    if (searchQuery) {
                      const q = searchQuery.toLowerCase();
                      const match = item.title.toLowerCase().includes(q) || item.details.toLowerCase().includes(q);
                      if (!match) return null;
                    }

                    return (
                      <SwipeableCard
                        key={item.id}
                        onSwipeRight={() => onToggleItem(sec.id, item.id)}
                        onSwipeLeft={() => {
                          if (onUpdateNotesSections) {
                            onUpdateNotesSections(notesSections.map(s => s.id === sec.id ? { ...s, items: s.items.filter(i => i.id !== item.id) } : s));
                          }
                        }}
                        rightLabel={item.completed ? "Reopen" : "Complete"}
                        leftLabel="Delete"
                      >
                        <div
                          onClick={() => onToggleItem(sec.id, item.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            item.completed
                              ? 'bg-[var(--bg)] border-[var(--border)] opacity-60'
                              : item.isUrgent
                              ? 'bg-amber-500/10 border-amber-500/40'
                              : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--accent)]/40'
                          }`}
                        >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => {}}
                              className="mt-1 accent-[var(--accent)] cursor-pointer"
                            />
                            <div>
                              <div className={`text-sm font-semibold ${item.completed ? 'line-through text-gray-500' : 'text-[var(--text-primary)]'}`}>
                                {item.title}
                              </div>
                              <div className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                                {item.details}
                              </div>
                            </div>
                          </div>

                          {item.isUrgent && !item.completed && (
                            <span className="font-space-mono text-[9px] uppercase px-1.5 py-0.5 border border-red-500 text-red-400 bg-red-500/10 rounded font-bold shrink-0">
                              Urgent
                            </span>
                          )}
                        </div>

                        {item.link && (
                          <div className="mt-2.5 pt-2 border-t border-[var(--border)]/10 flex items-center justify-end">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="font-space-mono text-[10px] uppercase inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                            >
                              <span>Open Official Portal</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </SwipeableCard>
                  );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingTask(null); }}
        >
          <div className="w-full max-w-md glass-panel border border-[var(--border)] rounded-2xl p-6 relative">
            <button onClick={() => setEditingTask(null)} className="absolute top-4 right-4 p-1.5 bg-[var(--surface-solid)] border border-[var(--border)] shadow rounded-full text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Edit Task</h3>

            <form onSubmit={handleSaveEditTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={editFormData.title || ''}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Priority</label>
                  <select
                    value={editFormData.priority || 'Medium'}
                    onChange={e => setEditFormData({ ...editFormData, priority: e.target.value as TaskPriority })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category</label>
                  <select
                    value={editFormData.category || 'Job Applications'}
                    onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                  >
                    {TASK_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Due Date</label>
                <input
                  type="date"
                  value={editFormData.dueDate || ''}
                  onChange={e => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Notes / Details</label>
                <textarea
                  rows={3}
                  value={editFormData.notes || ''}
                  onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button type="button" onClick={() => setEditingTask(null)} className="px-4 py-2 text-xs rounded-xl border border-[var(--border)]">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold rounded-xl bg-[var(--accent)] text-white">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item to Checklist Section Modal */}
      {addingToSectionId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setAddingToSectionId(null); }}
        >
          <div className="w-full max-w-md glass-panel border border-[var(--border)] rounded-2xl p-6 relative">
            <button onClick={() => setAddingToSectionId(null)} className="absolute top-4 right-4 p-1.5 bg-[var(--surface-solid)] border border-[var(--border)] shadow rounded-full text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Add Item to Checklist</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Item Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Register with local GP surgery"
                  value={newChecklistTitle}
                  onChange={e => setNewChecklistTitle(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Details / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Bring passport, proof of address, and student ID"
                  value={newChecklistDetails}
                  onChange={e => setNewChecklistDetails(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentChk"
                  checked={newChecklistUrgent}
                  onChange={e => setNewChecklistUrgent(e.target.checked)}
                  className="accent-red-500 rounded"
                />
                <label htmlFor="urgentChk" className="text-xs text-[var(--text-secondary)] cursor-pointer">
                  Mark as Urgent Action Item
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button type="button" onClick={() => setAddingToSectionId(null)} className="px-4 py-2 text-xs rounded-xl border border-[var(--border)]">Cancel</button>
                <button 
                  type="button" 
                  onClick={() => handleAddChecklistItem(addingToSectionId)}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[var(--accent)] text-white"
                >
                  Add Checklist Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Checklist Modal */}
      <ImportChecklistModal
        isOpen={!!importingSectionId}
        onClose={() => setImportingSectionId(null)}
        targetSection={notesSections.find(s => s.id === importingSectionId) || null}
        onImport={handleImportChecklist}
      />

    </div>
  );
};
