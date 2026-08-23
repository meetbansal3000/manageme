import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { supabase, getSupabaseUserId } from '../lib/supabase';

import { 
  TIMELINE_DATA, 
  GRADUATE_SCHEMES_DATA, 
  PART_TIME_DATA, 
  PRIORITY_TRACKER_DATA, 
  KEY_NOTES_SECTIONS, 
  SKILLS_DATA,
  COURSES_DATA,
  UNIVERSAL_TASKS_DATA
} from '../data/trackerData';
import { 
  TimelineItem, 
  GraduateScheme, 
  PartTimeRole, 
  PriorityTrackerItem, 
  NoteSection, 
  SkillTask, 
  WorkShift, 
  Expense, 
  CreditCard, 
  Invoice, 
  UniClass, 
  TermStatus, 
  Currency, 
  GradeEntry,
  CourseCertification,
  UniversalTask,
  NewsArticle, 
  JobApplication, 
  JobPreferences, 
  Trip, 
  TripExpense, 
  TransitRoute, 
  PlaceRecommendation,
  Subscription, 
  TechAsset, 
  VehicleCost,
  PaperTradingData,
  VirtualNotebook
} from '../types';

export interface ResumeVariant {
  id: string;
  name: string;
  targetRole: string;
  content: string;
  dateCreated: string;
  matchScore?: number;
}

export interface UserTrackerData {
  userName?: string;
  degreeName?: string;
  universityName?: string;
  targetSectors?: string[];
  location?: string;
  paperTrading?: PaperTradingData;
  resumes?: ResumeVariant[];
  newsPreferences?: string[];
  savedArticles?: NewsArticle[];
  jobPreferences?: JobPreferences;
  jobApplications?: JobApplication[];
  trips?: Trip[];
  tripExpenses?: TripExpense[];
  transitRoutes?: TransitRoute[];
  places?: PlaceRecommendation[];
  subscriptions?: Subscription[];
  techAssets?: TechAsset[];
  vehicleCosts?: VehicleCost[];
  extraItems: any[];
  timeline: TimelineItem[];
  gradSchemes: GraduateScheme[];
  partTimeRoles: PartTimeRole[];
  priorityItems: PriorityTrackerItem[];
  notesSections: NoteSection[];
  skillsTracker: SkillTask[];
  courses: CourseCertification[];
  universalTasks: UniversalTask[];
  profileSummary: string;
  
  // Financial Tracking
  hourlyRate: number;
  workShifts: WorkShift[];
  expenses: Expense[];
  creditCards: CreditCard[];
  invoices: Invoice[];
  uniClasses: UniClass[];
  termStatus: TermStatus;
  visaLimit?: number;
  currency?: Currency;
  gradeEntries?: GradeEntry[];
  notebooks?: VirtualNotebook[];
  activeNotebookId?: string;
  studyDocs?: any[];
  activeGroundingDocId?: string;
}

const DEFAULT_PROFILE = "manageme | Finance & Executive Career Management Suite";

// Clean Slate Template for Authenticated Real Users
export const EMPTY_TRACKER_DATA: UserTrackerData = {
  userName: 'User',
  degreeName: '',
  universityName: '',
  targetSectors: [],
  location: '',
  paperTrading: {
    cashBalance: 100000,
    startingCapital: 100000,
    positions: [],
    tradeHistory: [],
    academyProgress: {}
  },
  resumes: [],
  newsPreferences: [],
  savedArticles: [],
  jobPreferences: { categories: [], locations: [], salaryRange: '', currency: '£', experienceLevel: 'Graduate / Entry' },
  jobApplications: [],
  trips: [],
  tripExpenses: [],
  transitRoutes: [],
  places: [],
  subscriptions: [],
  techAssets: [],
  vehicleCosts: [],
  extraItems: [],
  timeline: [],
  gradSchemes: [],
  partTimeRoles: [],
  priorityItems: [],
  notesSections: [],
  skillsTracker: [],
  courses: [],
  universalTasks: [],
  profileSummary: DEFAULT_PROFILE,
  hourlyRate: 11.44,
  workShifts: [],
  expenses: [],
  creditCards: [],
  invoices: [],
  uniClasses: [],
  termStatus: 'Term Time',
  currency: 'GBP',
  gradeEntries: [],
  notebooks: [],
  studyDocs: []
};

