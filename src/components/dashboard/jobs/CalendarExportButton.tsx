// Component: Add to Calendar Dropdown Button (Google Calendar & .ics export)

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Download, ExternalLink, ChevronDown, Check } from 'lucide-react';
import { openGoogleCalendar, downloadIcsFile } from '../../../lib/calendar';
import { toast } from '../../ui/Toast';

export interface CalendarExportButtonProps {
  title: string;
  date?: string;
  company: string;
  role: string;
  notes?: string;
  portalUrl?: string;
  variant?: 'compact' | 'full' | 'icon';
  className?: string;
}

export const CalendarExportButton: React.FC<CalendarExportButtonProps> = ({
  title,
  date,
  company,
  role,
  notes,
  portalUrl,
  variant = 'compact',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const eventPayload = {
    title: title || `[Deadline] ${company} - ${role}`,
    description: `Target Role: ${role}\nCompany: ${company}\nClosing Date: ${date || 'Rolling'}\n${portalUrl ? `Portal Link: ${portalUrl}\n` : ''}${notes ? `Strategic Notes: ${notes}\n` : ''}\nTracked via manageme OS Career Intelligence.`,
    startDate: date || new Date().toISOString(),
    location: portalUrl || `${company} Career Portal`
  };

  const handleGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    openGoogleCalendar(eventPayload);
    toast.success(`Opening Google Calendar for ${company}`);
    setIsOpen(false);
  };

  const handleIcsDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadIcsFile(eventPayload);
    toast.success(`Downloaded .ics reminder for ${company}`);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors cursor-pointer"
          title="Add deadline to Calendar"
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>
      ) : variant === 'full' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Add to Calendar</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-amber-400/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
          title="Add deadline to Calendar (Google / iCal)"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Calendar</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-1.5 w-56 rounded-xl bg-[#0F141F]/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50 py-1 font-sans text-xs divide-y divide-white/5 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Export Event & Alarm
          </div>
          <div className="p-1 space-y-0.5">
            <button
              onClick={handleGoogleCalendar}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-[#0052FF]/20 text-left transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#0052FF] shrink-0" />
              <div>
                <div className="font-semibold">Add to Google Calendar</div>
                <div className="text-[10px] text-slate-400">Opens event creator in new tab</div>
              </div>
            </button>
            <button
              onClick={handleIcsDownload}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-amber-500/20 text-left transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold">Download .ics File</div>
                <div className="text-[10px] text-slate-400">Apple Calendar, Outlook & mobile</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
