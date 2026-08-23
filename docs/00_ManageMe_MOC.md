---
title: ManageMe — Map of Content
tags: [moc, architecture, index]
status: active
---

# 🗺️ ManageMe — Central Map of Content

> The unified knowledge hub for ManageMe OS. All subsystems, APIs, and architectural decisions are wikilinked below for Obsidian Graph View navigation.

---

## 🏗️ Architecture

| Document | Description |
|----------|-------------|
| [[Frontend_Routing]] | SPA hash-based routing (`#trading`, `#jobs`, `#ledger`, etc.) via `App.tsx` |
| [[Security_Model]] | Owner PIN (timing-safe `8585`), device fingerprinting, session tokens |
| [[Theme_System]] | Quiet luxury design tokens: `#FBFBFD` light / `#09090B` dark, Royal Indigo `#6366F1` accent |

---

## 📦 Core Modules

| Module | Route | Description |
|--------|-------|-------------|
| [[Career_Vault]] | `#jobs` | Kanban + Table CRM for 2026 graduate schemes (IB, PE, AM, Big 4) |
| [[Trading_Terminal]] | `#trading` | Multi-region paper trading terminal with Level-2 depth simulation |
| [[Visa_Wage_Ledger]] | `#ledger` / `#work` | UK Tier-4 visa 20-hour weekly cap tracker and gross wage calculator |
| [[Study_Engine]] | `#study` | Durham MSc Finance modules + CFA Level 1 ten-topic revision matrix |
| [[Cold_Email_Suite]] | `#outreach` | AI-powered recruiter pitch generator with Gmail draft integration |

---

## 🔌 API Engine

| Endpoint | Description |
|----------|-------------|
| [[API_Parse_JD]] | `POST /api/parse-jd` — Gemini 2.5 Flash job description parser |
| [[API_Sheets_Sync]] | `POST /api/sheets-sync` — Two-way Google Sheets sync protocol |
| [[API_Verify_PIN]] | `POST /api/verify-pin` — Server-side timing-safe PIN verification |
| [[API_Email_Draft]] | `POST /api/email-draft` — AI cold email generator with pre-send confirmation |

---

## 🧩 UI Primitives

- [[SpatialCard]] — 3D perspective tilt card with spring physics
- [[SmoothScroll]] — Lenis momentum-based smooth scroll wrapper
- Typography: Optical kerning (`-0.035em`), `font-feature-settings: "cv02", "cv03", "cv04", "cv11"`, tabular-nums via Geist Mono

---

## 📊 Data Export

- `applications.csv` — Full pipeline export (RFC 4180, UTF-8 BOM)
- `visa_shifts_ledger.csv` — Timesheet history with gross earnings
- `Executive_Summary.pdf` — Printable A4 PDF via `@media print` rules

---

## 🔗 Quick Links

- **Repository**: [github.com/meetbansal3000/manageme](https://github.com/meetbansal3000/manageme)
- **Deployment**: [manageme-three.vercel.app](https://manageme-three.vercel.app)
- **Stack**: Vite + React 19 + Tailwind CSS 4 + Framer Motion + Firebase + Lenis
