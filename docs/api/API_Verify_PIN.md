---
title: "API: Verify Owner PIN"
tags: [api, security, authentication, pin]
status: active
---

# 🔐 API: Verify Owner PIN

> [[00_ManageMe_MOC]] → API Engine → API_Verify_PIN

## Endpoint

```
POST /api/verify-pin
```

## Overview

Server-side timing-safe PIN verification for the Owner Security layer. Protects sensitive operations like multi-sheet export, shift wage editing, and private cloud sync.

## Request Payload

```json
{
  "pin": "string (4 digits)",
  "action": "string (description of protected action)"
}
```

## Server-Side Timing-Safe Check

The PIN comparison uses Node.js `crypto.timingSafeEqual()` to prevent timing attacks:

```typescript
import { timingSafeEqual } from 'crypto';

const OWNER_PIN = Buffer.from(process.env.OWNER_PIN || '8585');

function verifyPin(input: string): boolean {
  const inputBuffer = Buffer.from(input);
  if (inputBuffer.length !== OWNER_PIN.length) return false;
  return timingSafeEqual(inputBuffer, OWNER_PIN);
}
```

## Response

### Success

```json
{
  "success": true,
  "sessionToken": "string (JWT, 30min expiry)",
  "expiresAt": "2026-03-15T14:30:00Z"
}
```

### Failure

```json
{
  "success": false,
  "error": "INVALID_PIN",
  "remainingAttempts": 4
}
```

## Security Measures

| Measure | Detail |
|---------|--------|
| Timing-safe comparison | `crypto.timingSafeEqual()` |
| Rate limiting | Max 5 attempts per 15 minutes |
| Lockout | 15-minute lockout after 5 failures |
| Session tokens | JWT with 30-minute expiry |
| Audit log | All PIN attempts logged with timestamp and IP |

## Session Token Generation

On successful PIN verification, a JWT session token is issued:

```typescript
const token = jwt.sign(
  { role: 'owner', action, iat: Date.now() },
  process.env.JWT_SECRET,
  { expiresIn: '30m' }
);
```

## Protected Actions

Actions requiring Owner PIN:
- Export multi-sheet workbook
- Edit shift wage records
- Sync to private cloud drives
- View/edit personal application notes
- Clear all application data

## Key Files

- `server.ts` → `/api/verify-pin` handler
- `src/context/OwnerSecurityContext.tsx`
- `src/components/OwnerAuthModal.tsx`
