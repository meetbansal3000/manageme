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

export const UNIVERSAL_TASKS_DATA: UniversalTask[] = [
  {
    id: 't-1',
    title: 'Complete ACCA DipIFR Exam Registration by 6 October deadline',
    priority: 'High',
    dueDate: '2026-10-06',
    completed: false,
    category: 'ACCA / Academics',
    notes: 'Pay £168 registration fee through myACCA portal.'
  },
  {
    id: 't-2',
    title: 'Submit BlackRock 2027 Graduate Analyst Application (Rolling Cutoff)',
    priority: 'High',
    dueDate: '2026-09-28',
    completed: false,
    category: 'Job Applications',
    notes: 'Tailor resume for Asset Management stream and practice SHL numerical tests.'
  },
  {
    id: 't-3',
    title: 'Book UK Biometric Residence Permit (BRP) collection',
    priority: 'High',
    dueDate: '2026-09-22',
    completed: true,
    completedAt: '2026-09-18',
    category: 'Arrival Checklist',
    notes: 'Collected from local Post Office within 10-day window.'
  },
  {
    id: 't-4',
    title: 'Finalize Lazard M&A technical pitch & DCF valuation sheet',
    priority: 'Medium',
    dueDate: '2026-10-10',
    completed: false,
    category: 'Interview Prep',
    notes: 'Prepare 3-minute stock pitch and defensible terminal growth assumptions.'
  },
  {
    id: 't-5',
    title: 'Open UK Student Bank Account (Monzo / Barclays)',
    priority: 'Medium',
    dueDate: '2026-09-25',
    completed: true,
    completedAt: '2026-09-20',
    category: 'Arrival Checklist',
    notes: 'Account verified with university letter of attendance.'
  },
  {
    id: 't-6',
    title: 'Schedule weekly 20-hour part-time work visa shifts on Mon/Thu/Sat',
    priority: 'Low',
    dueDate: '2026-10-02',
    completed: false,
    category: 'Finance & Shifts',
    notes: 'Ensure compliance with UK Tier 4 visa 20-hour term-time maximum.'
  }
];

export const GRADUATE_SCHEMES_DATA: GraduateScheme[] = [
  {
    id: 'gs-1',
    rank: 1,
    firm: 'BlackRock',
    sector: 'Asset Management',
    roleTitle: 'Global Investment Graduate Programme',
    appOpens: '01 Sep 2026',
    appCloses: '31 Oct 2026 (Rolling)',
    salary: '£65,000 - £75,000',
    bonus: '£10,000 - £20,000',
    filterRisk: 'Medium',
    accaAdvantage: 'High',
    difficulty: 'Very Hard',
    applyVia: 'https://careers.blackrock.com',
    notes: 'Top priority target. Rolling applications — submit within first 2 weeks. Strong emphasis on Aladdin technology & quantitative finance.',
    status: 'To Apply',
    skills: ['Asset Allocation', 'Python', 'Aladdin', 'Financial Modeling', 'ESG']
  },
  {
    id: 'gs-2',
    rank: 2,
    firm: 'Schroders',
    sector: 'Asset Management',
    roleTitle: 'UK Investment Graduate Analyst',
    appOpens: '05 Sep 2026',
    appCloses: '15 Nov 2026',
    salary: '£60,000 - £68,000',
    bonus: '£8,000 - £15,000',
    filterRisk: 'Low',
    accaAdvantage: 'Very High',
    difficulty: 'Hard',
    applyVia: 'https://www.schroders.com/en/careers',
    notes: 'Excellent culture and high ACCA appreciation. 3-rotation scheme across Fixed Income, Multi-Asset, and Equity research.',
    status: 'To Apply',
    skills: ['Fixed Income', 'Equity Research', 'Valuation', 'DCF', 'Xero']
  },
  {
    id: 'gs-3',
    rank: 3,
    firm: 'Lazard',
    sector: 'M&A Advisory',
    roleTitle: 'Financial Advisory Graduate Analyst (London)',
    appOpens: '01 Sep 2026',
    appCloses: '25 Oct 2026',
    salary: '£75,000 - £85,000',
    bonus: '£30,000 - £50,000',
    filterRisk: 'High',
    accaAdvantage: 'High',
    difficulty: 'Very Hard',
    applyVia: 'https://lazard.com/careers',
    notes: 'Elite boutique with pure M&A advisory focus. Requires flawless technical modeling and M&A deal rationale knowledge.',
    status: 'To Apply',
    skills: ['M&A Advisory', '3-Statement Modeling', 'LBO', 'Valuation', 'Pitch Decks']
  },
  {
    id: 'gs-4',
    rank: 4,
    firm: 'Rothschild & Co',
    sector: 'M&A Advisory',
    roleTitle: 'Global Advisory Graduate Programme',
    appOpens: '01 Sep 2026',
    appCloses: '01 Nov 2026',
    salary: '£72,000 - £80,000',
    bonus: '£25,000 - £40,000',
    filterRisk: 'Medium',
    accaAdvantage: 'High',
    difficulty: 'Very Hard',
    applyVia: 'https://www.rothschildandco.com/en/careers',
    notes: 'Extensive deal flow across European mid-market & large-cap. Online testing uses bespoke SHL assessment.',
    status: 'To Apply',
    skills: ['Financial Modeling', 'Corporate Finance', 'Valuation', 'Public Speaking']
  },
  {
    id: 'gs-5',
    rank: 5,
    firm: 'Deloitte',
    sector: 'Audit / Advisory',
    roleTitle: 'Financial Advisory / Corporate Finance Graduate',
    appOpens: '01 Sep 2026',
    appCloses: 'Rolling',
    salary: '£42,000 - £48,000',
    bonus: '£3,000 - £6,000',
    filterRisk: 'Low',
    accaAdvantage: 'Very High',
    difficulty: 'Medium',
    applyVia: 'https://www.deloitte.com/uk/careers',
    notes: 'Direct fast-track for ACCA/ACA qualified candidates with full exam exemptions. Strong Restructuring & Transaction Services teams.',
    status: 'Applied',
    skills: ['ACCA / IFRS', 'Restructuring', 'Due Diligence', 'Power BI']
  },
  {
    id: 'gs-6',
    rank: 6,
    firm: 'Morgan Stanley',
    sector: 'Asset Management',
    roleTitle: 'Investment Management Analyst',
    appOpens: '10 Sep 2026',
    appCloses: '20 Nov 2026',
    salary: '£70,000 - £78,000',
    bonus: '£15,000 - £25,000',
    filterRisk: 'High',
    accaAdvantage: 'Medium',
    difficulty: 'Very Hard',
    applyVia: 'https://morganstanley.com/careers',
    notes: 'MSIM Real Estate & Private Credit divisions valuing analytical modeling and macroeconomic awareness.',
    status: 'To Apply',
    skills: ['Private Credit', 'Real Estate PE', 'Python', 'Financial Modeling']
  }
];

export const TIMELINE_DATA: TimelineItem[] = [];
export const PART_TIME_DATA: PartTimeRole[] = [];
export const PRIORITY_TRACKER_DATA: PriorityTrackerItem[] = [];
export const KEY_NOTES_SECTIONS: NoteSection[] = [
  {
    id: 'n-placeholder',
    title: 'Master Checklist',
    bgColor: '#161617',
    textColor: '#ffffff',
    items: [
      { id: 'c-1', title: 'Add your first goal', details: 'Update this in the tracker', completed: false }
    ]
  }
];

