---
title: UK Visa & Wage Compliance Ledger
tags: [compliance, visa, timesheet, finance]
---

# 🇬🇧 Visa & Wage Ledger

Connects to: [[00_ManageMe_MOC]] | [[20_Hour_Work_Cap]] | [[Timesheet_Exporter]]

- Legal 20-hour weekly student cap monitor with threshold warning banners.
- Shift logger with gross wage calculations and CSV export.

---

## Overview

The Visa & Wage Ledger tracks work hours against the UK Student Visa (Tier-4) 20.0-hour weekly cap during term time. It calculates gross weekly earnings, maintains a shift history, and issues compliance alerts.

## Related Modules

- [[20_Hour_Work_Cap]] — Legal threshold enforcement and buffer calculation
- [[Shift_Logger]] — Individual shift entry with start/end/break times
- [[Timesheet_Exporter]] — CSV export of shift history with gross earnings

## Student Visa Rule Tracking

UK Tier-4 visa holders are permitted a maximum of **20.0 hours per week** during term time (Monday–Sunday). The ledger:

1. **Aggregates** all logged shifts within the current weekly window
2. **Calculates** remaining buffer: `20.0 - totalHoursWorked`
3. **Alerts** at three thresholds:
   - 🟢 **Green**: `< 16.0 hours` — comfortable buffer
   - 🟡 **Amber**: `≥ 18.0 hours` — approaching limit
   - 🔴 **Red**: `≥ 20.0 hours` — at/over cap, violation risk

## Gross Wage Calculation

```
grossWeeklyWage = totalHoursWorked × hourlyRate
```

Default hourly rate: **£15.50** (editable per employer). Supports:
- Multiple employer entries
- Holiday/overtime distinction
- National Insurance threshold awareness

## CSV Export Format

The timesheet exports as RFC 4180 CSV with UTF-8 BOM for Excel compatibility:

| Column | Type | Example |
|--------|------|---------|
| Date | ISO 8601 | 2026-03-15 |
| Employer | string | Costa Coffee |
| Start | HH:MM | 09:00 |
| End | HH:MM | 13:00 |
| Break (min) | number | 30 |
| Net Hours | decimal | 3.5 |
| Rate (£/hr) | decimal | 15.50 |
| Gross (£) | decimal | 54.25 |

## Key Files

- `src/components/VisaWageLedger.tsx`
- `src/components/dashboard/work/ShiftForm.tsx`
- `src/lib/export.ts` → `exportVisaShiftsCSV()`
