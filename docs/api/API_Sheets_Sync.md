---
title: "API: Google Sheets Sync"
tags: [api, google-sheets, sync, data]
status: active
---

# 📊 API: Google Sheets Two-Way Sync

> [[00_ManageMe_MOC]] → API Engine → API_Sheets_Sync

## Endpoint

```
POST /api/sheets-sync
```

## Overview

Enables two-way synchronization between ManageMe's local application data and a private Google Sheet. Supports push (local → Sheets) and pull (Sheets → local) operations.

## Sync Protocol

### Push (Export to Sheets)

```
1. Client sends local application data as JSON array
2. Server authenticates with Google Sheets API via service account
3. Server clears target sheet range
4. Server writes new data rows with headers
5. Server returns sync timestamp
```

### Pull (Import from Sheets)

```
1. Client sends spreadsheet ID and sheet name
2. Server reads all rows via Sheets API
3. Server maps column headers to application schema
4. Server returns parsed records as JSON
5. Client merges with local data (conflict resolution UI)
```

## Request Payload

```json
{
  "action": "push" | "pull",
  "spreadsheetId": "string",
  "sheetName": "string (default: 'Applications')",
  "data": [{ ... }]  // required for push only
}
```

## Service Account Isolation

- The Google Sheets API is accessed via a **dedicated service account** (`manageme-sheets@...iam.gserviceaccount.com`)
- The service account has **Editor** access only to user-shared spreadsheets
- Service account credentials are stored in environment variables (`GOOGLE_SHEETS_CREDENTIALS`)
- No user OAuth tokens are stored server-side

## Conflict Resolution

When pulling data that conflicts with local records, the client displays a merge UI:
- **Overwrite Local**: Replace local record with Sheets data
- **Keep Local**: Ignore Sheets record
- **Merge**: Show diff and let user pick field-by-field

## Key Files

- `server.ts` → `/api/sheets-sync` handler
- `src/components/GoogleSheetsSyncModal.tsx`
- `src/services/sheetsService.ts`
