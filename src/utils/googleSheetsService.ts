import { 
  TimelineItem, 
  GraduateScheme, 
  PartTimeRole, 
  PriorityTrackerItem, 
  NoteSection 
} from '../types';

/**
 * Generates TSV (Tab-Separated Values) suitable for pasting directly into Google Sheets
 */
export function generateGoogleSheetsTSV(
  mode: 'all' | 'timeline' | 'grad' | 'parttime' | 'priority' | 'notes',
  timeline: TimelineItem[],
  gradSchemes: GraduateScheme[],
  partTime: PartTimeRole[],
  priorityTracker: PriorityTrackerItem[],
  notesSections: NoteSection[]
): string {
  const lines: string[] = [];

  if (mode === 'all' || mode === 'timeline') {
    lines.push('📅 TIMELINE — MANAGEME 2026–27');
    lines.push(['Month', 'Phase', 'Key Actions', 'Firms / Applications to Submit', 'Key Deadlines & Dates', 'Hours Available', 'Priority Level'].join('\t'));
    timeline.forEach(t => {
      lines.push([
        t.month.replace('\n', ' '),
        t.phase,
        t.keyActions.join(' | '),
        t.firms.replace(/\n/g, ' | '),
        t.deadlines.replace(/\n/g, ' | '),
        t.hours,
        t.priority
      ].join('\t'));
    });
    lines.push('');
  }

  if (mode === 'all' || mode === 'grad') {
    lines.push('🎓 GRADUATE SCHEMES (FULL-TIME 2027 ENTRY — TARGET FIRMS)');
    lines.push(['#', 'Firm', 'Sector', 'Role Title', 'App Opens', 'App Closes', 'Start Date', 'Base Salary (£ est.)', 'Bonus', '2:1 Filter Risk', 'Fast-Track Advantage', 'Difficulty', 'Apply Via', 'Key Notes'].join('\t'));
    gradSchemes.forEach(g => {
      lines.push([
        g.rank,
        g.firm,
        g.sector,
        g.roleTitle,
        g.appOpens,
        g.appCloses,
        g.startDate,
        g.salary,
        g.bonus,
        g.filterRisk,
        g.certAdvantage || g.accaAdvantage || 'Medium',
        g.difficulty,
        g.applyVia,
        g.notes
      ].join('\t'));
    });
    lines.push('');
  }

  if (mode === 'all' || mode === 'parttime') {
    lines.push('💼 PART-TIME ROLES (TERM TIME 20-HR/WEEK CAP)');
    lines.push(['#', 'Firm / Employer', 'Location', 'Sector', 'Role Title', 'Hrs/Wk', 'Rate (£/hr)', 'Est. Annual (£)', 'App Window', 'Status', 'Contact / Apply Via', 'Key Notes'].join('\t'));
    partTime.forEach(pt => {
      lines.push([
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
      ].join('\t'));
    });
    lines.push('');
  }

  if (mode === 'all' || mode === 'priority') {
    lines.push('⭐ APPLICATION PRIORITY TRACKER');
    lines.push(['Rank', 'Firm', 'Role', 'Type', 'Sector', 'Deadline', 'Status', 'Date Applied', 'Next Action', 'Notes / Outcome'].join('\t'));
    priorityTracker.forEach(p => {
      lines.push([
        p.rank,
        p.firm,
        p.role,
        p.roleType,
        p.sector,
        p.deadline,
        p.status,
        p.dateApplied || '',
        p.nextAction,
        p.notes
      ].join('\t'));
    });
    lines.push('');
  }

  if (mode === 'all' || mode === 'notes') {
    lines.push('ℹ️ KEY NOTES, CHECKLIST & DATES');
    lines.push(['Section', 'Item', 'Details', 'Status'].join('\t'));
    notesSections.forEach(sec => {
      sec.items.forEach(item => {
        lines.push([
          sec.title,
          item.title,
          item.details,
          item.completed ? 'COMPLETED' : (item.isUrgent ? 'URGENT' : 'PENDING')
        ].join('\t'));
      });
    });
  }

  return lines.join('\n');
}

/**
 * Creates a real Google Spreadsheet via Google Sheets API v4 using an OAuth Access Token
 */
