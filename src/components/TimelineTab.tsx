import React from 'react';
import { 
  CheckCircle2, 
  Briefcase, 
  AlertTriangle
} from 'lucide-react';
import { TimelineItem } from '../types';

interface TimelineTabProps {
  timeline: TimelineItem[];
  onToggleComplete: (id: string) => void;
  searchQuery: string;
}

import { useScrollFadeUp } from "../hooks/useScrollFadeUp";

export const TimelineTab: React.FC<TimelineTabProps> = ({
  timeline = [],
  searchQuery
}) => {
  useScrollFadeUp([timeline, searchQuery]);

  const filtered = timeline.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.month.toLowerCase().includes(q) ||
      t.phase.toLowerCase().includes(q) ||
      t.firms.toLowerCase().includes(q) ||
      t.deadlines.toLowerCase().includes(q) ||
      t.keyActions.some(a => a.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Editorial Header Section */}
      <div className="border-b border-[var(--border)] pb-6 flex flex-col lg:flex-row justify-between items-start gap-8 w-full">
        <div className="flex-1">
          <div className="font-space-mono text-xs text-[var(--accent)] font-bold uppercase tracking-widest">
            01 / ACADEMIC & APPLICATION ROADMAP
          </div>
          <h2 className="apple-headline text-3xl sm:text-4xl text-[var(--text-primary)] font-semibold mt-1">
            Timeline (Aug 2026 – Sep 2027)
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mt-1 leading-relaxed">
            Coordinated monthly schedule matching academic terms, professional exam milestones, peak graduate scheme openings, and work authorization hours.
          </p>
        </div>

        <div className="apple-notice text-sm leading-tight max-w-xs shrink-0">
          <strong className="text-[var(--text-primary)] uppercase">⚠️ Work Notice</strong>
          <p className="text-[var(--text-primary)]/80 mt-1">
            Standard work hours limit during academic term dates. Unlimited during university vacations and official holidays.
          </p>
        </div>
      </div>

      {/* Editorial Roadmap List */}
      <div className="space-y-10">
        {filtered.map((item) => {
          const isCritical = item.priority === '🔴 CRITICAL';
          const isWarn = item.deadlines.includes('⚠️');

          return (
            <article key={item.id} className="bento-card p-6 grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 pb-8 border-b border-[var(--border)]">
              
              {/* Left Column: Date & Meta */}
              <div className="font-space-mono">
                <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                  {item.month.replace('\n', ' ')}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase">
                  {item.hours}
                </div>
                <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] uppercase font-bold border ${
                  isCritical 
                    ? 'apple-badge-critical' 
                    : 'apple-badge-normal'
                }`}>
                  {item.priority.replace(/[🔴🟠🟢]/g, '').trim()}
                </span>
              </div>

              {/* Right Column: Title & Structured Grid */}
              <div>
                <h3 className="apple-headline text-2xl sm:text-3xl text-[var(--text-primary)] font-semibold border-b border-[var(--border)] pb-2 mb-4">
                  {item.phase}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
                  {/* Key Actions */}
                  <div>
                    <h5 className="font-space-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[var(--accent)]" />
                      Key Actions
                    </h5>
                    <ul className="space-y-1 text-[var(--text-primary)] leading-relaxed">
                      {item.keyActions.map((act, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[var(--accent)]">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Target Firms */}
                  <div>
                    <h5 className="font-space-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-[var(--text-primary)]" />
                      Target Firms / Portals
                    </h5>
                    <div className="text-[var(--text-primary)] whitespace-pre-line leading-relaxed">
                      {item.firms}
                    </div>
                  </div>

                  {/* Deadlines & Key Dates */}
                  <div>
                    <h5 className="font-space-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-[var(--accent)]" />
                      Deadlines & Dates
                    </h5>
                    <div className={`p-3 border leading-relaxed ${
                      isWarn 
                        ? 'apple-notice' 
                        : 'bg-[var(--surface-solid)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl p-4'
                    }`}>
                      <div className="whitespace-pre-line text-xs font-mono">{item.deadlines}</div>
                      {item.notes && (
                        <div className="mt-2 pt-2 border-t border-[var(--border)]/10 text-xs italic text-[var(--text-secondary)]">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
