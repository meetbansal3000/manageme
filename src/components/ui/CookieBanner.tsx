// Component: GDPR-Compliant Cookie & Privacy Consent Banner

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, ExternalLink, Lock } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { COOKIE_CONSENT_KEY, trackEvent } from '../../lib/analytics';
import { toast } from './Toast';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Delay slightly for smooth entrance
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // safe fallback if storage blocked
    }
  }, []);

  if (!isVisible) return null;

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    } catch {}
    setIsVisible(false);
    trackEvent('cookie_consent_accepted');
    toast.success('Analytics preferences saved: Privacy-friendly analytics active.');
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    } catch {}
    setIsVisible(false);
    toast.info('Analytics preferences saved: Telemetry disabled.');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card 
        variant="glass" 
        padding="md" 
        className="border border-blue-500/30 bg-slate-950/95 backdrop-blur-xl shadow-2xl rounded-2xl text-xs font-mono space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Privacy & Cookie Notice
            </span>
          </div>

          <button
            onClick={handleDecline}
            className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
            title="Decline and dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-300 leading-relaxed text-[11px]">
          We use privacy-friendly analytics to improve ManageMe. No personal, financial, or confidential application records are ever tracked.
        </p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <a
            href="#privacy"
            onClick={() => {
              window.location.hash = '#privacy';
            }}
            className="text-[10px] text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center gap-0.5"
          >
            <span>Privacy Policy</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Decline
            </button>

            <button
              type="button"
              onClick={handleAccept}
              className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Accept
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieBanner;
