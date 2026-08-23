// Utility: Calendar Export & Google Calendar Synchronization Engine

export interface CalendarEventPayload {
  title: string;
  description?: string;
  location?: string;
  startDate: string | Date; // YYYY-MM-DD or ISO string or Date
  endDate?: string | Date;
  reminderMinutes?: number; // default: 1440 (1 day prior)
}

/**
 * Normalizes input date to formatted UTC timestamp strings for Google Calendar & ICS
 */
function parseEventDates(startDateInput: string | Date, endDateInput?: string | Date): { startUtc: string; endUtc: string; isAllDay: boolean } {
  let start: Date;
  let isAllDay = false;

  if (typeof startDateInput === 'string') {
    // If date is "Rolling" or invalid, default to tomorrow
    if (!startDateInput || startDateInput.toLowerCase().includes('rolling') || isNaN(Date.parse(startDateInput))) {
      start = new Date();
      start.setDate(start.getDate() + 7);
      start.setHours(9, 0, 0, 0);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(startDateInput)) {
      // YYYY-MM-DD
      const [y, m, d] = startDateInput.split('-').map(Number);
      start = new Date(Date.UTC(y, m - 1, d, 9, 0, 0));
    } else {
      start = new Date(startDateInput);
    }
  } else {
    start = startDateInput;
  }

  let end: Date;
  if (endDateInput) {
    if (typeof endDateInput === 'string') {
      end = isNaN(Date.parse(endDateInput)) ? new Date(start.getTime() + 60 * 60 * 1000) : new Date(endDateInput);
    } else {
      end = endDateInput;
    }
  } else {
    // Default duration: 1 hour
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }

  const formatUtc = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  return {
    startUtc: formatUtc(start),
    endUtc: formatUtc(end),
    isAllDay
  };
}

/**
 * Generates an RFC 5545 compliant iCalendar (.ics) string with a 1-day reminder alarm
 */
export function generateIcsContent(event: CalendarEventPayload): string {
  const { startUtc, endUtc } = parseEventDates(event.startDate, event.endDate);
  const nowUtc = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const reminder = event.reminderMinutes ?? 1440; // 1 day = 1440 mins

  const sanitize = (str?: string) => (str || '').replace(/[\n\r]/g, '\\n').replace(/[,;]/g, '\\$&');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//manageme OS//Career Intelligence Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:manageme-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@manageme.app`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${sanitize(event.title)}`,
    `DESCRIPTION:${sanitize(event.description || 'Career milestone / deadline tracked in manageme OS.')}`,
    event.location ? `LOCATION:${sanitize(event.location)}` : 'LOCATION:Online / Target Firm Portal',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    `TRIGGER:-PT${reminder}M`,
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${sanitize(event.title)} is due soon`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Downloads a standard .ics file directly in the browser
 */
export function downloadIcsFile(event: CalendarEventPayload, filename?: string): void {
  const icsData = generateIcsContent(event);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const safeFilename = filename || `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.ics`;
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a pre-filled Google Calendar event URL
 */
export function generateGoogleCalendarUrl(event: CalendarEventPayload): string {
  const { startUtc, endUtc } = parseEventDates(event.startDate, event.endDate);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startUtc}/${endUtc}`,
    details: event.description || 'Application deadline and career tracking milestone in manageme OS.',
    location: event.location || 'Online Portal / Career Hub'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Opens Google Calendar event creator in a new tab
 */
export function openGoogleCalendar(event: CalendarEventPayload): void {
  const url = generateGoogleCalendarUrl(event);
  window.open(url, '_blank', 'noopener,noreferrer');
}