export async function createGoogleSpreadsheetWithData(
  accessToken: string,
  timeline: TimelineItem[],
  gradSchemes: GraduateScheme[],
  partTime: PartTimeRole[],
  priorityTracker: PriorityTrackerItem[],
  notesSections: NoteSection[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // 1. Create Spreadsheet with 5 distinct named sheets in original order
  const createResp = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: `manageme — Career & Executive Tracker 2026–27 (5 Sheets)`
      },
      sheets: [
        { properties: { title: '1. 📅 Timeline', gridProperties: { frozenRowCount: 2 } } },
        { properties: { title: '2. 🎓 Graduate Schemes', gridProperties: { frozenRowCount: 2 } } },
        { properties: { title: '3. 💼 Part-Time Roles', gridProperties: { frozenRowCount: 2 } } },
        { properties: { title: '4. ⭐ Priority Tracker', gridProperties: { frozenRowCount: 2 } } },
        { properties: { title: '5. ℹ️ Key Notes & Checklist', gridProperties: { frozenRowCount: 2 } } }
      ]
    })
  });

  if (!createResp.ok) {
    const err = await createResp.text();
    throw new Error(`Failed to create Google Spreadsheet: ${err}`);
  }

  const sheetData = await createResp.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Prepare notes rows
  const notesRows: any[][] = [];
  notesSections.forEach(sec => {
    sec.items.forEach(item => {
      notesRows.push([
        sec.title,
        item.title,
        item.details,
        item.completed ? 'COMPLETED ✓' : (item.isUrgent ? 'URGENT ⚠️' : 'PENDING ☐')
      ]);
    });
  });

  // 2. Batch update values for each of the 5 sheets
  const valueData = [
    {
      range: "'1. 📅 Timeline'!A1",
      values: [
        ['MANAGEME | CAREER & APPLICATION TIMELINE 2026–27'],
        ['Month', 'Phase', 'Key Actions', 'Firms / Applications to Submit', 'Key Deadlines & Dates', 'Hours Available', 'Priority Level'],
        ...timeline.map(t => [t.month.replace('\n', ' '), t.phase, t.keyActions.join(' | '), t.firms.replace(/\n/g, ' | '), t.deadlines.replace(/\n/g, ' | '), t.hours, t.priority])
      ]
    },
    {
      range: "'2. 🎓 Graduate Schemes'!A1",
      values: [
        ['GRADUATE SCHEMES (FULL-TIME 2027 ENTRY) | TARGET FIRMS PIPELINE'],
        ['Rank', 'Firm', 'Sector', 'Role Title', 'App Opens', 'App Closes', 'Start Date', 'Base Salary (£ est.)', 'Bonus', '2:1 Filter Risk', 'Fast-Track Advantage', 'Difficulty', 'Apply Portal / Link', 'Key Strategy Notes'],
        ...gradSchemes.map(g => [g.rank, g.firm, g.sector, g.roleTitle, g.appOpens, g.appCloses, g.startDate, g.salary, g.bonus, g.filterRisk, g.certAdvantage || g.accaAdvantage || 'Medium', g.difficulty, g.applyVia, g.notes])
      ]
    },
    {
      range: "'3. 💼 Part-Time Roles'!A1",
      values: [
        ['PART-TIME & PRACTICE ROLES | ⚠️ STRICT 20-HR/WEEK CAP IN TERM TIME'],
        ['Rank', 'Firm / Employer', 'Location', 'Sector', 'Role Title', 'Hours/Wk', 'Rate (£/hr)', 'Est. Annual (£)', 'App Window', 'Status', 'Contact / Portal', 'Key Notes & Strategy'],
        ...partTime.map(pt => [pt.rank, pt.firm, pt.location, pt.sector, pt.roleTitle, pt.hoursPerWeek, pt.ratePerHour, pt.estAnnual, pt.appWindow, pt.status, pt.contact, pt.notes])
      ]
    },
    {
      range: "'4. ⭐ Priority Tracker'!A1",
      values: [
        ['APPLICATION PRIORITY TRACKER | REAL-TIME STATUS & ACTIONS 2026–27'],
        ['Rank', 'Firm', 'Role', 'Type', 'Sector', 'Deadline', 'Status', 'Date Applied', 'Next Action', 'Notes & Strategic Fit'],
        ...priorityTracker.map(p => [p.rank, p.firm, p.role, p.roleType, p.sector, p.deadline, p.status, p.dateApplied || '—', p.nextAction, p.notes])
      ]
    },
    {
      range: "'5. ℹ️ Key Notes & Checklist'!A1",
      values: [
        ['KEY NOTES, CRITICAL CHECKLIST, VISA REGULATIONS & STRATEGY RULES'],
        ['Category / Topic', 'Action Item / Requirement', 'Details & Guidance', 'Current Status'],
        ...notesRows
      ]
    }
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: valueData
    })
  });

  return { spreadsheetId, spreadsheetUrl };
}
