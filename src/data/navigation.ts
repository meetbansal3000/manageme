// Data Schema: Navigation Tabs, Breadcrumb Maps & Keyboard Shortcuts

export type AppTab = 
  | 'landing'
  | 'news'
  | 'study'
  | 'metasuite'
  | 'jobs'
  | 'outreach'
  | 'tasks'
  | 'uni'
  | 'finance'
  | 'trading'
  | 'work'
  | 'skills'
  | 'travel'
  | 'transit'
  | 'places'
  | 'chat'
  | 'resume'
  | 'privacy'
  | 'terms';

export interface TabConfig {
  id: AppTab;
  label: string;
  category: 'core' | 'intelligence' | 'finance' | 'lifestyle' | 'legal';
  iconName: string;
  badge?: string;
  description: string;
}

export const PRIMARY_TABS: AppTab[] = [
  'landing',
  'news',
  'study',
  'metasuite',
  'jobs',
  'outreach',
  'tasks',
  'uni',
  'finance',
  'trading',
  'work',
  'skills',
  'travel',
  'transit',
  'chat',
  'resume',
  'privacy',
  'terms'
];

export const TAB_CONFIGS: TabConfig[] = [
  { id: 'landing', label: 'Overview', category: 'core', iconName: 'Sparkles', description: 'Interactive landing overview' },
  { id: 'news', label: 'Financial News', category: 'intelligence', iconName: 'Globe', description: 'Live market feeds & analysis' },
  { id: 'study', label: 'Study Engine', category: 'intelligence', iconName: 'BookOpen', description: 'Virtual notebooks & flashcards' },
  { id: 'metasuite', label: 'Executive AI', category: 'intelligence', iconName: 'Brain', description: 'Strategic LLM co-pilot' },
  { id: 'jobs', label: 'Career Vault', category: 'core', iconName: 'Briefcase', description: 'Graduate schemes & applications' },
  { id: 'outreach', label: 'Outreach CRM', category: 'core', iconName: 'Send', description: 'Recruiter contacts & email drafts' },
  { id: 'tasks', label: 'Priority Matrix', category: 'core', iconName: 'CheckSquare', description: 'Checklists & key deliverables' },
  { id: 'uni', label: 'Uni Timetable', category: 'lifestyle', iconName: 'Calendar', description: 'Class schedules & lecture halls' },
  { id: 'finance', label: 'Finance Hub', category: 'finance', iconName: 'DollarSign', description: 'Budgeting, cards & splitwise' },
  { id: 'trading', label: 'Trading Desk', category: 'finance', iconName: 'TrendingUp', description: 'Paper trading & multi-asset terminal' },
  { id: 'work', label: 'Work Shifts', category: 'finance', iconName: 'Clock', description: 'Part-time earnings & shift logs' },
  { id: 'skills', label: 'Skills & Certs', category: 'core', iconName: 'Award', description: 'CFA, Coursera & technical ratings' },
  { id: 'travel', label: 'Travel & Trips', category: 'lifestyle', iconName: 'Compass', description: 'Trip expenses & destination guides' },
  { id: 'transit', label: 'TfL Transit', category: 'lifestyle', iconName: 'Navigation', description: 'Live London transit intelligence' },
  { id: 'chat', label: 'Peer Network', category: 'intelligence', iconName: 'MessageSquare', description: 'Encrypted peer chat & rooms' },
  { id: 'resume', label: 'Resume Vault', category: 'core', iconName: 'FileText', description: 'ATS resume versions & templates' },
  { id: 'privacy', label: 'Privacy Policy', category: 'legal', iconName: 'Shield', description: 'Data privacy & compliance' },
  { id: 'terms', label: 'Terms of Service', category: 'legal', iconName: 'FileCheck', description: 'Platform terms & usage policies' }
];

export const KEYBOARD_SHORTCUTS = [
  { key: 'Cmd / Ctrl + K', description: 'Open Command Palette' },
  { key: 'Cmd / Ctrl + J', description: 'Toggle Gemini AI Copilot' },
  { key: 'Ctrl + Shift + E', description: 'Quick-log an Expense' },
  { key: 'Ctrl + Shift + S', description: 'Quick-log a Work Shift' },
  { key: 'Esc', description: 'Dismiss Active Modal / Drawer' }
];
