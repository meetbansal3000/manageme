import React, { useState } from 'react';
import { useScrollFadeUp } from "../hooks/useScrollFadeUp";
import { 
  Share2, 
  Target,
  CirclePlay,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Search,
  BookOpen,
  Award,
  Star,
  X,
  Pencil,
  Sliders,
  Archive,
  GraduationCap,
  Sparkles,
  Tag,
  Check,
  FolderArchive,
  BarChart2,
  ChevronRight,
  Layers,
  Zap
} from 'lucide-react';
import { SkillTask, SkillProficiency, CourseCertification } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useScrollLock } from '../hooks/useScrollLock';
import { useModalDismiss } from '../hooks/useModalDismiss';
import { GapAnalysisHeatmap } from './GapAnalysisHeatmap';
import { SkillsGapResolver } from './SkillsGapResolver';

interface SkillsTrackerTabProps {
  skills: SkillTask[];
  setSkills: (skills: SkillTask[] | ((prev: SkillTask[]) => SkillTask[])) => void;
  courses?: CourseCertification[];
  setCourses?: (courses: CourseCertification[] | ((prev: CourseCertification[]) => CourseCertification[])) => void;
  userData?: any;
  updateData?: (d: any) => void;
}

const PROFICIENCY_LEVELS: SkillProficiency[] = ['Beginner', 'Intermediate', 'Advanced', 'Master'];

const SKILL_CATEGORIES = [
  'Technical',
  'Quantitative',
  'Accounting',
  'Soft Skills',
  'Analytics',
  'Domain Knowledge'
];

const COURSE_PROVIDERS = [
  'CFA Institute',
  'Bloomberg Institute',
  'Outskill / CFI',
  'Coursera (Wharton / Yale)',
  'edX / Harvard Online',
  'Udemy',
  'University / Institutional',
  'Other'
];

