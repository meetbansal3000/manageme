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

export interface GoogleSyncState {
  isConnected: boolean;
  userEmail: string | null;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSynced: string | null;
  isSyncing: boolean;
  error: string | null;
  accessToken: string | null;
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
  rating?: number; // 1-5
}

export interface CourseCertification {
  id: string;
  title: string;
  provider: string; // e.g. Coursera, Outskill, CFA Institute, Bloomberg, CFI
  status: 'Planned' | 'In Progress' | 'Completed';
  targetDate?: string;
  progress: number; // 0 to 100
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

export interface AppSettings {
  theme: string;
  fontScale: 'small' | 'medium' | 'large';
  animationsEnabled: boolean;
  hideFloatingDock: boolean;
  autoHideDockWhenTyping: boolean;
  dockPosition: 'center' | 'left' | 'right';
  dockCollapsed: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'error' | 'api' | 'storage';
  message: string;
  details?: any;
}

// --- FINANCIAL & JOB TRACKING TYPES ---

export interface WorkShift {
  timestamp?: number;
  id: string;
  date: string;
  description?: string;
  roleTitle?: string;
  startTime: string;
  endTime: string;
  hours: number;
  hourlyRate?: number;
  rateMultiplier?: number;
  totalEarned?: number;
  notes?: string;
  location?: string;
}

export interface Expense {
  peerName?: string;
  splitRatio?: number;
  splitWith?: string;
  splitType?: 'equal' | 'custom';
  owedToMe?: number;
  iOwe?: number;
  settled?: boolean;
  timestamp?: number;
  id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  paymentMethod?: string;
  notes?: string;
  tags?: string[];
}

export interface CreditCard {
  id: string;
  cardName: string;
  statementBalance: number;
  paymentsMade: number;
  dueDate: string;
  creditLimit?: number;
  apr?: number;
  minPayment?: number;
  colorTheme?: string;
  notes?: string;
  statementCloseDate?: string;
}

export interface Invoice {
  id: string;
  vendor: string;
  date: string;
  description?: string;
  amount: number;
  fileBase64?: string; // We'll store metadata here, and base64 string in localStorage
  fileType: string;
  invoiceNumber?: string;
  category?: string;
  taxAmount?: number;
  status?: 'Paid' | 'Pending' | 'Reimbursed';
  notes?: string;
}

// --- UNIVERSITY TIMETABLE ---
export type TermStatus = 'Term Time' | 'Vacation';

export interface UniClass {
  timestamp?: number;
  id: string;
  moduleName: string;
  type: 'Lecture' | 'Seminar' | 'Workshop' | 'Exam Prep';
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  location: string;
  term: 'Michaelmas' | 'Epiphany' | 'Easter';
}

export type Currency = 'GBP' | 'USD' | 'INR';

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

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  currency: string;
  billingCycle: 'Monthly' | 'Yearly' | 'One-time';
  renewalDate: string;
  category?: string;
}

export interface TechAsset {
  id: string;
  name: string;
  purchaseDate: string;
  warrantyExpiry: string;
  tradeInValue: number;
}

export interface VehicleCost {
  id: string;
  vehicleName: string;
  purchasePrice: number;
  monthlyFinance?: number;
  depreciation?: number;
  insurance: number;
  servicing?: number;
  maintenance?: number;
  fuel: number;
  parking?: number;
  currency: string;
}

// --- Paper Trading & Portfolio Simulator Types ---

export interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  assetClass: 'Stock' | 'ETF' | 'Commodity' | 'FX' | string;
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
}

export interface TradeOrder {
  id: string;
  symbol: string;
  type: 'Market' | 'Limit' | 'Stop-Loss' | 'Take-Profit' | string;
  side: 'Buy' | 'Sell' | string;
  quantity: number;
  targetPrice?: number; // for Limit/Stop
  executionPrice?: number; // null if pending
  status: 'Pending' | 'Executed' | 'Cancelled' | string;
  timestamp: number;
}

export interface PaperTradingData {
  cashBalance: number;
  startingCapital: number;
  positions: PortfolioPosition[];
  tradeHistory: TradeOrder[];
  academyProgress: Record<string, boolean>; // e.g. { 'dcf-basics': true }
}

// --- Chat & Peer Community Types ---
export interface ChatUser {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastActive: number;
}

export interface ChatMessage {
  id: string;
  channelId: string; // "general" or dm ID like "userA_userB"
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'location';
  mediaMeta?: any; // any extra payload
  sharedCard?: {
    type: 'news' | 'trading' | 'job' | 'trip';
    title: string;
    description: string;
    url?: string;
    extraData?: any;
  };
}

export interface ChatChannel {
  id: string; // e.g. 'general', 'finance-interviews', or '{userId1}_{userId2}'
  name: string;
  type: 'global' | 'dm';
  participants?: string[]; // for DMs
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount?: number;
}

// --- AI Multi-Model Assistance Types ---
export type AIProviderId = 'gemini' | 'openai' | 'claude' | 'custom';

export type AIPersona = 
  | 'career-strategist' 
  | 'finance-analyst' 
  | 'interview-coach' 
  | 'ats-optimizer' 
  | 'general-copilot';

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProviderId;
  description: string;
  badge?: string;
  recommended?: boolean;
  contextWindow?: string;
}

export interface AIAssistantConfig {
  activeProvider: AIProviderId;
  activeModel: string;
  persona: AIPersona;
  temperature: number;
  systemPromptOverride?: string;
  autoExecuteMutations: boolean;
  searchGrounding: boolean;
  customEndpoint?: string;
  customApiKey?: string;
  connectedProviders: {
    gemini: boolean;
    openai: boolean;
    claude: boolean;
    custom: boolean;
  };
}

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'model' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  provider?: AIProviderId;
  model?: string;
  mutations?: Record<string, any>;
  suggestedActions?: {
    id: string;
    label: string;
    actionType: 'mutate' | 'navigate' | 'export' | 'copy';
    payload?: any;
  }[];
  citations?: { title: string; url: string }[];
  groundingSources?: { title?: string; uri?: string }[];
  mapsSources?: { title?: string; uri?: string }[];
  audioBase64?: string;
  thinkingLevel?: string;
  imageUrl?: string;
  isError?: boolean;
}

// --- Virtual Notebook Workspace Types ---
export interface VirtualNotebook {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  color?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'purple';
  docIds: string[]; // Document IDs assigned to this notebook
  notes?: string; // Notebook-specific notes / markdown scratchpad
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

export type { ExamDeadline } from './utils/deadlines';
