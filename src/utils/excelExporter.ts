import * as XLSX from 'xlsx';
import { 
  TimelineItem, 
  GraduateScheme, 
  PartTimeRole, 
  PriorityTrackerItem, 
  NoteSection 
} from '../types';

/**
 * Generates and downloads the Master 5-Sheet Workbook (.xlsx)
 * Contains 5 distinct sheets in exact original order in ONE single file:
 * Sheet 1: 📅 Timeline
 * Sheet 2: 🎓 Graduate Schemes
 * Sheet 3: 💼 Part-Time Roles
 * Sheet 4: ⭐ Priority Tracker
 * Sheet 5: ℹ️ Key Notes & Checklist
 */
export function exportMultiSheetWorkbook(
  timeline: TimelineItem[],
  gradSchemes: GraduateScheme[],
  partTime: PartTimeRole[],
  priorityTracker: PriorityTrackerItem[],
  notesSections: NoteSection[]
) {
  const wb = XLSX.utils.book_new();

  // ═════════════════════════════════════════════════════════════════
  // SHEET 1: 📅 Timeline (Aug 2026 – Sep 2027)
  // ═════════════════════════════════════════════════════════════════
  const ws1Data: any[][] = [
    ['MANAGEME | CAREER & APPLICATION TIMELINE 2026–27'],
    ['Month', 'Phase', 'Key Actions', 'Firms / Applications to Submit', 'Key Deadlines & Dates', 'Hours Available', 'Priority Level'],
    ...timeline.map(t => [
      t.month.replace('\n', ' '),
      t.phase,
      t.keyActions.join(' | '),
      t.firms.replace(/\n/g, ' | '),
      t.deadlines.replace(/\n/g, ' | '),
      t.hours,
      t.priority
    ])
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  ws1['!cols'] = [
    { wch: 14 }, // Month
    { wch: 24 }, // Phase
    { wch: 46 }, // Key Actions
    { wch: 50 }, // Firms
    { wch: 34 }, // Deadlines
    { wch: 20 }, // Hours
    { wch: 16 }  // Priority
  ];
  XLSX.utils.book_append_sheet(wb, ws1, '1. 📅 Timeline');

  // ═════════════════════════════════════════════════════════════════
  // SHEET 2: 🎓 Graduate Schemes (26 Ranked Targets)
  // ═════════════════════════════════════════════════════════════════
  const ws2Data: any[][] = [
    ['GRADUATE SCHEMES (FULL-TIME 2027 ENTRY) | TARGET FIRMS PIPELINE'],
    ['Rank', 'Firm', 'Sector', 'Role Title', 'App Opens', 'App Closes', 'Start Date', 'Base Salary (£ est.)', 'Bonus', '2:1 Filter Risk', 'Fast-Track Advantage', 'Difficulty', 'Apply Portal / Link', 'Key Strategy Notes'],
    ...gradSchemes.map(g => [
      g.rank,
      g.firm,
      g.sector,
      g.roleTitle,
      g.appOpens,
      g.appCloses,
      g.startDate || 'Autumn 2026',
      g.salary,
      g.bonus || 'Discretionary',
      g.filterRisk || 'Low',
      g.certAdvantage || g.accaAdvantage || 'Medium',
      g.difficulty || 'Medium',
      g.applyVia || 'Direct Portal',
      g.notes
    ])
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!cols'] = [
    { wch: 6 },  // Rank
    { wch: 22 }, // Firm
    { wch: 22 }, // Sector
    { wch: 32 }, // Role Title
    { wch: 12 }, // App Opens
    { wch: 12 }, // App Closes
    { wch: 14 }, // Start Date
    { wch: 18 }, // Base Salary
    { wch: 14 }, // Bonus
    { wch: 14 }, // Filter Risk
    { wch: 16 }, // Fast-Track Advantage
    { wch: 14 }, // Difficulty
    { wch: 26 }, // Apply Portal
    { wch: 52 }  // Notes
  ];
  XLSX.utils.book_append_sheet(wb, ws2, '2. 🎓 Graduate Schemes');

  // ═════════════════════════════════════════════════════════════════
  // SHEET 3: 💼 Part-Time Roles (15 Regional Practices & Agencies)
  // ═════════════════════════════════════════════════════════════════
  const ws3Data: any[][] = [
    ['PART-TIME & PRACTICE ROLES | ACADEMIC YEAR LOG | ⚠️ STRICT 20-HR/WEEK CAP IN TERM TIME'],
    ['Rank', 'Firm / Employer', 'Location', 'Sector', 'Role Title', 'Hours/Wk', 'Rate (£/hr)', 'Est. Annual (£)', 'App Window', 'Status', 'Contact / Portal', 'Key Notes & Strategy'],
    ...partTime.map(pt => [
      pt.rank,
      pt.firm,
      pt.location,
      pt.sector,
      pt.roleTitle,
      pt.hoursPerWeek,
      pt.ratePerHour,
      pt.estAnnual,
      pt.appWindow,
      pt.status,
      pt.contact,
      pt.notes
    ]),
    [],
    ['⚠️ VISA RULE REMINDER: Maximum 20 hours/week during active university term dates (Michaelmas: 5 Oct–11 Dec | Epiphany: 11 Jan–19 Mar | Easter: 26 Apr–25 Jun). Full-time allowed during university vacation periods.']
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  ws3['!cols'] = [
    { wch: 6 },  // Rank
    { wch: 26 }, // Firm
    { wch: 20 }, // Location
    { wch: 20 }, // Sector
    { wch: 32 }, // Role Title
    { wch: 10 }, // Hours/Wk
    { wch: 13 }, // Rate
    { wch: 18 }, // Est. Annual
    { wch: 16 }, // Window
    { wch: 16 }, // Status
    { wch: 32 }, // Contact
    { wch: 50 }  // Notes
  ];
  XLSX.utils.book_append_sheet(wb, ws3, '3. 💼 Part-Time Roles');

  // ═════════════════════════════════════════════════════════════════
  // SHEET 4: ⭐ Priority Tracker (Interactive Application Pipeline)
  // ═════════════════════════════════════════════════════════════════
  const ws4Data: any[][] = [
    ['APPLICATION PRIORITY TRACKER | REAL-TIME STATUS & ACTIONS 2026–27'],
    ['Rank', 'Firm', 'Role', 'Type', 'Sector', 'Deadline', 'Status', 'Date Applied', 'Next Action', 'Notes & Strategic Fit'],
    ...priorityTracker.map(p => [
      p.rank,
      p.firm,
      p.role,
      p.roleType,
      p.sector,
      p.deadline,
      p.status,
      p.dateApplied || '—',
      p.nextAction,
      p.notes
    ])
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(ws4Data);
  ws4['!cols'] = [
    { wch: 6 },  // Rank
    { wch: 26 }, // Firm
    { wch: 32 }, // Role
    { wch: 16 }, // Type
    { wch: 20 }, // Sector
    { wch: 16 }, // Deadline
    { wch: 18 }, // Status
    { wch: 16 }, // Date Applied
    { wch: 36 }, // Next Action
    { wch: 48 }  // Notes
  ];
  XLSX.utils.book_append_sheet(wb, ws4, '4. ⭐ Priority Tracker');

  // ═════════════════════════════════════════════════════════════════
  // SHEET 5: ℹ️ Key Notes & Checklist
  // ═════════════════════════════════════════════════════════════════
  const ws5Data: any[][] = [
    ['KEY NOTES, CRITICAL CHECKLIST, VISA REGULATIONS & STRATEGY RULES'],
    ['Category / Topic', 'Action Item / Requirement', 'Details & Guidance', 'Current Status']
  ];
  notesSections.forEach(sec => {
    sec.items.forEach(item => {
      ws5Data.push([
        sec.title,
        item.title,
        item.details,
        item.completed ? 'COMPLETED ✓' : (item.isUrgent ? 'URGENT ⚠️' : 'PENDING ☐')
      ]);
    });
  });
  const ws5 = XLSX.utils.aoa_to_sheet(ws5Data);
  ws5['!cols'] = [
    { wch: 32 }, // Category
    { wch: 34 }, // Item
    { wch: 65 }, // Details
    { wch: 16 }  // Status
  ];
  XLSX.utils.book_append_sheet(wb, ws5, '5. ℹ️ Key Notes & Checklist');

  // Download the 5-sheet workbook in one single .xlsx file
  XLSX.writeFile(wb, 'manageme_master_career_tracker_5sheets.xlsx');
}

/**
 * Generates and downloads a Single-Sheet (Consolidated) Excel file if needed
 */
export function exportOneSheetWorkbook(
  timeline: TimelineItem[],
  gradSchemes: GraduateScheme[],
  partTime: PartTimeRole[],
  priorityTracker: PriorityTrackerItem[],
  notesSections: NoteSection[]
) {
  // Alias to 5-sheet master export as the primary format
  exportMultiSheetWorkbook(timeline, gradSchemes, partTime, priorityTracker, notesSections);
}

