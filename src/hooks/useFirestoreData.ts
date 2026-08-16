import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

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
  content: string; // The markdown or raw text
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

export const DEFAULT_TRACKER_DATA: UserTrackerData = {
  userName: 'Guest',
  degreeName: 'Degree Program',
  universityName: 'University',
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
  hourlyRate: 11.44, // Default UK minimum wage or typical part-time rate
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

export const sanitizeUserData = (raw: any): UserTrackerData => {
  const source = raw || {};
  return {
    ...DEFAULT_TRACKER_DATA,
    ...source,
    paperTrading: {
      cashBalance: source.paperTrading?.cashBalance ?? DEFAULT_TRACKER_DATA.paperTrading!.cashBalance,
      startingCapital: source.paperTrading?.startingCapital ?? DEFAULT_TRACKER_DATA.paperTrading!.startingCapital,
      positions: Array.isArray(source.paperTrading?.positions) ? source.paperTrading.positions : [],
      tradeHistory: Array.isArray(source.paperTrading?.tradeHistory) ? source.paperTrading.tradeHistory : [],
      academyProgress: source.paperTrading?.academyProgress || {}
    },
    resumes: Array.isArray(source.resumes) ? source.resumes : DEFAULT_TRACKER_DATA.resumes,
    newsPreferences: Array.isArray(source.newsPreferences) ? source.newsPreferences : DEFAULT_TRACKER_DATA.newsPreferences,
    savedArticles: Array.isArray(source.savedArticles) ? source.savedArticles : DEFAULT_TRACKER_DATA.savedArticles,
    jobPreferences: source.jobPreferences || DEFAULT_TRACKER_DATA.jobPreferences,
    jobApplications: Array.isArray(source.jobApplications) ? source.jobApplications : DEFAULT_TRACKER_DATA.jobApplications,
    trips: Array.isArray(source.trips) ? source.trips : DEFAULT_TRACKER_DATA.trips,
    tripExpenses: Array.isArray(source.tripExpenses) ? source.tripExpenses : DEFAULT_TRACKER_DATA.tripExpenses,
    transitRoutes: Array.isArray(source.transitRoutes) ? source.transitRoutes : DEFAULT_TRACKER_DATA.transitRoutes,
    subscriptions: Array.isArray(source.subscriptions) ? source.subscriptions : DEFAULT_TRACKER_DATA.subscriptions,
    techAssets: Array.isArray(source.techAssets) ? source.techAssets : DEFAULT_TRACKER_DATA.techAssets,
    vehicleCosts: Array.isArray(source.vehicleCosts) ? source.vehicleCosts : DEFAULT_TRACKER_DATA.vehicleCosts,
    extraItems: Array.isArray(source.extraItems) ? source.extraItems : DEFAULT_TRACKER_DATA.extraItems,
    timeline: (Array.isArray(source.timeline) && source.timeline.length > 0) ? source.timeline : DEFAULT_TRACKER_DATA.timeline,
    gradSchemes: (Array.isArray(source.gradSchemes) && source.gradSchemes.length > 0) ? source.gradSchemes : DEFAULT_TRACKER_DATA.gradSchemes,
    partTimeRoles: (Array.isArray(source.partTimeRoles) && source.partTimeRoles.length > 0) ? source.partTimeRoles : DEFAULT_TRACKER_DATA.partTimeRoles,
    priorityItems: (Array.isArray(source.priorityItems) && source.priorityItems.length > 0) ? source.priorityItems : DEFAULT_TRACKER_DATA.priorityItems,
    notesSections: (Array.isArray(source.notesSections) && source.notesSections.length > 0) ? source.notesSections : DEFAULT_TRACKER_DATA.notesSections,
    skillsTracker: (Array.isArray(source.skillsTracker) && source.skillsTracker.length > 0) ? source.skillsTracker : DEFAULT_TRACKER_DATA.skillsTracker,
    courses: (Array.isArray(source.courses) && source.courses.length > 0) ? source.courses : DEFAULT_TRACKER_DATA.courses,
    universalTasks: (Array.isArray(source.universalTasks) && source.universalTasks.length > 0) ? source.universalTasks : DEFAULT_TRACKER_DATA.universalTasks,
    workShifts: Array.isArray(source.workShifts) ? source.workShifts : DEFAULT_TRACKER_DATA.workShifts,
    expenses: Array.isArray(source.expenses) ? source.expenses : DEFAULT_TRACKER_DATA.expenses,
    creditCards: Array.isArray(source.creditCards) ? source.creditCards : DEFAULT_TRACKER_DATA.creditCards,
    invoices: Array.isArray(source.invoices) ? source.invoices : DEFAULT_TRACKER_DATA.invoices,
    uniClasses: Array.isArray(source.uniClasses) ? source.uniClasses : DEFAULT_TRACKER_DATA.uniClasses,
    gradeEntries: Array.isArray(source.gradeEntries) ? source.gradeEntries : DEFAULT_TRACKER_DATA.gradeEntries,
    notebooks: Array.isArray(source.notebooks) ? source.notebooks : DEFAULT_TRACKER_DATA.notebooks,
    studyDocs: Array.isArray(source.studyDocs) ? source.studyDocs : DEFAULT_TRACKER_DATA.studyDocs,
    activeNotebookId: source.activeNotebookId,
    activeGroundingDocId: source.activeGroundingDocId
  };
};

export function useFirestoreData() {
  const [data, setData] = useState<UserTrackerData>(() => {
    try {
      const localDataStr = localStorage.getItem('userTrackerData');
      if (localDataStr) {
        const parsed = JSON.parse(localDataStr);
        return sanitizeUserData(parsed);
      }
    } catch (e) {
      console.warn('Failed to parse local userTrackerData', e);
    }
    return DEFAULT_TRACKER_DATA;
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

  // Helper to get / save offline queue
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

  // Flush offline queue to Firestore
  const flushOfflineQueue = async () => {
    const user = auth.currentUser;
    if (!user || !navigator.onLine) return;

    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    try {
      setSyncStatus('saving');
      const docRef = doc(db, 'users', user.uid);
      // Merge all queued partial updates into a single payload
      const mergedPayload = queue.reduce((acc, item) => ({ ...acc, ...item }), {});
      await setDoc(docRef, mergedPayload, { merge: true });
      
      // Clear queue after successful flush
      saveOfflineQueue([]);
      setSyncStatus('saved');
    } catch (err) {
      console.error('Failed to flush offline queue:', err);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    // Initialize offline queue length counter
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
  
  // Fallback safety timer: ensure loading state is guaranteed to resolve within 2.5s
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    let currentUnsubDoc: (() => void) | null = null;
    let authSafetyTimer: any = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Per-auth-change safety timeout to guarantee loading unblocks
      if (authSafetyTimer) clearTimeout(authSafetyTimer);
      authSafetyTimer = setTimeout(() => {
        setLoading(false);
      }, 2500);

      // Clean up previous doc subscription if user changed
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
          
          // Setup real-time listener with error callback
          currentUnsubDoc = onSnapshot(
            docRef, 
            (docSnap) => {
              if (authSafetyTimer) clearTimeout(authSafetyTimer);
              try {
                if (docSnap.exists()) {
                  const fbData = docSnap.data();
                  const merged = sanitizeUserData(fbData);
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
                  // Initialize with default data or migrate from local storage
                  const localDataStr = localStorage.getItem('userTrackerData');
                  let initialData = DEFAULT_TRACKER_DATA;
                  try {
                    if (localDataStr) initialData = sanitizeUserData(JSON.parse(localDataStr));
                  } catch {}
                  
                  setDoc(docRef, initialData, { merge: true }).then(() => {
                    setData(initialData);
                    try {
                      localStorage.setItem('userTrackerData', JSON.stringify(initialData));
                    } catch (e) {
                      console.warn('Could not save to localStorage:', e);
                    }
                    setLoading(false);
                    if (navigator.onLine) setSyncStatus('saved');
                  }).catch(err => {
                    console.warn('Initial doc creation notice (falling back to local cache):', err?.message || err);
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
              if (!navigator.onLine) {
                setSyncStatus('offline');
              } else {
                setSyncStatus('saved');
              }
            }
          );
        } catch (err) {
          if (authSafetyTimer) clearTimeout(authSafetyTimer);
          console.warn('Failed to attach Firestore snapshot listener (handled):', err);
          setLoading(false);
        }
      } else {
        if (authSafetyTimer) clearTimeout(authSafetyTimer);
        setSyncStatus('offline');
        const localData = localStorage.getItem('userTrackerData');
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            setData(sanitizeUserData(parsed));
          } catch {
            setData(DEFAULT_TRACKER_DATA);
          }
        } else {
          setData(DEFAULT_TRACKER_DATA);
          try {
            localStorage.setItem('userTrackerData', JSON.stringify(DEFAULT_TRACKER_DATA));
          } catch (e) {
            console.warn('Could not save to localStorage:', e);
          }
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

  // Periodic Auto-Save Heartbeat (every 30 seconds syncs full state to Firestore if online)
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user && navigator.onLine && syncStatusRef.current !== 'saving') {
        try {
          // If there's an offline queue, flush it first
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
          console.warn('Periodic auto-save sync failed:', err);
          setSyncStatus('error');
        }
      } else if (!navigator.onLine) {
        setSyncStatus('offline');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [auth]);


  const updateData = async (partialData: Partial<UserTrackerData>) => {
    setData(prev => {
      const newData = sanitizeUserData({ ...prev, ...partialData });
      try {
        localStorage.setItem('userTrackerData', JSON.stringify(newData));
      } catch (err) {
        console.warn('Could not save to localStorage', err);
      }
      return newData;
    });

    const user = auth.currentUser;
    if (user) {
      if (!navigator.onLine) {
        // Queue mutation offline
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
        // Check if any offline items remain and flush
        const queue = getOfflineQueue();
        if (queue.length > 0) {
          await flushOfflineQueue();
        }
      } catch (err) {
        console.error('Failed to sync to Firestore, queueing offline', err);
        const queue = getOfflineQueue();
        queue.push(partialData);
        saveOfflineQueue(queue);
        setSyncStatus('queued');
      }
    }
  };

  const resetToDemoData = async () => {
    try {
      localStorage.setItem('userTrackerData', JSON.stringify(DEFAULT_TRACKER_DATA));
      setData(DEFAULT_TRACKER_DATA);
      saveOfflineQueue([]);
      const user = auth.currentUser;
      if (user && navigator.onLine) {
        setSyncStatus('saving');
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, DEFAULT_TRACKER_DATA);
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
