---
title: Frontend Routing
tags: [architecture, routing, spa, navigation]
status: active
---

# 🧭 Frontend Routing

> [[00_ManageMe_MOC]] → Technical Architecture → Frontend Routing

## Overview

ManageMe uses SPA hash-based routing managed by `App.tsx`. Navigation state is stored in `activeTab` and driven by `window.location.hash` changes. There is no file-system routing at runtime — all views render within a single `AnimatePresence` wrapper with Framer Motion page transitions.

## Route Map

| Hash | Tab ID | Component | Description |
|------|--------|-----------|-------------|
| `#landing` | `landing` | `LandingView` | Public landing page with hero & feature grid |
| `#news` | `news` | `FinancialNewsTab` | Financial news aggregator |
| `#study` | `study` | `StudyEngine` | Durham MSc + CFA revision tracker |
| `#metasuite` | `metasuite` | `ExecutiveAiMetaSuiteTab` | AI meta-analysis suite |
| `#jobs` | `jobs` | `JobSearchTab` | [[Career_Vault]] Kanban + Table CRM |
| `#outreach` | `outreach` | `ColdEmailSuite` | [[Cold_Email_Suite]] recruiter CRM |
| `#tasks` | `tasks` | `PriorityTrackerTab` | Priority task board |
| `#uni` | `uni` | `UniTimetableTab` | University timetable |
| `#finance` | `finance` | `FinanceHubTab` | Personal finance dashboard |
| `#trading` | `trading` | `PaperTradingTab` | [[Trading_Terminal]] |
| `#work` | `work` | `VisaWageLedger` | [[Visa_Wage_Ledger]] |
| `#skills` | `skills` | `SkillsTrackerTab` | Technical skills tracker |
| `#travel` | `travel` | `TravelTripsTab` | Travel planner |
| `#transit` | `transit` | `TransitTab` | UK transit lookup |
| `#chat` | `chat` | `ChatHubTab` | AI chat interface |
| `#resume` | `resume` | `ResumeBuilder` | CV/Resume builder |
| `#privacy` | `privacy` | `PrivacyPolicyTab` | Privacy policy |
| `#terms` | `terms` | `TermsOfServiceTab` | Terms of service |

## Navigation Flow

```
handleTabChange(tabId) → {
  1. Push to tabHistory stack (for back navigation)
  2. Set activeTab state
  3. Update window.location.hash
  4. Scroll to top
}

handleGoBack() → {
  1. Pop from tabHistory
  2. Set activeTab to previous
  3. Update hash
}

handleGoHome() → {
  1. Set activeTab to 'news'
  2. Clear hash
}
```

## Page Transitions

All tab transitions use `AnimatePresence mode="wait"` with:
- `initial={{ opacity: 0, y: 10 }}`
- `animate={{ opacity: 1, y: 0 }}`
- `exit={{ opacity: 0, y: -10 }}`

## Key Files

- [`src/App.tsx`](file:///c:/Users/HP/.antigravity-ide/manageme/src/App.tsx) — Master SPA orchestrator
- [`src/components/Header.tsx`](file:///c:/Users/HP/.antigravity-ide/manageme/src/components/Header.tsx) — Tab bar navigation
