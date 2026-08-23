---
title: "API: Parse Job Description"
tags: [api, ai, gemini, career]
status: active
---

# 🤖 API: Parse Job Description

> [[00_ManageMe_MOC]] → API Engine → API_Parse_JD

## Endpoint

```
POST /api/parse-jd
```

## Overview

Accepts raw job description text and returns structured fields extracted by Gemini 2.5 Flash. Used by the [[Career_Vault]] bookmarklet ingestion and manual text paste flows.

## Request Payload

```json
{
  "rawText": "string (max 5000 chars)",
  "sourceUrl": "string (optional)",
  "title": "string (optional, from page title)"
}
```

## Gemini Schema

The AI is prompted with a structured output schema:

```json
{
  "company": "string",
  "division": "string (IB | PE | AM | Audit | Consulting | Other)",
  "roleTitle": "string",
  "location": "string",
  "deadline": "string (ISO 8601 or null)",
  "salaryRange": "string or null",
  "requirements": ["string"],
  "keySkills": ["string"],
  "applicationUrl": "string or null"
}
```

## Response

```json
{
  "success": true,
  "parsed": { ... },
  "confidence": 0.92,
  "model": "gemini-2.5-flash"
}
```

## Error Boundaries

| Error | HTTP Code | Description |
|-------|-----------|-------------|
| `EMPTY_TEXT` | 400 | `rawText` is missing or empty |
| `TEXT_TOO_LONG` | 400 | Exceeds 5000 character limit |
| `AI_PARSE_FAILED` | 500 | Gemini returned malformed JSON |
| `RATE_LIMIT` | 429 | Too many requests (max 10/min) |

## Security

- Requires valid session token (cookie-based)
- Rate-limited to 10 requests per minute per session
- No PII is stored server-side; parsing is stateless

## Key Files

- `server.ts` → `/api/parse-jd` handler
- `src/services/geminiService.ts` → `parseJobDescription()`
