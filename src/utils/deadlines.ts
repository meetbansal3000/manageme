export interface ExamDeadline {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'EXAM' | 'QUIZ' | 'COURSEWORK' | 'CERTIFICATION' | 'DEADLINE';
  module?: string;
  notes?: string;
}

const STORAGE_KEY = 'manageme_exam_deadlines';

export const DEFAULT_DEADLINES: ExamDeadline[] = [
  {
    id: 'dl-1',
    title: 'Financial Statement Quiz',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'QUIZ',
    module: 'FIN201 Financial Accounting',
    notes: 'DuPont Analysis & Free Cash Flow statements'
  },
  {
    id: 'dl-2',
    title: 'Corporate Valuation Coursework',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'COURSEWORK',
    module: 'FIN305 Corporate Finance',
    notes: 'Complete 3-statement DCF model on Excel'
  },
  {
    id: 'dl-3',
    title: 'CFA Level 1 Exam',
    date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'CERTIFICATION',
    module: 'CFA Institute',
    notes: 'Ethics, Quantitative Methods & Financial Reporting'
  }
];

export const getExamDeadlines = (): ExamDeadline[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load deadlines:', e);
  }
  return DEFAULT_DEADLINES;
};

export const saveExamDeadlines = (deadlines: ExamDeadline[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deadlines));
    window.dispatchEvent(new CustomEvent('deadlinesUpdated'));
  } catch (e) {
    console.error('Failed to save deadlines:', e);
  }
};

export const calculateDaysRemaining = (targetDateStr: string): number => {
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getNextPriorityDeadline = (deadlines: ExamDeadline[]): { deadline: ExamDeadline; daysRemaining: number } | null => {
  if (!deadlines || deadlines.length === 0) return null;

  const validWithDays = deadlines
    .map(d => ({ deadline: d, daysRemaining: calculateDaysRemaining(d.date) }))
    .filter(item => item.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return validWithDays[0] || null;
};
