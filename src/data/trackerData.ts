import { 
  TimelineItem, 
  GraduateScheme, 
  PartTimeRole, 
  PriorityTrackerItem, 
  NoteSection,
  SkillTask,
  CourseCertification,
  UniversalTask
} from '../types';

export const SKILLS_DATA: SkillTask[] = [
  {
    id: 'sk-1',
    name: 'Financial Modeling & 3-Statement Forecasting',
    category: 'Technical',
    proficiency: 'Advanced',
    rating: 4,
    priority: 1,
    reason: 'Essential for Valuation, PE & Investment Banking analyst tests',
    cost: 'Free / Included',
    timeToComplete: '25 hrs',
    keyBenefit: 'Build dynamic DCF and LBO models from scratch',
    link: 'https://corporatefinanceinstitute.com',
    targetDate: '2026-09-30',
    status: 'In Progress'
  },
  {
    id: 'sk-2',
    name: 'Python for Quantitative Finance',
    category: 'Quantitative',
    proficiency: 'Intermediate',
    rating: 3,
    priority: 2,
    reason: 'Algorithmic backtesting, risk metrics, and data wrangling with pandas/numpy',
    cost: 'Free',
    timeToComplete: '30 hrs',
    keyBenefit: 'Automates portfolio optimization & scenario simulation',
    link: 'https://coursera.org',
    targetDate: '2026-10-15',
    status: 'In Progress'
  },
  {
    id: 'sk-3',
    name: 'Valuation (DCF, Multiples & LBO)',
    category: 'Technical',
    proficiency: 'Master',
    rating: 5,
    priority: 1,
    reason: 'Core interview competency for Lazard, Rothschild, and BlackRock',
    cost: 'Free',
    timeToComplete: '20 hrs',
    keyBenefit: 'Master enterprise valuation techniques and WACC calculations',
    link: 'https://macabacus.com',
    targetDate: '2026-09-20',
    status: 'Done'
  },
  {
    id: 'sk-4',
    name: 'Xero & Cloud Accounting',
    category: 'Accounting',
    proficiency: 'Advanced',
    rating: 4,
    priority: 3,
    reason: 'Direct edge for UK part-time bookkeeping and Big 4 advisory roles',
    cost: 'Free Certification',
    timeToComplete: '8 hrs',
    keyBenefit: 'Official Xero Advisor Certified badge on LinkedIn',
    link: 'https://learning.xero.com',
    targetDate: '2026-09-25',
    status: 'Done'
  },
  {
    id: 'sk-5',
    name: 'Public Speaking & Pitch Deck Presentation',
    category: 'Soft Skills',
    proficiency: 'Intermediate',
    rating: 3,
    priority: 2,
    reason: 'Crucial for Assessment Centre partner presentations and group exercises',
    cost: 'Free',
    timeToComplete: '12 hrs',
    keyBenefit: 'Confident executive delivery under time pressure',
    link: '',
    targetDate: '2026-10-10',
    status: 'In Progress'
  },
  {
    id: 'sk-6',
    name: 'Power BI & Executive Dashboards',
    category: 'Analytics',
    proficiency: 'Intermediate',
    rating: 3,
    priority: 3,
    reason: 'Data visualization for corporate finance management reporting',
    cost: 'Free',
    timeToComplete: '15 hrs',
    keyBenefit: 'Build interactive financial KPIs and revenue models',
    link: 'https://learn.microsoft.com',
    targetDate: '2026-10-25',
    status: 'Not Started'
  },
  {
    id: 'sk-7',
    name: 'IFRS & UK GAAP Standards (ACCA DipIFR)',
    category: 'Accounting',
    proficiency: 'Advanced',
    rating: 4,
    priority: 1,
    reason: 'Comprehensive international accounting recognition across UK & EMEA',
    cost: '£168 Exam Fee',
    timeToComplete: '60 hrs',
    keyBenefit: 'Pass Dec 2026 DipIFR exam with distinction',
    link: 'https://accaglobal.com',
    targetDate: '2026-12-05',
    status: 'In Progress'
  }
];

export const COURSES_DATA: CourseCertification[] = [
  {
    id: 'c-1',
    title: 'Bloomberg Market Concepts (BMC)',
    provider: 'Bloomberg Institute',
    status: 'Completed',
    targetDate: '2026-08-30',
    progress: 100,
    certificateUrl: 'https://portal.bloombergforeducation.com',
    skillsAcquired: ['Terminal Navigation', 'Economic Indicators', 'Currencies', 'Fixed Income', 'Equities'],
    notes: '8-hour self-paced course covering core financial market analytics'
  },
  {
    id: 'c-2',
    title: 'Financial Modeling & Valuation Masterclass',
    provider: 'Outskill / CFI',
    status: 'In Progress',
    targetDate: '2026-09-25',
    progress: 75,
    certificateUrl: '',
    skillsAcquired: ['3-Statement Modeling', 'DCF', 'LBO', 'M&A Accretion/Dilution'],
    notes: 'Completed 6 of 8 modules. Next: M&A merger model case study.'
  },
  {
    id: 'c-3',
    title: 'CFA Level 1 Exam Prep (Foundations)',
    provider: 'CFA Institute / Kaplan Schweser',
    status: 'In Progress',
    targetDate: '2026-11-20',
    progress: 40,
    certificateUrl: '',
    skillsAcquired: ['Ethical Standards', 'Quantitative Methods', 'Economics', 'Corporate Issuers'],
    notes: 'Focused on Ethics and Quantitative Methods modules for semester 1.'
  },
  {
    id: 'c-4',
    title: 'ESG & Sustainable Finance Specialization',
    provider: 'Coursera (Wharton Online)',
    status: 'Planned',
    targetDate: '2026-12-15',
    progress: 10,
    certificateUrl: '',
    skillsAcquired: ['ESG Metrics', 'Climate Risk', 'Impact Investing'],
    notes: 'Planned for winter break to bolster Asset Management applications.'
  }
];

export const UNIVERSAL_TASKS_DATA: UniversalTask[] = [];

export const GRADUATE_SCHEMES_DATA: GraduateScheme[] = [];

export const TIMELINE_DATA: TimelineItem[] = [];
export const PART_TIME_DATA: PartTimeRole[] = [];
export const PRIORITY_TRACKER_DATA: PriorityTrackerItem[] = [];
export const KEY_NOTES_SECTIONS: NoteSection[] = [];


