---
title: ManageMe Map of Content
tags: [hub, architecture, career, finance]
status: active
---

# 🧠 ManageMe Operational OS — Central Hub

## Core Subsystems
- [[Career_Vault]] — Application Kanban, AI JD Parser, and Interview Copilot
- [[Trading_Terminal]] — Multi-region asset discovery and live market depth
- [[Visa_Wage_Ledger]] — Student 20-hour work cap compliance and shift timesheet
- [[Study_Engine]] — Durham MSc modules, CFA Level 1 roadmap, and timetable
- [[Cold_Email_Suite]] — Recruiter CRM and verified outreach drafts

## Technical Architecture
- [[Frontend_Routing]] — Next.js hash navigation (#jobs, #trading, #ledger)
- [[Security_Model]] — Owner Mode PIN (8585), server-side session protection
- [[Theme_System]] — Day/Night mode tokens and Lenis smooth scroll

## Backend APIs
- [[API_Parse_JD]] — Gemini structured JSON extraction route
- [[API_Sheets_Sync]] — Google Sheets two-way synchronization
- [[API_Verify_PIN]] — Server-side timing-safe authentication
- [[API_Email_Draft]] — AI cold email draft generation

## UI Primitives
- [[SpatialCard]] — 3D perspective tilt card (Framer Motion spring physics)
- [[SmoothScroll]] — Lenis momentum-based smooth scroll wrapper
- Optical kerning (`-0.035em`) with `font-feature-settings: "cv02", "cv03", "cv04", "cv11"`
- Tabular numerals via `--font-geist-mono` for financial data alignment

## Data Export
- `applications.csv` — Full pipeline export (RFC 4180, UTF-8 BOM)
- `visa_shifts_ledger.csv` — Timesheet history with gross earnings
- `Executive_Summary.pdf` — Printable A4 PDF via `@media print`

## Quick Links
- **Repository**: [github.com/meetbansal3000/manageme](https://github.com/meetbansal3000/manageme)
- **Deployment**: [manageme-three.vercel.app](https://manageme-three.vercel.app)
- **Stack**: Vite + React 19 + Tailwind CSS 4 + Framer Motion + Firebase + Lenis
