---
title: Security Model
tags: [architecture, security, authentication, pin, encryption]
status: active
---

# 🔐 Security Model

> [[00_ManageMe_MOC]] → Technical Architecture → Security Model

## Overview

ManageMe implements a Zero-Trust Owner Security layer that protects sensitive personal data — application notes, shift wage records, and export operations — even on shared devices. The system uses a server-side timing-safe PIN verification flow with session token issuance.

## Owner Mode Architecture

```
┌─────────────────────────────────────────┐
│              Client (Browser)           │
│                                         │
│  OwnerSecurityContext                   │
│    ├── isOwnerAuthenticated: boolean    │
│    ├── sessionToken: JWT | null         │
│    ├── requireOwnerPermission(action)   │
│    └── clearOwnerSession()              │
│                                         │
│  OwnerAuthModal                         │
│    └── PIN input (4 digits) → POST      │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│           Server (/api/verify-pin)      │
│                                         │
│  1. Receive PIN + action description    │
│  2. Buffer.from(input)                  │
│  3. crypto.timingSafeEqual(input, PIN)  │
│  4. If valid → issue JWT (30min)        │
│  5. If invalid → decrement attempts    │
│  6. After 5 fails → 15min lockout      │
└─────────────────────────────────────────┘
```

## Protected Actions

| Action | Context | Risk Level |
|--------|---------|------------|
| Export multi-sheet workbook | Career Vault | 🟡 Medium |
| Edit shift wage records | [[Visa_Wage_Ledger]] | 🔴 High |
| Sync to private Google Sheets | [[API_Sheets_Sync]] | 🔴 High |
| View personal application notes | [[Career_Vault]] | 🟡 Medium |
| Clear all application data | Settings | 🔴 Critical |
| Access debug console | Developer | 🟡 Medium |

## Device Fingerprinting

ManageMe generates a device fingerprint hash to limit concurrent sessions:

```typescript
const fingerprint = sha256([
  navigator.userAgent,
  screen.width + 'x' + screen.height,
  Intl.DateTimeFormat().resolvedOptions().timeZone,
  navigator.language
].join('|'));
```

If the device limit is exceeded, `DeviceLimitModal` blocks access until a session is released.

## Session Token Lifecycle

1. **Issuance**: JWT signed with `process.env.JWT_SECRET`, 30-minute expiry
2. **Storage**: `sessionStorage` (cleared on tab close)
3. **Validation**: Server middleware checks JWT on every protected route
4. **Revocation**: `clearOwnerSession()` removes token client-side

## Key Files

- `src/context/OwnerSecurityContext.tsx` — Global security state provider
- `src/components/OwnerAuthModal.tsx` — PIN entry UI
- `src/components/DeviceLimitModal.tsx` — Device limit enforcement
- `server.ts` → `/api/verify-pin` — See [[API_Verify_PIN]]
