# Architecture — DataStraw Support CRM

## High-level diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Browser (Web App Client)                          │
│  index.html + script.html + ui.html + tickets.html + modal.html        │
│  utils.html + styles.html                                                │
│                                                                          │
│  • appState (tickets, selection, pagination)                             │
│  • google.script.run → server functions                                  │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ RPC (Apps Script)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   Google Apps Script (Code.gs)                         │
│                                                                          │
│  doGet() ──► HtmlService.createTemplateFromFile('index')                 │
│  include() ──► HTML partials                                             │
│                                                                          │
│  getAppMeta │ getTickets │ createTicket │ updateTicket                   │
│  getOrderDetails │ logAction │ helpers                                   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ SpreadsheetApp API
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Google Spreadsheet (SHEET_ID)                        │
│   Tickets │ Orders │ logs │ (Customers, Teams — optional)                │
└─────────────────────────────────────────────────────────────────────────┘
```

**Live deployment:** [Web app URL](https://script.google.com/macros/s/AKfycbzjApDExrlmDw4yA-z_MYL_AMCbLc28AgenOrG15LMG8ITsijc7PaoChKg3oydlJksJ/exec)  
**Source:** [GitHub — DataStraw-CRM](https://github.com/sanyyyyoo/DataStraw-CRM)

---

## Architectural style

- **Monolithic Apps Script project** — no separate API server; the web app and backend share one project.
- **Thin client, thick server for data** — filtering, sorting, stats, and pagination logic live in `Code.gs`.
- **Template composition** — one entry HTML file includes fragments to keep files maintainable without a bundler.

---

## Request lifecycle: load tickets

1. User opens the web app → `doGet()` serves `index.html`.
2. `DOMContentLoaded` → `loadMeta()` → `getAppMeta()` populates filter dropdowns.
3. `loadTickets()` builds `params` (filters + `page` + `pageSize` + optional `selectedId`).
4. `getTickets(params)` on the server:
   - Reads all ticket rows via `getAllTickets()`.
   - Applies query, status, channel, view mode, date filters.
   - Sorts by `updatedAt` descending.
   - Runs `computeTicketStats()` on the full filtered array.
   - Slices one page (unless `exportAll`).
   - Returns page of tickets + metadata + `selectedTicket` if requested.
5. Client updates list, pagination bar, insights, and detail panel.

---

## Request lifecycle: create / update ticket

**Create**

1. Modal form → `createTicket(payload)`.
2. Server validates required fields, generates `TKT-####`, `appendRow` to `Tickets`.
3. `logAction('CREATE', …)` → `logs` sheet.
4. Client resets to page 1 and reloads list.

**Update**

1. Edit form → `updateTicket(merged object)`.
2. Server finds row by ticket ID, merges with existing row, sets `updatedAt`, `setValues`.
3. `logAction('UPDATE', …)`.
4. Client refreshes detail and list card for that ticket.

---

## Frontend module responsibilities

| File | Responsibility |
|------|----------------|
| `index.html` | Layout: header, search, filters, three columns, modal shell |
| `script.html` | `appState`, event listeners, `loadTickets`, `getFilterParams`, CSV export |
| `ui.html` | `renderTicketList`, `renderTicketDetailView`, insights charts, edit form |
| `tickets.html` | `selectTicket`, `applyFilters` (resets page), `goToPage`, `clearTicketDetail` |
| `modal.html` | Open/close modal, submit new ticket |
| `utils.html` | `escapeHtml`, date formatting, priority/status CSS classes, toasts |
| `styles.html` | Panel scroll, active ticket card, notification toasts |

---

## Backend module responsibilities (`Code.gs`)

| Section | Functions |
|---------|-----------|
| Config | `SHEET_ID`, `SHEETS` constants |
| Web app | `doGet`, `include` |
| Metadata | `getAppMeta` |
| Sheet access | `getSpreadsheet`, `getSheet`, `getTicketSheet` |
| Mapping | `rowToTicket`, `ticketToRow`, `cellToString` |
| Reads | `getAllTickets`, `getTickets`, `getOrderDetails` |
| Writes | `createTicket`, `updateTicket`, `logAction` |
| Analytics | `computeTicketStats`, `ticketPriority` |
| IDs | `generateTicketId` |

---

## Data model (application layer)

Tickets are plain JavaScript objects:

```javascript
{
  id, customerName, email, phone, orderId,
  status, channel, category, description,
  escalation, resolutionNotes, transcript, attachments,
  createdAt, updatedAt
}
```

Priority is **derived** on the client and server (not stored): Management escalation → High; Pending → Low; else Medium.

---

## Security model (current)

- Access control is inherited from **Google account** and **web app deployment settings** (who can open the URL).
- No custom auth tokens or session management in code.
- `SHEET_ID` must be a sheet the script owner can edit.
- `setXFrameOptionsMode(ALLOWALL)` allows embedding in iframes (adjust if stricter CSP is required).

---

## Extension points

| Area | How to extend |
|------|----------------|
| New filter | Add param handling in `getTickets` + UI control in `index.html` / `script.html` |
| New column | Update `rowToTicket`, `ticketToRow`, sheet header, UI forms |
| New sheet entity | Add `SHEETS` key, read/write helpers, optional UI panel |
| Notifications | Time-driven trigger or external webhook (not present today) |

---

## Related documents

- [API_DOCS.md](./API_DOCS.md) — function contracts  
- [SHEET_SCHEMA.md](./SHEET_SCHEMA.md) — spreadsheet layout  
- [PERFORMANCE.md](./PERFORMANCE.md) — scale and pagination  
- [DEPLOYMENT.md](./DEPLOYMENT.md) — how to ship the app  