export const SkillsTrackerTab: React.FC<SkillsTrackerTabProps> = ({ 
  skills = [], 
  setSkills, 
  courses = [], 
  setCourses,
  userData,
  updateData 
}) => {
  const { settings } = useSettings();
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'gap-analysis' | 'resolver' | 'courses' | 'roadmap'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Quick Add Skill Bar State
  const [quickSkillName, setQuickSkillName] = useState('');
  const [quickCategory, setQuickCategory] = useState('Technical');
  const [quickProficiency, setQuickProficiency] = useState<SkillProficiency>('Intermediate');
  const [quickRating, setQuickRating] = useState<number>(3);

  // Skill Edit Modal State
  const [editingSkill, setEditingSkill] = useState<SkillTask | null>(null);
  const [skillFormData, setSkillFormData] = useState<Partial<SkillTask>>({});

  // Course Add / Edit Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseCertification | null>(null);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    provider: 'Coursera',
    status: 'In Progress' as 'Planned' | 'In Progress' | 'Completed',
    targetDate: '2026-10-30',
    progress: 50,
    certificateUrl: '',
    skillsInput: '',
    skillsAcquired: [] as string[],
    notes: ''
  });

  const [showArchivedCourses, setShowArchivedCourses] = useState(false);

  useScrollLock(!!editingSkill || isCourseModalOpen);
  useModalDismiss(!!editingSkill, () => setEditingSkill(null));
  useModalDismiss(isCourseModalOpen, () => setIsCourseModalOpen(false));

  // --- SKILLS CRUD HANDLERS ---

  const handleAddQuickSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = quickSkillName.trim();
    if (!trimmed) return;

    const newSkill: SkillTask = {
      id: `sk-${Date.now()}`,
      name: trimmed,
      category: quickCategory,
      proficiency: quickProficiency,
      rating: quickRating,
      priority: 2,
      reason: `Key competency for ${quickCategory} finance career track`,
      cost: 'Free',
      timeToComplete: '15 hrs',
      keyBenefit: 'Demonstrates domain readiness on CV and technical tests',
      link: '',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: quickProficiency === 'Master' ? 'Done' : 'In Progress'
    };

    setSkills(prev => [newSkill, ...prev]);
    setQuickSkillName('');
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(prev => prev.filter(s => s.id !== id));
  };

  const handleAddMissingSkill = (skillName: string, category: string = 'Technical', defaultProficiency: SkillProficiency = 'Beginner') => {
    // Check if skill already exists
    const exists = skills.some(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (exists) return;

    const newSkill: SkillTask = {
      id: `sk-${Date.now()}`,
      name: skillName,
      category: category,
      proficiency: defaultProficiency,
      rating: defaultProficiency === 'Beginner' ? 1 : 3,
      priority: 1,
      status: 'Not Started',
      reason: 'Key requirement identified from Graduate Schemes Gap Analysis',
      keyBenefit: `Closes recruitment keyword gap for ${category} competency benchmarks`,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    if (setSkills) {
      setSkills(prev => [newSkill, ...prev]);
    } else if (updateData && userData) {
      updateData({ skillsTracker: [newSkill, ...(userData.skillsTracker || [])] });
    }
  };

  const handleAddSkillFromResolver = (skillPartial: Partial<SkillTask>) => {
    if (!skillPartial.name) return;
    const exists = skills.some(s => s.name.toLowerCase() === skillPartial.name!.toLowerCase());
    if (exists) return;

    const newSkill: SkillTask = {
      id: `sk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: skillPartial.name,
      category: skillPartial.category || 'Technical',
      proficiency: skillPartial.proficiency || 'Beginner',
      rating: skillPartial.rating || (skillPartial.proficiency === 'Advanced' ? 4 : skillPartial.proficiency === 'Intermediate' ? 3 : 1),
      priority: skillPartial.priority || 1,
      status: skillPartial.status || 'Not Started',
      reason: skillPartial.reason || 'Requirement identified by Skills Gap Resolver',
      keyBenefit: skillPartial.keyBenefit || 'Demonstrates benchmark readiness for finance graduate schemes',
      timeToComplete: skillPartial.timeToComplete || '15 hrs',
      cost: skillPartial.cost || 'Free',
      link: skillPartial.link || '',
      targetDate: skillPartial.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    if (setSkills) {
      setSkills(prev => [newSkill, ...prev]);
    } else if (updateData && userData) {
      updateData({ skillsTracker: [newSkill, ...(userData.skillsTracker || [])] });
    }
  };

  const handleAddMultipleSkillsFromResolver = (skillsList: Partial<SkillTask>[]) => {
    const existingNames = new Set(skills.map(s => s.name.toLowerCase()));
    const validNewSkills: SkillTask[] = [];

    skillsList.forEach((skillPartial, idx) => {
      if (!skillPartial.name) return;
      const lower = skillPartial.name.toLowerCase();
      if (existingNames.has(lower)) return;
      existingNames.add(lower);

      validNewSkills.push({
        id: `sk-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        name: skillPartial.name,
        category: skillPartial.category || 'Technical',
        proficiency: skillPartial.proficiency || 'Beginner',
        rating: skillPartial.rating || (skillPartial.proficiency === 'Advanced' ? 4 : skillPartial.proficiency === 'Intermediate' ? 3 : 1),
        priority: skillPartial.priority || 1,
        status: skillPartial.status || 'Not Started',
        reason: skillPartial.reason || 'Requirement identified by Skills Gap Resolver',
        keyBenefit: skillPartial.keyBenefit || 'Demonstrates benchmark readiness for finance graduate schemes',
        timeToComplete: skillPartial.timeToComplete || '15 hrs',
        cost: skillPartial.cost || 'Free',
        link: skillPartial.link || '',
        targetDate: skillPartial.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    });

    if (validNewSkills.length === 0) return;

    if (setSkills) {
      setSkills(prev => [...validNewSkills, ...prev]);
    } else if (updateData && userData) {
      updateData({ skillsTracker: [...validNewSkills, ...(userData.skillsTracker || [])] });
    }
  };

  const handleUpdateProficiency = (id: string, proficiency: SkillProficiency) => {
    const defaultRatingMap: Record<SkillProficiency, number> = {
      'Beginner': 1,
      'Intermediate': 3,
      'Advanced': 4,
      'Master': 5
    };
    setSkills(prev => prev.map(s => s.id === id ? { 
      ...s, 
      proficiency, 
      rating: defaultRatingMap[proficiency] || 3,
      status: proficiency === 'Master' ? 'Done' : s.status 
    } : s));
  };

  const handleUpdateRating = (id: string, rating: number) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, rating } : s));
  };

  const handleOpenEditSkill = (skill: SkillTask) => {
    setEditingSkill(skill);
    setSkillFormData({ ...skill });
  };

  const handleSaveSkillEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill || !skillFormData.name) return;

    setSkills(prev => prev.map(s => s.id === editingSkill.id ? { ...s, ...skillFormData } as SkillTask : s));
    setEditingSkill(null);
  };

  // --- COURSES CRUD HANDLERS ---

  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseFormData({
      title: '',
      provider: 'Coursera',
      status: 'In Progress',
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      certificateUrl: '',
      skillsInput: '',
      skillsAcquired: ['Financial Modeling'],
      notes: ''
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: CourseCertification) => {
    setEditingCourse(course);
    setCourseFormData({
      title: course.title,
      provider: course.provider,
      status: course.status,
      targetDate: course.targetDate || '',
      progress: course.progress || 0,
      certificateUrl: course.certificateUrl || '',
      skillsInput: '',
      skillsAcquired: course.skillsAcquired || [],
      notes: course.notes || ''
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.title) return;

    const coursePayload: CourseCertification = {
      id: editingCourse ? editingCourse.id : `c-${Date.now()}`,
      title: courseFormData.title,
      provider: courseFormData.provider,
      status: courseFormData.progress === 100 ? 'Completed' : courseFormData.status,
      targetDate: courseFormData.targetDate,
      progress: Number(courseFormData.progress),
      certificateUrl: courseFormData.certificateUrl,
      skillsAcquired: courseFormData.skillsAcquired,
      notes: courseFormData.notes,
      archived: editingCourse ? editingCourse.archived : false
    };

    if (setCourses) {
      if (editingCourse) {
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? coursePayload : c));
      } else {
        setCourses(prev => [coursePayload, ...prev]);
      }
    } else if (updateData && userData) {
      const currentCourses: CourseCertification[] = userData.courses || [];
      const updated = editingCourse 
        ? currentCourses.map(c => c.id === editingCourse.id ? coursePayload : c)
        : [coursePayload, ...currentCourses];
      updateData({ courses: updated });
    }

    setIsCourseModalOpen(false);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('Delete this course from your records?')) {
      if (setCourses) {
        setCourses(prev => prev.filter(c => c.id !== id));
      } else if (updateData && userData) {
        updateData({ courses: (userData.courses || []).filter((c: CourseCertification) => c.id !== id) });
      }
    }
  };

  const handleToggleArchiveCourse = (id: string) => {
    const updater = (prev: CourseCertification[]) => prev.map(c => c.id === id ? { ...c, archived: !c.archived } : c);
    if (setCourses) {
      setCourses(updater);
    } else if (updateData && userData) {
      updateData({ courses: updater(userData.courses || []) });
    }
  };

  const handleUpdateCourseProgress = (id: string, progress: number) => {
    const updatedStatus = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Planned';
    const updater = (prev: CourseCertification[]) => prev.map(c => c.id === id ? { 
      ...c, 
      progress, 
      status: updatedStatus as any 
    } : c);

    if (setCourses) {
      setCourses(updater);
    } else if (updateData && userData) {
      updateData({ courses: updater(userData.courses || []) });
    }
  };

  // --- SHARING & SEARCH ---

  const handleShare = () => {
    const payload = {
      skills,
      courses
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    alert('Skills & Certifications data copied to clipboard as JSON!');
  };

  useScrollFadeUp([skills, courses, activeSubTab, searchQuery, selectedCategory]);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesStatus = statusFilter === 'All' || skill.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredCourses = courses.filter(course => {
    if (!showArchivedCourses && course.archived) return false;
    if (showArchivedCourses && !course.archived) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(q) ||
      course.provider.toLowerCase().includes(q) ||
      (course.skillsAcquired && course.skillsAcquired.some(s => s.toLowerCase().includes(q)))
    );
  });

  const completedCount = skills.filter(s => s.status === 'Done' || s.proficiency === 'Master').length;
  const progressPercent = skills.length === 0 ? 0 : Math.round((completedCount / skills.length) * 100);

  const completedCoursesCount = courses.filter(c => c.status === 'Completed' || c.progress === 100).length;

  const getProficiencyBadgeStyle = (prof?: SkillProficiency) => {
    switch (prof) {
      case 'Master':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Advanced':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Intermediate':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner & Sub-Tab Switcher */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between glass-panel p-6 rounded-[24px]">
        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[var(--border)]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" strokeWidth="3"
              />
              <path
                className="text-[var(--accent)] transition-all duration-1000 ease-out"
                strokeDasharray={`${progressPercent}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
              />
            </svg>
            <div className="absolute font-mono text-sm font-semibold">{progressPercent}%</div>
          </div>
          <div>
            <div className="font-space-mono text-xs text-[var(--accent)] font-bold uppercase tracking-widest">
              03 / COMPETENCIES & CREDENTIALS
            </div>
            <h2 className="apple-headline text-2xl font-bold tracking-tight mt-0.5">
              Skills, Competencies & Courses
            </h2>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1 flex flex-wrap items-center gap-3">
              <span>{completedCount} of {skills.length} Skills Mastered</span>
              <span>•</span>
              <span>{completedCoursesCount} of {courses.length} Certifications Completed</span>
            </p>
          </div>
        </div>

        {/* Sub-Navigation Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex p-1 rounded-xl bg-[var(--surface-solid)] border border-[var(--border)] flex-wrap">
            <button
              onClick={() => setActiveSubTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'matrix' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Target className="w-3.5 h-3.5" /> Skills Matrix
            </button>
            <button
              onClick={() => setActiveSubTab('gap-analysis')}
              id="skillsGapAnalysisTabBtn"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'gap-analysis' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Gap Analysis Heatmap
            </button>
            <button
              onClick={() => setActiveSubTab('resolver')}
              id="skillsGapResolverTabBtn"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'resolver' ? 'bg-amber-500 text-neutral-950 font-bold shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Gap Resolver
            </button>
            <button
              onClick={() => setActiveSubTab('courses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'courses' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Courses & Certs
            </button>
            <button
              onClick={() => setActiveSubTab('roadmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'roadmap' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Roadmap
            </button>
          </div>

          <button onClick={handleShare} className="p-2 rounded-xl glass-panel border border-[var(--border)] hover:bg-white/5 transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]" title="Export JSON">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DYNAMIC SKILLS & COMPETENCY MATRIX VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          
          {/* Visual Gap Analysis Heatmap (Compact Matrix Preview) */}
          <GapAnalysisHeatmap 
            compact
            skills={skills}
            courses={courses}
            gradSchemes={userData?.gradSchemes}
            onAddMissingSkill={handleAddMissingSkill}
            onNavigateToFull={() => setActiveSubTab('gap-analysis')}
            onOpenResolver={() => setActiveSubTab('resolver')}
          />
          
          {/* Quick-Add Interactive Bar */}
          <div className="p-5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" /> Add Custom Skill to Matrix
              </h3>
              <span className="text-[11px] font-mono text-[var(--text-secondary)]">Type skill name & choose level</span>
            </div>

            <form onSubmit={handleAddQuickSkill} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="e.g., Financial Modeling, Xero, Python, Valuation, Public Speaking..."
                  value={quickSkillName}
                  onChange={e => setQuickSkillName(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] placeholder:text-gray-500"
                />
              </div>

              <select
                value={quickCategory}
                onChange={e => setQuickCategory(e.target.value)}
                className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
              >
                {SKILL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <select
                value={quickProficiency}
                onChange={e => {
                  const p = e.target.value as SkillProficiency;
                  setQuickProficiency(p);
                  if (p === 'Master') setQuickRating(5);
                  else if (p === 'Advanced') setQuickRating(4);
                  else if (p === 'Intermediate') setQuickRating(3);
                  else setQuickRating(1);
                }}
                className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
              >
                {PROFICIENCY_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>

              {/* Star Rating Picker */}
              <div className="flex items-center gap-1 bg-[var(--bg)] border border-[var(--border)] px-3 py-2 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setQuickRating(star)}
                    className="text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star className={`w-3.5 h-3.5 ${star <= quickRating ? 'fill-amber-400' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-md shadow-[var(--accent)]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Skill
              </button>
            </form>
          </div>

          {/* Filter & Category Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'All' ? 'bg-[var(--accent)] text-white font-bold' : 'bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                All ({skills.length})
              </button>
              {SKILL_CATEGORIES.map(cat => {
                const count = skills.filter(s => s.category === cat).length;
                if (count === 0 && selectedCategory !== cat) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat ? 'bg-[var(--accent)] text-white font-bold' : 'bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input 
                type="text" 
                placeholder="Filter matrix skills..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-[var(--surface-solid)] border border-[var(--border)] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Interactive Skill Pills Matrix grouped by Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(selectedCategory === 'All' ? SKILL_CATEGORIES : [selectedCategory]).map((cat) => {
              const catSkills = filteredSkills.filter(s => s.category === cat);
              if (catSkills.length === 0) return null;

              return (
                <div key={cat} className="p-5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">{cat}</h4>
                      </div>
                      <span className="text-xs font-mono text-[var(--text-secondary)]">{catSkills.length} competencies</span>
                    </div>

                    {/* Skill Pills Container with One-Click Delete ("x" button) and Level Selector */}
                    <div className="flex flex-wrap gap-2.5">
                      {catSkills.map((skill) => {
                        const prof = skill.proficiency || 'Intermediate';
                        const currentRating = skill.rating || 3;
                        return (
                          <div
                            key={skill.id}
                            className="group/pill inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all shadow-sm"
                          >
                            {/* Skill Name */}
                            <span 
                              onClick={() => handleOpenEditSkill(skill)}
                              className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--accent)]"
                            >
                              {skill.name}
                            </span>

                            {/* Interactive Level Badge / Toggle */}
                            <select
                              value={prof}
                              onChange={(e) => handleUpdateProficiency(skill.id, e.target.value as SkillProficiency)}
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border appearance-none cursor-pointer focus:outline-none ${getProficiencyBadgeStyle(prof)}`}
                              title="Toggle Proficiency Level"
                            >
                              {PROFICIENCY_LEVELS.map(lvl => (
                                <option key={lvl} value={lvl} className="bg-[#1c1c1e] text-white">{lvl}</option>
                              ))}
                            </select>

                            {/* 1-5 Star Rating Gauge */}
                            <div className="flex items-center gap-0.5" title={`Proficiency Rating: ${currentRating}/5`}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => handleUpdateRating(skill.id, star)}
                                  className="focus:outline-none"
                                >
                                  <Star className={`w-2.5 h-2.5 ${star <= currentRating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}`} />
                                </button>
                              ))}
                            </div>

                            {/* One-Click Quick Delete ("x" badge button) */}
                            <button
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="p-0.5 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors ml-0.5"
                              title="Delete skill"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GAP ANALYSIS & KEYWORD HEATMAP VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'gap-analysis' && (
        <GapAnalysisHeatmap 
          skills={skills}
          courses={courses}
          gradSchemes={userData?.gradSchemes}
          onAddMissingSkill={handleAddMissingSkill}
          onOpenResolver={() => setActiveSubTab('resolver')}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. AUTOMATED SKILLS GAP RESOLVER VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'resolver' && (
        <SkillsGapResolver
          skills={skills}
          courses={courses}
          gradSchemes={userData?.gradSchemes}
          onAddSkill={handleAddSkillFromResolver}
          onAddMultipleSkills={handleAddMultipleSkillsFromResolver}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. COURSES & CERTIFICATIONS MANAGER VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'courses' && (
        <div className="space-y-6">
          
          {/* Courses Header & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[var(--accent)]" /> Courses & Professional Certifications
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Track exam completions (CFA, Bloomberg BMC, ACCA DipIFR) and online course progress.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowArchivedCourses(!showArchivedCourses)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                  showArchivedCourses ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>{showArchivedCourses ? 'Viewing Archived' : 'Show Archived'}</span>
              </button>

              <button
                onClick={handleOpenAddCourse}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-md shadow-[var(--accent)]/20 hover:brightness-110 active:scale-95 transition-all"
                id="addCourseCertBtn"
              >
                <Plus className="w-4 h-4" /> Add Course / Cert
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isCompleted = course.progress === 100 || course.status === 'Completed';
              return (
                <div 
                  key={course.id}
                  className="bento-card p-6 flex flex-col justify-between rounded-2xl border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all space-y-4"
                >
                  {/* Top Bar: Provider & Status Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {course.provider}
                    </span>

                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                        isCompleted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        course.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {isCompleted ? 'Completed ✓' : course.status}
                      </span>

                      <button
                        onClick={() => handleOpenEditCourse(course)}
                        className="p-1 rounded hover:bg-[var(--surface-solid)] text-[var(--text-secondary)] hover:text-white"
                        title="Edit Course"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleArchiveCourse(course.id)}
                        className="p-1 rounded hover:bg-[var(--surface-solid)] text-[var(--text-secondary)] hover:text-white"
                        title={course.archived ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Course Title */}
                  <div>
                    <h4 className="apple-headline text-lg font-bold text-[var(--text-primary)] leading-snug">
                      {course.title}
                    </h4>
                    {course.targetDate && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-amber-400" /> Target: {course.targetDate}
                      </p>
                    )}
                  </div>

                  {/* Interactive Progress Slider */}
                  <div className="space-y-2 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[var(--text-secondary)] font-semibold">Completion Progress</span>
                      <span className="font-bold text-[var(--accent)]">{course.progress}%</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={course.progress}
                      onChange={(e) => handleUpdateCourseProgress(course.id, Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                    />

                    <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-[var(--accent)]'
                        }`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Skills Acquired */}
                  {course.skillsAcquired && course.skillsAcquired.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[var(--accent)]" /> Skills Gained
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {course.skillsAcquired.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-[var(--surface-solid)] border border-[var(--border)] text-[10px] font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Notes or Link */}
                  {course.notes && (
                    <p className="text-xs text-[var(--text-secondary)] italic border-t border-[var(--border)] pt-2 line-clamp-2">
                      "{course.notes}"
                    </p>
                  )}

                  {course.certificateUrl && (
                    <a
                      href={course.certificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      <span>View Credential Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                </div>
              );
            })}
            {filteredCourses.length === 0 && (
              <div className="col-span-full p-8 text-center glass-panel border border-[var(--border)] rounded-2xl space-y-3">
                <GraduationCap className="w-8 h-8 text-[var(--accent)] mx-auto opacity-60" />
                <p className="text-sm font-semibold text-[var(--text-secondary)]">No courses found matching criteria.</p>
                <button
                  onClick={handleOpenAddCourse}
                  className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-bold rounded-xl"
                >
                  + Add Your First Course
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STRATEGIC LEARNING ROADMAP VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'roadmap' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="skill-card gsap-fade-up bento-card p-5 flex flex-col justify-between group relative overflow-hidden rounded-2xl border border-[var(--border)]">
              
              <div>
                {/* Status & Category */}
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-secondary)] border border-[var(--border)] px-2 py-0.5 rounded bg-[var(--bg)]">
                    {skill.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditSkill(skill)}
                      className="p-1 text-gray-500 hover:text-white"
                      title="Edit"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-1 text-gray-500 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Title & Priority */}
                <h3 className="text-base font-bold leading-snug mb-1 text-[var(--text-primary)]">{skill.name}</h3>

                {/* Reason */}
                <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-4 mt-2">
                  {skill.reason}
                </p>
              </div>

              {/* Meta Footer */}
              <div className="pt-4 border-t border-[var(--border)]/50 space-y-3">
                <div className="flex justify-between items-center text-[11px] text-[var(--text-secondary)] font-mono">
                  <span>⏱ {skill.timeToComplete || '10 hrs'}</span>
                  <span>{skill.cost || 'Free'}</span>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={skill.status}
                    onChange={(e) => {
                      setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, status: e.target.value as any } : s));
                    }}
                    className="flex-1 bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs rounded-lg px-2 py-1.5 appearance-none cursor-pointer focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>

                  {skill.link && (
                    <a 
                      href={skill.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors flex items-center justify-center"
                      title="Open Resource"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
              
            </div>
          ))}
        </div>
      )}

      {/* Edit Skill Modal */}
      {editingSkill && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingSkill(null); }}
        >
          <div className="w-full max-w-md glass-panel border border-[var(--border)] rounded-2xl p-6 relative">
            <button onClick={() => setEditingSkill(null)} className="absolute top-4 right-4 p-1.5 bg-[var(--surface-solid)] border border-[var(--border)] shadow rounded-full text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Edit Competency</h3>
            
            <form onSubmit={handleSaveSkillEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={skillFormData.name || ''}
                  onChange={e => setSkillFormData({ ...skillFormData, name: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category</label>
                  <select
                    value={skillFormData.category || 'Technical'}
                    onChange={e => setSkillFormData({ ...skillFormData, category: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                  >
                    {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Proficiency</label>
                  <select
                    value={skillFormData.proficiency || 'Intermediate'}
                    onChange={e => setSkillFormData({ ...skillFormData, proficiency: e.target.value as SkillProficiency })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                  >
                    {PROFICIENCY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Strategic Rationale</label>
                <textarea
                  rows={2}
                  value={skillFormData.reason || ''}
                  onChange={e => setSkillFormData({ ...skillFormData, reason: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button type="button" onClick={() => setEditingSkill(null)} className="px-4 py-2 text-xs rounded-xl border border-[var(--border)]">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold rounded-xl bg-[var(--accent)] text-white">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isCourseModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setIsCourseModalOpen(false); }}
        >
          <div className="w-full max-w-lg glass-panel border border-[var(--border)] rounded-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button onClick={() => setIsCourseModalOpen(false)} className="absolute top-4 right-4 p-1.5 bg-[var(--surface-solid)] border border-[var(--border)] shadow rounded-full text-gray-400 hover:text-white z-20">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4 pr-8">
              {editingCourse ? 'Edit Course / Certification' : 'Add Course / Certification'}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bloomberg Market Concepts, Outskill Valuation Masterclass"
                  value={courseFormData.title}
                  onChange={e => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Provider / Platform</label>
                  <select
                    value={courseFormData.provider}
                    onChange={e => setCourseFormData({ ...courseFormData, provider: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  >
                    {COURSE_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Status</label>
                  <select
                    value={courseFormData.status}
                    onChange={e => setCourseFormData({ ...courseFormData, status: e.target.value as any })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <label className="text-[var(--text-secondary)]">Current Progress</label>
                  <span className="text-[var(--accent)] font-bold">{courseFormData.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={courseFormData.progress}
                  onChange={e => setCourseFormData({ ...courseFormData, progress: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={courseFormData.targetDate}
                  onChange={e => setCourseFormData({ ...courseFormData, targetDate: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Certificate / Resource URL</label>
                <input
                  type="text"
                  placeholder="https://coursera.org/verify/..."
                  value={courseFormData.certificateUrl}
                  onChange={e => setCourseFormData({ ...courseFormData, certificateUrl: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-4 py-2 text-xs rounded-xl border border-[var(--border)]">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold rounded-xl bg-[var(--accent)] text-white">
                  {editingCourse ? 'Save Changes' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
