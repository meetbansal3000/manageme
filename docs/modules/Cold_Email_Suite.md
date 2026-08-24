---
title: Cold Email & Recruiter CRM
tags: [outreach, networking, crm]
---

# ✉️ Cold Email Suite

Connects to: [[00_ManageMe_MOC]] | [[Security_Model]] | [[Recruiter_CRM]]

- Recruiter contact management and AI networking template generation.
- Human-in-the-loop pre-send review modal before drafting.

---

## Overview

The Cold Email Suite automates recruiter outreach for finance-sector job applications. It generates tailored pitches using Gemini AI, referencing the user's ACCA affiliation, Durham MSc Finance credentials, and tracked application data.

## Related Modules

- [[Recruiter_CRM]] — Contact management with firm/division/email tracking
- [[API_Email_Draft]] — Backend endpoint for AI-powered draft generation
- [[Security_Model]] — Pre-send confirmation workflow (Owner PIN required)

## Pre-Send Confirmation Workflow

```
1. User selects recruiter contact + target role
2. AI generates 3-paragraph cold email draft
3. Draft previewed in-app with editable fields
4. User confirms → 1-click copy to clipboard or Gmail draft API
```

> ⚠️ No email is sent automatically. Every outreach requires explicit user confirmation to prevent accidental sends.

## Draft Generation Template

The AI generates emails following this structure:

### Paragraph 1 — Hook
- Reference specific firm initiative, recent deal, or market insight
- Demonstrate domain knowledge relevant to the division

### Paragraph 2 — Credential Bridge
- Durham MSc Finance & Investment (merit distinction)
- ACCA Part-Qualified (F1–F9 complete)
- Relevant technical skills (3-statement modelling, DCF, LBO)

### Paragraph 3 — Soft Close
- Express interest in informal conversation
- Reference specific team / office location
- Professional sign-off with LinkedIn profile link

## Recruiter CRM Schema

| Field | Type | Description |
|-------|------|-------------|
| Name | string | Recruiter full name |
| Email | email | Professional email |
| Firm | string | Company name |
| Division | string | IB, PE, AM, etc. |
| LinkedIn | url | Profile link |
| Last Contacted | date | Most recent outreach |
| Status | enum | Not Contacted / Sent / Replied / Meeting |
| Notes | text | Personal notes |

## Key Files

- `src/components/ColdEmailSuite.tsx`
- `server.ts` → `/api/email-draft`
- `src/context/UserContext.tsx` → recruiter state
