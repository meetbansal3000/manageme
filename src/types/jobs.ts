// Type Definitions: Career Vault, Graduate Schemes & Application Tracker

export type PriorityLevel = 
  | '🔴 CRITICAL'
  | '🟠 HIGH'
  | '🟡 MEDIUM'
  | '🟢 WIND DOWN'
  | '🟢 GOAL';

export interface TimelineItem {
  id: string;
  month: string;
  phase: string;
  keyActions: string[];
  firms: string;
  deadlines: string;
  hours: string;
  priority: PriorityLevel;
  completed?: boolean;
  notes?: string;
  isUrgent?: boolean;
}

export type SectorType = 
  | 'Asset Management'
  | 'Fund Admin / AM'
  | 'Audit / Advisory'
  | 'M&A Advisory'
  | 'Sovereign Wealth'
  | 'Real Estate PE'
  | 'Accounting Practice'
  | 'Recruitment Agency'
  | 'University / Admin';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
export type FilterRisk = 'Low' | 'Medium' | 'High' | 'Variable';
export type AccaAdvantage = 'Very High' | 'High' | 'Medium' | 'Low';

export type TrackerStatus = 
  | 'Not Applied'
  | 'To Apply'
  | 'Applied'
  | 'Applied ✓'
  | 'Online Tests'
  | 'Assessment'
  | 'Assessment Centre'
  | 'Video Interview'
  | 'Interview'
  | 'Final Interview'
  | 'Offer'
  | 'Offer 🎉'
  | 'Rejected'
  | 'Rejected ✕';

export interface GraduateScheme {
  id: string;
  rank: number;
  firm: string;
  sector: string;
  roleTitle: string;
  appOpens: string;
  appCloses: string;
  startDate?: string;
  salary: string;
  bonus?: string;
  filterRisk?: FilterRisk;
  accaAdvantage?: AccaAdvantage;
  difficulty?: DifficultyLevel;
  applyVia?: string;
  notes: string;
  status: TrackerStatus;
  dateApplied?: string;
  skills?: string[];
}

export interface PartTimeRole {
  id: string;
  rank: number;
  firm: string;
  location: string;
  sector: string;
  roleTitle: string;
  hoursPerWeek: string;
  ratePerHour: string;
  estAnnual: string;
  appWindow: string;
  status: string;
  contact: string;
  notes: string;
  dateApplied?: string;
  link?: string;
}

export interface PriorityTrackerItem {
  id: string;
  rank: number;
  firm: string;
  role: string;
  roleType: 'Grad Scheme' | 'Part-Time' | 'Part-Time (Agency)';
  sector: string;
  deadline: string;
  status: TrackerStatus;
  dateApplied: string;
  nextAction: string;
  notes: string;
}

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  platform: 'LinkedIn' | 'Indeed' | string;
  status: 'Potential' | 'Applied' | 'Interview' | 'Offer' | 'To Apply' | string;
  dateAdded?: string;
  appliedDate?: string;
  deadline?: string;
  link?: string;
  notes?: string;
}

export interface JobPreferences {
  categories: string[];
  locations: string[];
  salaryRange: string;
  currency: string;
  experienceLevel: string;
}
