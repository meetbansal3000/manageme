// Type Definitions: Study Intelligence, Timetable, Tasks & Notes

export type TermStatus = 'Term Time' | 'Vacation';

export interface UniClass {
  timestamp?: number;
  id: string;
  moduleName: string;
  type: 'Lecture' | 'Seminar' | 'Workshop' | 'Exam Prep';
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  location: string;
  term: 'Michaelmas' | 'Epiphany' | 'Easter';
}

export interface GradeEntry {
  id: string;
  moduleName: string;
  assessmentTitle: string;
  weight: number;
  grade: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  category: string;
  url: string;
  date: string;
  archived?: boolean;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  companions: string[];
  notes?: string;
}

export interface TripExpense {
  id: string;
  tripId: string;
  amount: number;
  description: string;
  date: string;
  splitWith: string[];
}

export interface TransitRoute {
  id: string;
  from: string;
  to: string;
  duration: string;
  cost: number;
}

export interface PlaceRecommendation {
  id: string;
  name: string;
  city: string;
  country: string;
  category: 'UK' | 'Abroad' | 'Food & Dining' | 'Weekend Getaway' | 'Culture';
  tags: string[];
  budget: string;
  priority: 'High' | 'Medium' | 'Low';
  notes: string;
  visited?: boolean;
}

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';

export interface SkillTask {
  timestamp?: number;
  id: string;
  category: string;
  name: string;
  priority?: number | string;
  reason?: string;
  cost?: string;
  timeToComplete?: string;
  keyBenefit?: string;
  link?: string;
  targetDate?: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  proficiency?: SkillProficiency;
  rating?: number;
}

export interface CourseCertification {
  id: string;
  title: string;
  provider: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  targetDate?: string;
  progress: number;
  archived?: boolean;
  certificateUrl?: string;
  skillsAcquired?: string[];
  notes?: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface UniversalTask {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  category?: string;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  details: string;
  completed: boolean;
  isUrgent?: boolean;
  link?: string;
}

export interface NoteSection {
  id: string;
  title: string;
  bgColor: string;
  textColor: string;
  items: ChecklistItem[];
}

export interface VirtualNotebook {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  color?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'purple';
  docIds: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
  studyGuide?: {
    title: string;
    generatedAt: number;
    executiveSummary: string;
    timelineOrRoadmap: { stage: string; periodOrConcept: string; details: string; citations: string[] }[];
    coreFormulasAndDefinitions: { term: string; formulaOrDefinition: string; application: string; citation: string }[];
    corePrinciples: string[];
    frequentlyTestedQuestions: { question: string; answer: string; citation: string }[];
  };
  flashcards?: {
    id: string;
    front: string;
    back: string;
    tag?: string;
    citation?: string;
  }[];
  mockExam?: {
    examTitle: string;
    timeLimitMinutes: number;
    generatedAt?: number;
    questions: {
      id: number;
      type: 'mcq' | 'essay';
      question: string;
      options?: string[];
      correctAnswerIndex?: number;
      explanation?: string;
      modelAnswer?: string;
      keyGradingPoints?: string[];
      citation?: string;
    }[];
  };
  savedExamScores?: {
    id: string;
    date: number;
    score: number;
    total: number;
    percentage: number;
    examTitle: string;
  }[];
}
