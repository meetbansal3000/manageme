// Utility: Privacy-Compliant Product Analytics & Telemetry Engine

import { track } from '@vercel/analytics';

export const COOKIE_CONSENT_KEY = 'manageme_cookie_consent';

/**
 * Checks whether the user has given consent for product analytics.
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
}

/**
 * Safe telemetry event logging. Strips sensitive keys and respects user consent.
 */
export function trackEvent(
  eventName: string, 
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === 'undefined') return;

  // Do not track if user explicitly declined
  if (localStorage.getItem(COOKIE_CONSENT_KEY) === 'declined') {
    return;
  }

  try {
    const safeProps: Record<string, string | number | boolean> = {};
    if (properties) {
      for (const [key, val] of Object.entries(properties)) {
        if (val !== undefined && val !== null) {
          // Never log private personal identifiers or credentials
          if (/email|password|secret|token|ssn|card|cvv|iban|wage|salary|amount/i.test(key)) {
            continue;
          }
          safeProps[key] = val;
        }
      }
    }
    track(eventName, safeProps);
  } catch (err) {
    // Fail silently in restricted sandbox or offline environments
  }
}

/**
 * User Milestone Events
 */
export const trackJobSaved = (stage = 'potential') => 
  trackEvent('job_saved', { stage });

export const trackAiJdParsed = (success = true) => 
  trackEvent('ai_jd_parsed', { success });

export const trackShiftLogged = (hours: number) => 
  trackEvent('shift_logged', { hours: Number(hours) || 0 });

export const trackDataExported = (type: 'csv' | 'pdf' | 'excel') => 
  trackEvent('data_exported', { type });

export const trackEmailDraftSaved = () => 
  trackEvent('email_draft_saved', { client: 'gmail' });

export const trackBookmarkletUsed = () =>
  trackEvent('bookmarklet_used', { success: true });