// Pre-populated Demo Mock Data (For Guest Mode / Public Showcase ONLY)
export const DEMO_TRACKER_DATA: UserTrackerData = {
  userName: 'Guest Executive',
  degreeName: 'BSc Economics & Finance',
  universityName: 'Durham University',
  targetSectors: ['Asset Management', 'M&A Advisory', 'Corporate Finance'],
  location: 'London, UK',
  paperTrading: {
    cashBalance: 100000,
    startingCapital: 100000,
    positions: [],
    tradeHistory: [],
    academyProgress: {}
  },
  resumes: [],
  newsPreferences: [],
  savedArticles: [],
  jobPreferences: { categories: ['Asset Management', 'M&A Advisory', 'Audit / Corporate Finance'], locations: ['On-site', 'Hybrid'], salaryRange: '£60,000 - £85,000', currency: '£', experienceLevel: 'Graduate / Entry' },
  jobApplications: [],
  trips: [],
  tripExpenses: [],
  transitRoutes: [],
  places: [],
  subscriptions: [],
  techAssets: [],
  vehicleCosts: [],
  extraItems: [],
  timeline: TIMELINE_DATA,
  gradSchemes: GRADUATE_SCHEMES_DATA,
  partTimeRoles: PART_TIME_DATA,
  priorityItems: PRIORITY_TRACKER_DATA,
  notesSections: KEY_NOTES_SECTIONS,
  skillsTracker: SKILLS_DATA,
  courses: COURSES_DATA,
  universalTasks: UNIVERSAL_TASKS_DATA,
  profileSummary: DEFAULT_PROFILE,
  hourlyRate: 12.50,
  workShifts: [],
  expenses: [],
  creditCards: [],
  invoices: [],
  uniClasses: [],
  termStatus: 'Term Time',
  currency: 'GBP',
  gradeEntries: [],
  notebooks: [],
  studyDocs: []
};

export const DEFAULT_TRACKER_DATA = EMPTY_TRACKER_DATA;

// Helper to check if current mode is Guest / Demo
export const isGuestOrDemoMode = (): boolean => {
  try {
    return localStorage.getItem('manageme_guest_session') === 'true';
  } catch {
    return false;
  }
};

export const sanitizeUserData = (raw: any, forceDemo: boolean = false): UserTrackerData => {
  const source = raw || {};
  const isDemo = forceDemo || isGuestOrDemoMode();
  const base = isDemo ? DEMO_TRACKER_DATA : EMPTY_TRACKER_DATA;

  return {
    ...base,
    ...source,
    paperTrading: {
      cashBalance: source.paperTrading?.cashBalance ?? base.paperTrading!.cashBalance,
      startingCapital: source.paperTrading?.startingCapital ?? base.paperTrading!.startingCapital,
      positions: Array.isArray(source.paperTrading?.positions) ? source.paperTrading.positions : base.paperTrading!.positions,
      tradeHistory: Array.isArray(source.paperTrading?.tradeHistory) ? source.paperTrading.tradeHistory : base.paperTrading!.tradeHistory,
      academyProgress: source.paperTrading?.academyProgress || {}
    },
    resumes: Array.isArray(source.resumes) ? source.resumes : base.resumes,
    newsPreferences: Array.isArray(source.newsPreferences) ? source.newsPreferences : base.newsPreferences,
    savedArticles: Array.isArray(source.savedArticles) ? source.savedArticles : base.savedArticles,
    jobPreferences: source.jobPreferences || base.jobPreferences,
    jobApplications: Array.isArray(source.jobApplications) ? source.jobApplications : base.jobApplications,
    trips: Array.isArray(source.trips) ? source.trips : base.trips,
    tripExpenses: Array.isArray(source.tripExpenses) ? source.tripExpenses : base.tripExpenses,
    transitRoutes: Array.isArray(source.transitRoutes) ? source.transitRoutes : base.transitRoutes,
    places: Array.isArray(source.places) ? source.places : (base.places || []),
    subscriptions: Array.isArray(source.subscriptions) ? source.subscriptions : base.subscriptions,
    techAssets: Array.isArray(source.techAssets) ? source.techAssets : base.techAssets,
    vehicleCosts: Array.isArray(source.vehicleCosts) ? source.vehicleCosts : base.vehicleCosts,
    extraItems: Array.isArray(source.extraItems) ? source.extraItems : base.extraItems,
    timeline: Array.isArray(source.timeline) ? source.timeline : base.timeline,
    gradSchemes: Array.isArray(source.gradSchemes) ? source.gradSchemes : base.gradSchemes,
    partTimeRoles: Array.isArray(source.partTimeRoles) ? source.partTimeRoles : base.partTimeRoles,
    priorityItems: Array.isArray(source.priorityItems) ? source.priorityItems : base.priorityItems,
    notesSections: Array.isArray(source.notesSections) ? source.notesSections : base.notesSections,
    skillsTracker: Array.isArray(source.skillsTracker) ? source.skillsTracker : base.skillsTracker,
    courses: Array.isArray(source.courses) ? source.courses : base.courses,
    universalTasks: Array.isArray(source.universalTasks) ? source.universalTasks : base.universalTasks,
    workShifts: Array.isArray(source.workShifts) ? source.workShifts : base.workShifts,
    expenses: Array.isArray(source.expenses) ? source.expenses : base.expenses,
    creditCards: Array.isArray(source.creditCards) ? source.creditCards : base.creditCards,
    invoices: Array.isArray(source.invoices) ? source.invoices : base.invoices,
    uniClasses: Array.isArray(source.uniClasses) ? source.uniClasses : base.uniClasses,
    gradeEntries: Array.isArray(source.gradeEntries) ? source.gradeEntries : base.gradeEntries,
    notebooks: Array.isArray(source.notebooks) ? source.notebooks : base.notebooks,
    studyDocs: Array.isArray(source.studyDocs) ? source.studyDocs : base.studyDocs,
    activeNotebookId: source.activeNotebookId,
    activeGroundingDocId: source.activeGroundingDocId
  };
};

