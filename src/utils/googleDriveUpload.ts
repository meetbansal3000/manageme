import { 
  TimelineItem, 
  GraduateScheme, 
  PartTimeRole, 
  PriorityTrackerItem, 
  NoteSection 
} from '../types';

/**
 * Uploads the 5-sheet Master Career Tracker to Google Drive as a real Google Spreadsheet
 * using the Drive & Sheets v4 REST APIs.
 */
export async function uploadMasterTrackerToGoogleDrive(
  accessToken: string,
  timeline: TimelineItem[],
  gradSchemes: GraduateScheme[],
  partTime: PartTimeRole[],
  priorityTracker: PriorityTrackerItem[],
  notesSections: NoteSection[],
  onProgress?: (status: string) => void
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  onProgress?.('Initializing Google Spreadsheet with 5 sheets...');

  // Step 1: Create Spreadsheet with 5 distinct named tabs in original order
  const createResp = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: `manageme — Career & Executive Tracker 2026–27 (5 Sheets Master)`
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
    const errText = await createResp.text();
    throw new Error(`Google Sheets creation failed: ${errText}`);
  }

  const sheetData = await createResp.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  onProgress?.('Populating 5 sheets with timelines, 26 graduate schemes, 15 practice roles & checklist...');

  // Step 2: Format notes rows
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

  // Step 3: Prepare data for all 5 sheets
  const valueData = [
    {
      range: "'1. 📅 Timeline'!A1",
      values: [
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
      ]
    },
    {
      range: "'2. 🎓 Graduate Schemes'!A1",
      values: [
        ['GRADUATE SCHEMES (FULL-TIME 2027 ENTRY) | TARGET FIRMS PIPELINE'],
        ['Rank', 'Firm', 'Sector', 'Role Title', 'App Opens', 'App Closes', 'Start Date', 'Base Salary (£ est.)', 'Bonus', '2:1 Filter Risk', 'ACCA Advantage', 'Difficulty', 'Apply Portal / Link', 'Key Strategy Notes'],
        ...gradSchemes.map(g => [
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
          g.accaAdvantage,
          g.difficulty,
          g.applyVia,
          g.notes
        ])
      ]
    },
    {
      range: "'3. 💼 Part-Time Roles'!A1",
      values: [
        ['PART-TIME & PRACTICE ROLES | ⚠️ STRICT 20-HR/WEEK CAP IN TERM TIME'],
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
        ['⚠️ VISA REMINDER: Max 20 hours/week in term time. Unlimited hours in university holidays.']
      ]
    },
    {
      range: "'4. ⭐ Priority Tracker'!A1",
      values: [
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

  const batchResp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
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

  if (!batchResp.ok) {
    const errText = await batchResp.text();
    throw new Error(`Data population failed: ${errText}`);
  }

  onProgress?.('Formatting sheets with column widths, header styles & freezing rows...');

  // Step 4: Add styling / formatting to all 5 sheets
  try {
    const formatRequests: any[] = [];
    sheetData.sheets.forEach((s: any) => {
      const sheetId = s.properties.sheetId;
      // Header row background color & bold font
      formatRequests.push({
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex: 2
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.1, green: 0.15, blue: 0.25 },
              textFormat: { bold: true, fontSize: 10, foregroundColor: { red: 1, green: 1, blue: 1 } },
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment)'
        }
      });
      // Auto-resize columns
      formatRequests.push({
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 15
          }
        }
      });
    });

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: formatRequests
      })
    });
  } catch (e) {
    console.warn('Formatting request optional error:', e);
  }

  onProgress?.('Done! Saved to Google Drive.');
  return { spreadsheetId, spreadsheetUrl };
}
