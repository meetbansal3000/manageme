/**
 * Data Privacy, GDPR Compliance & Account Data Purge Utility
 * Provides data export (portability), complete user data deletion,
 * and PII masking/sanitization helpers.
 */

import { supabase } from '../lib/supabase';
import { auth } from '../firebase';

export interface DataPurgeResult {
  success: boolean;
  itemsCleared: string[];
  error?: string;
}

/**
 * Storage keys associated with user data and application state
 */
export const USER_DATA_STORAGE_KEYS = [
  'manageme_user_profile',
  'manageme_user_settings',
  'manageme_job_applications',
  'manageme_study_documents',
  'manageme_flashcards',
  'manageme_subscriptions',
  'manageme_vehicle_costs',
  'manageme_watchlists',
  'manageme_timetables',
  'manageme_deadlines',
  'manageme_api_keys',
  'manageme_active_ai_model',
  'manageme_active_grounding_doc',
  'manageme_active_grounding_doc_id',
  'manageme_study_docs',
  'manageme_paper_portfolio',
  'manageme_offline_queue',
  'manageme_device_id',
  'master_owner_pin',
  'master_owner_pin_hash',
  'copy_protection_active',
  'watermark_active',
  'userTrackerData',
  'ai_preferred_provider',
  'ai_preferred_model',
  'ai_chat_history'
];

/**
 * Completely purges all user data across LocalStorage, SessionStorage, IndexedDB,
 * and terminates active Supabase and Firebase auth sessions.
 */
export async function purgeAllUserData(): Promise<DataPurgeResult> {
  const cleared: string[] = [];

  try {
    // 1. Clear specific local storage user keys
    USER_DATA_STORAGE_KEYS.forEach(key => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        cleared.push(`localStorage:${key}`);
      }
    });

    // 2. Clear all session storage items
    sessionStorage.clear();
    cleared.push('sessionStorage:all');

    // 3. Clear IndexedDB caches (manageme_study_db)
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      try {
        await new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase('manageme_study_db');
          req.onsuccess = () => {
            cleared.push('indexedDB:manageme_study_db');
            resolve();
          };
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
        });
      } catch (idbErr) {
        console.warn('[Privacy Purge] IndexedDB purge skipped:', idbErr);
      }
    }

    // 4. Sign out from Supabase
    try {
      await supabase.auth.signOut();
      cleared.push('auth:supabase_signed_out');
    } catch (sbErr) {
      console.warn('[Privacy Purge] Supabase sign out notice:', sbErr);
    }

    // 5. Sign out from Firebase
    try {
      await auth.signOut();
      cleared.push('auth:firebase_signed_out');
    } catch (fbErr) {
      console.warn('[Privacy Purge] Firebase sign out notice:', fbErr);
    }

    return {
      success: true,
      itemsCleared: cleared
    };
  } catch (err: any) {
    return {
      success: false,
      itemsCleared: cleared,
      error: err?.message || 'Data purge encountered an unexpected error.'
    };
  }
}

/**
 * Creates a structured JSON export of all personal data held locally (GDPR Right to Access)
 */
export function exportPersonalDataArchive(): string {
  const exportArchive: Record<string, any> = {
    exportedAt: new Date().toISOString(),
    schemaVersion: '2.5.0',
    data: {}
  };

  USER_DATA_STORAGE_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      try {
        exportArchive.data[key] = JSON.parse(value);
      } catch {
        exportArchive.data[key] = value;
      }
    }
  });

  return JSON.stringify(exportArchive, null, 2);
}

/**
 * Masks an email address for privacy-safe display: j***@example.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '[REDACTED]';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

/**
 * Masks an API key or token: sk-proj-...4a2b
 */
export function maskSecretKey(key: string): string {
  if (!key || key.length < 8) return '[REDACTED]';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}
