---
title: Career Vault & Pipeline CRM
tags: [career, kanban, ai, recruitment]
status: active
---

# 💼 Career Vault & Pipeline CRM

> [[00_ManageMe_MOC]] → Core Modules → Career Vault

## Overview

The Career Vault is ManageMe's central recruitment pipeline management system. It provides dual-view (Kanban + Table) tracking of 2026 graduate scheme applications across Investment Banking, Private Equity, Asset Management, and Big 4 Audit.

## Related Modules

- [[AI_JD_Parser]] — Gemini-powered job description field extraction
- [[Interview_Copilot]] — Technical question drills (3-statement model, DCF, LBO)
- [[Cover_Letter_Tailor]] — UK 3-paragraph cover letter generator
- [[API_Parse_JD]] — Backend API endpoint for AI parsing

## Stage Workflow

```
Potential → Applied → Online Tests → Video Interview → AC Prep → Assessment Centre → Offer → Accepted/Rejected
```

Each application card tracks:
- **Company** and **Division** (e.g., Goldman Sachs • Asset Management)
- **Stage** with color-coded status badges
- **Deadline** with countdown timer
- **Salary Range** and location notes
- **Personal Notes** (PIN-protected via [[Security_Model]])

## Bookmarklet Ingestion

The 1-Click Job Ingestion Bookmarklet captures:
1. `document.title` → Role Title
2. `window.location.href` → Source URL
3. `document.body.innerText.substring(0, 3000)` → Raw JD text

Parameters are URL-encoded and opened in ManageMe via:
```
{BASE_URL}?importTitle=...&importUrl=...&importText=...
```

See: `components/dashboard/jobs/BookmarkletModal.tsx`

## Table View Schema

| Column | Type | Description |
|--------|------|-------------|
| Company | string | Firm name |
| Division | string | IB, PE, AM, Audit, etc. |
| Role Title | string | Specific position |
| Stage | enum | Pipeline stage |
| Deadline | date | Application deadline |
| Salary | string | Estimated range |
| Source | url | Original listing URL |
| Notes | text | Personal observations |

## Data Export

- **CSV**: `applications.csv` via `lib/export.ts` → `exportApplicationsCSV()`
- **PDF**: Executive Summary modal → `window.print()` with `@media print`
