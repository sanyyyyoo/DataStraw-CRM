# Deployment Guide — DataStraw Support CRM

This guide walks through deploying the CRM from [GitHub](https://github.com/sanyyyyoo/DataStraw-CRM) to a live Google Apps Script web app.

**Target live URL (example deployment):**  
https://script.google.com/macros/s/AKfycbzjApDExrlmDw4yA-z_MYL_AMCbLc28AgenOrG15LMG8ITsijc7PaoChKg3oydlJksJ/exec

---

## Prerequisites

- Google account with access to Google Drive, Sheets, and Apps Script
- Chrome or Edge (recommended for Apps Script editor)
- Cloned or downloaded project files from the repo

---

## Step 1: Create the Google Sheet

1. Create a new Google Spreadsheet.
2. Add tabs (exact names):
   - `Tickets`
   - `Orders`
   - `logs`
3. Add header rows — see [SHEET_SCHEMA.md](./SHEET_SCHEMA.md).

**Tickets row 1 (15 columns):**

```
TicketID | CustomerName | Email | Phone | OrderID | Status | Channel | Category | Description | Escalation | ResolutionNotes | Transcript | Attachments | CreatedAt | UpdatedAt
```

**Orders row 1:**

```
OrderID | Product | Amount | Status
```

**logs row 1:**

```
Timestamp | Action | TicketID | Details
```

4. Add sample order rows if you want order linking to work in demos.
5. Copy the **Spreadsheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

---

## Step 2: Create the Apps Script project

### Option A — Bound script (recommended)

1. Open the spreadsheet → **Extensions → Apps Script**.
2. Delete default `Code.gs` content.

### Option B — Standalone script

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. You will set `SHEET_ID` manually in code.

---

## Step 3: Add project files

Copy from the repository into the Apps Script project:

| Local file | Apps Script file |
|------------|------------------|
| `Code.gs` | `Code.gs` |
| `index.html` | `index.html` |
| `styles.html` | `styles.html` |
| `script.html` | `script.html` |
| `ui.html` | `ui.html` |
| `tickets.html` | `tickets.html` |
| `modal.html` | `modal.html` |
| `utils.html` | `utils.html` |

In the Apps Script editor: **+** next to Files → **HTML** for each `.html` file.

Update `SHEET_ID` at the top of `Code.gs` if using a standalone project or a different spreadsheet:

```javascript
const SHEET_ID = 'your-spreadsheet-id-here';
```

---

## Step 4: Authorize the script

1. In the editor, select `testConnection` from the function dropdown.
2. Click **Run**.
3. Review permissions → **Allow** (spreadsheet read/write).
4. Check **Execution log** for `{ success: true, spreadsheetName: "..." }`.

Optional: run `testGetTickets()` after adding a few ticket rows.

---

## Step 5: Deploy as web app

1. **Deploy → New deployment**.
2. Click the gear icon → select type **Web app**.
3. Settings:
   - **Description:** e.g. `DataStraw CRM v1`
   - **Execute as:** Me (your account)
   - **Who has access:**
     - *Anyone with Google account* — for team use with sign-in
     - *Anyone* — public URL (use only if acceptable for your assessment/demo)
4. Click **Deploy**.
5. Copy the **Web app URL** — this is your live deployment link.

---

## Step 6: Verify deployment

Open the web app URL and confirm:

| Check | Expected |
|-------|----------|
| Ticket list loads | Pagination shows e.g. `1–50 of N` |
| Create ticket | New row in `Tickets` + log entry |
| Search / filters | List and count update |
| Edit ticket | Row updates, `UpdatedAt` changes |
| Insights | Totals match filtered dataset |
| Export CSV | Downloads all filtered tickets |
| Order link | Order panel loads when `OrderID` matches `Orders` sheet |

---

## Updating an existing deployment

After code changes:

1. **Deploy → Manage deployments**.
2. Edit (pencil) on the active deployment → **Version: New version**.
3. Save. The same URL continues to serve the new code (may take a short time to propagate).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Sheet not found: Tickets` | Tab name typo; create missing tab |
| Blank page | Check browser console; ensure `doGet` and `index.html` exist |
| Permission denied | Re-run `testConnection` and accept scopes |
| Old UI after deploy | New deployment version; hard-refresh browser |
| Slow load with many rows | Expected at 1k+ rows; see [PERFORMANCE.md](./PERFORMANCE.md) |

---

## Security recommendations

- Do not commit private spreadsheet IDs or service account keys to public repos if the sheet contains PII.
- Restrict **Who has access** on the web app for production.
- Use Google Workspace sharing on the spreadsheet to control who can edit raw data.

---

## Related links

- [README.md](./README.md) — project overview  
- [ARCHITECTURE.md](./ARCHITECTURE.md) — how components connect  
- [GitHub repository](https://github.com/sanyyyyoo/DataStraw-CRM)  