export function useFirestoreData() {
  const [data, setData] = useState<UserTrackerData>(() => {
    let baseData = isGuestOrDemoMode() ? DEMO_TRACKER_DATA : EMPTY_TRACKER_DATA;
    try {
      const localDataStr = localStorage.getItem('userTrackerData');
      if (localDataStr) {
        baseData = sanitizeUserData(JSON.parse(localDataStr));
      }

      // Merge persisted visa & wage shifts data
      const localShifts = localStorage.getItem('manageme_shifts_data');
      if (localShifts) {
        try {
          const parsedShifts = JSON.parse(localShifts);
          if (Array.isArray(parsedShifts)) {
            baseData.workShifts = parsedShifts;
          } else if (parsedShifts && Array.isArray(parsedShifts.workShifts)) {
            baseData.workShifts = parsedShifts.workShifts;
            if (typeof parsedShifts.hourlyRate === 'number') {
              baseData.hourlyRate = parsedShifts.hourlyRate;
            }
          }
        } catch (e) {
          console.warn('Failed to parse manageme_shifts_data', e);
        }
      }

      // Merge persisted priority tasks data
      const localTasks = localStorage.getItem('manageme_tasks_data');
      if (localTasks) {
        try {
          const parsedTasks = JSON.parse(localTasks);
          if (Array.isArray(parsedTasks)) {
            baseData.universalTasks = parsedTasks;
          }
        } catch (e) {
          console.warn('Failed to parse manageme_tasks_data', e);
        }
      }

      return baseData;
    } catch (e) {
      console.warn('Failed to parse local userTrackerData', e);
    }
    return baseData;
  });

  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'error' | 'offline' | 'queued'>('saved');
  const [offlineQueueLength, setOfflineQueueLength] = useState<number>(0);
  const [conflict, setConflict] = useState<{ local: UserTrackerData; remote: UserTrackerData } | null>(null);
  const auth = getAuth();

  const resolveConflict = async (choice: 'local' | 'remote') => {
    if (!conflict) return;
    const user = auth.currentUser;
    if (choice === 'local') {
      setData(conflict.local);
      localStorage.setItem('userTrackerData', JSON.stringify(conflict.local));
      if (user && navigator.onLine) {
        try {
          setSyncStatus('saving');
          const docRef = doc(db, 'users', user.uid);
          await setDoc(docRef, conflict.local);
          setSyncStatus('saved');
        } catch (err) {
          console.error('Failed to resolve conflict with local data:', err);
          setSyncStatus('error');
        }
      }
    } else {
      setData(conflict.remote);
      localStorage.setItem('userTrackerData', JSON.stringify(conflict.remote));
      setSyncStatus('saved');
    }
    setConflict(null);
  };

  const getOfflineQueue = (): Partial<UserTrackerData>[] => {
    try {
      const q = localStorage.getItem('offlineMutationQueue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  };

  const saveOfflineQueue = (queue: Partial<UserTrackerData>[]) => {
    try {
      localStorage.setItem('offlineMutationQueue', JSON.stringify(queue));
      setOfflineQueueLength(queue.length);
    } catch (e) {
      console.warn('Failed to save offline queue', e);
    }
  };

  const flushOfflineQueue = async () => {
    const user = auth.currentUser;
    if (!user || !navigator.onLine) return;

    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    try {
      setSyncStatus('saving');
      const docRef = doc(db, 'users', user.uid);
      const mergedPayload = queue.reduce((acc, item) => ({ ...acc, ...item }), {});
      await setDoc(docRef, mergedPayload, { merge: true });
      saveOfflineQueue([]);
      setSyncStatus('saved');
    } catch (err) {
      console.error('Failed to flush offline queue:', err);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    setOfflineQueueLength(getOfflineQueue().length);

    const handleOnline = () => {
      if (navigator.onLine) {
        flushOfflineQueue();
      }
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setSyncStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [auth]);

  // Sync with Supabase for logged in user session
  useEffect(() => {
    let isMounted = true;

    const syncSupabaseUserData = async () => {
      try {
        const userId = await getSupabaseUserId();
        const isGuest = isGuestOrDemoMode();
        
        if (userId && !isGuest) {
          const { data: trackerRow, error } = await supabase
            .from('user_trackers')
            .select('data')
            .eq('user_id', userId)
            .single();

          if (!error && trackerRow?.data && isMounted) {
            const cleanUserSanitized = sanitizeUserData(trackerRow.data, false);
            setData(cleanUserSanitized);
            localStorage.setItem('userTrackerData', JSON.stringify(cleanUserSanitized));
          }
        }
      } catch (err) {
        console.warn('[Supabase User Tracker Data fetch notice]:', err);
      }
    };

    syncSupabaseUserData();
  }, []);
  
  useEffect(() => {
    let currentUnsubDoc: (() => void) | null = null;
    let authSafetyTimer: any = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (authSafetyTimer) clearTimeout(authSafetyTimer);
      authSafetyTimer = setTimeout(() => {
        setLoading(false);
      }, 2000);

      if (currentUnsubDoc) {
        try {
          currentUnsubDoc();
        } catch (e) {
          console.warn('Error unsubscribing previous user doc listener:', e);
        }
        currentUnsubDoc = null;
      }

      if (user) {
        if (navigator.onLine) {
          flushOfflineQueue().catch(err => console.warn('Flush offline queue error:', err));
        } else {
          setSyncStatus('offline');
        }
        
        try {
          const docRef = doc(db, 'users', user.uid);
          
          currentUnsubDoc = onSnapshot(
            docRef, 
            (docSnap) => {
              if (authSafetyTimer) clearTimeout(authSafetyTimer);
              try {
                if (docSnap.exists()) {
                  const fbData = docSnap.data();
                  const merged = sanitizeUserData(fbData, false);
                  const queue = getOfflineQueue();
                  if (queue.length > 0 && !docSnap.metadata.hasPendingWrites && JSON.stringify(merged) !== JSON.stringify(data)) {
                    setConflict({ local: data, remote: merged });
                  } else {
                    setData(merged);
                    try {
                      localStorage.setItem('userTrackerData', JSON.stringify(merged));
                    } catch (e) {
                      console.warn('Could not save to localStorage:', e);
                    }
                  }
                  setLoading(false);
                  if (navigator.onLine) setSyncStatus('saved');
                } else {
                  // Initialize clean slate for real authenticated user
                  const cleanData = EMPTY_TRACKER_DATA;
                  setDoc(docRef, cleanData, { merge: true }).then(() => {
                    setData(cleanData);
                    try {
                      localStorage.setItem('userTrackerData', JSON.stringify(cleanData));
                    } catch (e) {
                      console.warn('Could not save to localStorage:', e);
                    }
                    setLoading(false);
                    if (navigator.onLine) setSyncStatus('saved');
                  }).catch(err => {
                    console.warn('Initial clean slate doc notice:', err?.message || err);
                    setLoading(false);
                    setSyncStatus('saved');
                  });
                }
              } catch (parseErr) {
                console.warn('Error processing doc snapshot:', parseErr);
                setLoading(false);
              }
            },
            (error) => {
              if (authSafetyTimer) clearTimeout(authSafetyTimer);
              console.warn('Firestore snapshot notice on user doc (handled):', error?.message || error);
              setLoading(false);
            }
          );
        } catch (err) {
          if (authSafetyTimer) clearTimeout(authSafetyTimer);
          console.warn('Failed to attach Firestore snapshot listener:', err);
          setLoading(false);
        }
      } else {
        if (authSafetyTimer) clearTimeout(authSafetyTimer);
        setSyncStatus('offline');
        const isGuest = isGuestOrDemoMode();
        const fallback = isGuest ? DEMO_TRACKER_DATA : EMPTY_TRACKER_DATA;
        const localData = localStorage.getItem('userTrackerData');
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            setData(sanitizeUserData(parsed, isGuest));
          } catch {
            setData(fallback);
          }
        } else {
          setData(fallback);
        }
        setLoading(false);
      }
    }, (authErr) => {
      console.warn('Auth state change listener notice:', authErr?.message || authErr);
      setLoading(false);
    });

    return () => {
      if (authSafetyTimer) clearTimeout(authSafetyTimer);
      if (currentUnsubDoc) {
        try {
          currentUnsubDoc();
        } catch (e) {
          console.warn('Error unsubscribing on unmount:', e);
        }
      }
      unsubscribeAuth();
    };
  }, [auth]);

  const dataRef = useRef(data);
  const syncStatusRef = useRef(syncStatus);
  dataRef.current = data;
  syncStatusRef.current = syncStatus;

  // Periodic Auto-Save Heartbeat
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user && navigator.onLine && syncStatusRef.current !== 'saving') {
        try {
          const queue = getOfflineQueue();
          if (queue.length > 0) {
            await flushOfflineQueue();
          } else {
            setSyncStatus('saving');
            const docRef = doc(db, 'users', user.uid);
            await setDoc(docRef, dataRef.current, { merge: true });
            setSyncStatus('saved');
          }
        } catch (err) {
          console.warn('Periodic auto-save sync notice:', err);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [auth]);

  const updateData = async (partialData: Partial<UserTrackerData>) => {
    setData(prev => {
      const isDemo = isGuestOrDemoMode();
      const newData = sanitizeUserData({ ...prev, ...partialData }, isDemo);
      try {
        localStorage.setItem('userTrackerData', JSON.stringify(newData));

        // Persist dedicated shifts & wage data
        if (partialData.workShifts !== undefined || partialData.hourlyRate !== undefined) {
          localStorage.setItem('manageme_shifts_data', JSON.stringify({
            workShifts: newData.workShifts || [],
            hourlyRate: newData.hourlyRate || 11.44
          }));
        }

        // Persist dedicated priority tasks data
        if (partialData.universalTasks !== undefined) {
          localStorage.setItem('manageme_tasks_data', JSON.stringify(newData.universalTasks || []));
        }
      } catch (err) {
        console.warn('Could not save to localStorage', err);
      }
      return newData;
    });

    // Owner Mode Backend & Sheets Sync
    if (!isGuestOrDemoMode()) {
      try {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'persist_state',
            data: { ...dataRef.current, ...partialData }
          })
        }).catch(e => console.warn('[Owner Backend Sync background notice]:', e));
      } catch (e) {}
    }

    // Supabase sync
    try {
      const userId = await getSupabaseUserId();
      if (userId && !isGuestOrDemoMode()) {
        await supabase
          .from('user_trackers')
          .upsert({
            user_id: userId,
            data: { ...dataRef.current, ...partialData },
            updated_at: new Date().toISOString()
          });
      }
    } catch (sbErr) {
      console.warn('[Supabase updateData sync notice]:', sbErr);
    }

    const user = auth.currentUser;
    if (user) {
      if (!navigator.onLine) {
        const queue = getOfflineQueue();
        queue.push(partialData);
        saveOfflineQueue(queue);
        setSyncStatus('offline');
        return;
      }

      try {
        setSyncStatus('saving');
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, partialData, { merge: true });
        setSyncStatus('saved');
        const queue = getOfflineQueue();
        if (queue.length > 0) {
          await flushOfflineQueue();
        }
      } catch (err) {
        console.warn('Failed to sync to Firestore, queueing offline:', err);
        const queue = getOfflineQueue();
        queue.push(partialData);
        saveOfflineQueue(queue);
        setSyncStatus('queued');
      }
    }
  };

  const resetToDemoData = async () => {
    try {
      localStorage.setItem('userTrackerData', JSON.stringify(DEMO_TRACKER_DATA));
      setData(DEMO_TRACKER_DATA);
      saveOfflineQueue([]);
      const user = auth.currentUser;
      if (user && navigator.onLine) {
        setSyncStatus('saving');
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, DEMO_TRACKER_DATA);
        setSyncStatus('saved');
      }
      return true;
    } catch (err) {
      console.error('Failed to reset demo data', err);
      setSyncStatus('error');
      return false;
    }
  };

  return { data, updateData, resetToDemoData, loading, syncStatus, offlineQueueLength, flushOfflineQueue, conflict, resolveConflict };
}
