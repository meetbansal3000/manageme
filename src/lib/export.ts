import { toast } from '../components/ui/Toast';
import { trackDataExported } from './analytics';

/**
 * Cleanly escapes field values for CSV export (RFC 4180).
 */
function escapeCsvField(val: any): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Triggers a client-side download of a CSV file.
 */
export function downloadCSV(csvContent: string, filename: string) {
  try {
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackDataExported('csv');
    toast.success(`Exported ${filename} successfully!`);
  } catch (err: any) {
    console.error('Failed to download CSV:', err);
    toast.error('Failed to export CSV file.');
  }
}

/**
 * Export applications and graduate schemes to a structured CSV.
 */
export function exportApplicationsToCSV(
  applications: Array<any>,
  filename = 'applications.csv'
) {
  if (!applications || applications.length === 0) {
    toast.error('No applications to export.');
    return;
  }

  const headers = [
    'Company / Firm',
    'Role Title',
    'Sector',
    'Stage / Status',
    'Application Opens',
    'Deadline / Closes',
    'Salary / Compensation',
    'Bonus',
    'Fast-Track Advantage',
    'Filter Risk',
    'Difficulty',
    'Date Applied',
    'Apply Link',
    'Notes'
  ];

  const rows = applications.map(app => [
    escapeCsvField(app.firm || app.company || 'Unknown Firm'),
    escapeCsvField(app.roleTitle || app.role || app.title || 'Target Role'),
    escapeCsvField(app.sector || 'General'),
    escapeCsvField(app.status || 'To Apply'),
    escapeCsvField(app.appOpens || app.dateAdded || 'Open'),
    escapeCsvField(app.appCloses || app.deadline || 'Rolling'),
    escapeCsvField(app.salary || 'Competitive'),
    escapeCsvField(app.bonus || 'Discretionary'),
    escapeCsvField(app.certAdvantage || app.accaAdvantage || 'N/A'),
    escapeCsvField(app.filterRisk || 'N/A'),
    escapeCsvField(app.difficulty || 'N/A'),
    escapeCsvField(app.dateApplied || app.appliedDate || 'Not Applied'),
    escapeCsvField(app.applyVia || app.link || ''),
    escapeCsvField(app.notes || '')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  downloadCSV(csvContent, filename);
}

/**
 * Export visa work shifts and timesheet history to a structured CSV.
 */
export function exportVisaShiftsToCSV(
  shifts: Array<any>,
  hourlyRateDefault = 15.50,
  filename = 'visa_shifts_ledger.csv'
) {
  if (!shifts || shifts.length === 0) {
    toast.error('No work shifts logged to export.');
    return;
  }

  const headers = [
    'Date',
    'Employer / Role',
    'Hours Worked',
    'Hourly Rate (£)',
    'Total Earnings (£)',
    'Start Time',
    'End Time',
    'Location',
    'Notes'
  ];

  const rows = shifts.map(shift => {
    const hours = Number(shift.hours) || 0;
    const rate = Number(shift.hourlyRate) || hourlyRateDefault;
    const earnings = hours * rate;

    return [
      escapeCsvField(shift.date || new Date().toISOString().split('T')[0]),
      escapeCsvField(shift.roleTitle || shift.description || 'Part-Time Shift'),
      escapeCsvField(hours.toFixed(2)),
      escapeCsvField(rate.toFixed(2)),
      escapeCsvField(earnings.toFixed(2)),
      escapeCsvField(shift.startTime || '09:00'),
      escapeCsvField(shift.endTime || '17:00'),
      escapeCsvField(shift.location || 'UK Workplace'),
      escapeCsvField(shift.notes || '')
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  downloadCSV(csvContent, filename);
}
