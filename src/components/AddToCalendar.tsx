import React from 'react';
import { Calendar } from 'lucide-react';

export interface AddToCalendarProps {
  title: string;
  description?: string;
  location?: string;
  startDate: string | Date; // ISO string or Date object
  endDate?: string | Date; // ISO string or Date object
  durationMinutes?: number; // fallback if endDate is missing
  className?: string;
}

export const AddToCalendar: React.FC<AddToCalendarProps> = ({
  title,
  description = '',
  location = '',
  startDate,
  endDate,
  durationMinutes = 60,
  className = ''
}) => {
  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const getDates = () => {
    const start = new Date(startDate);
    let end = endDate ? new Date(endDate) : new Date(start.getTime() + durationMinutes * 60000);
    return `${formatGoogleDate(start)}/${formatGoogleDate(end)}`;
  };

  const createGoogleCalendarUrl = () => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: description,
      location: location,
      dates: getDates()
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const createICSFile = () => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + durationMinutes * 60000);
    
    const formatDateForICS = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\d\d\d/g, '').substring(0, 15) + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AI Studio//App//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDateForICS(start)}`,
      `DTEND:${formatDateForICS(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[rgba(255,255,255,0.08)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.15)] transition-colors ${className}`}
      >
        <Calendar className="w-3.5 h-3.5" />
        Add to Calendar
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-[var(--surface-solid)] border border-[var(--border)] ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
            <div className="py-1">
              <a 
                href={createGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                Google Calendar
              </a>
              <button 
                onClick={() => {
                  createICSFile();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                Apple Calendar (.ics)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
