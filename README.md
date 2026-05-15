# DataStraw Support CRM

A web-based customer support ticketing CRM built with **Google Apps Script**, **Google Sheets**, and a modular **HTML/CSS/JavaScript** frontend. Developed as part of the **Datastraw AI + Tech Intern Hiring Assessment**.

| Resource | Link |
|----------|------|
| **Live app** | [Customer Support CRM (deployed)](https://script.google.com/macros/s/AKfycbzjApDExrlmDw4yA-z_MYL_AMCbLc28AgenOrG15LMG8ITsijc7PaoChKg3oydlJksJ/exec) |
| **GitHub** | [sanyyyyoo/DataStraw-CRM](https://github.com/sanyyyyoo/DataStraw-CRM) |
| **Demo video** | _Add your Loom/YouTube link here_ |

---

## Project overview

DataStraw Support CRM lets support teams create, search, filter, update, and analyze support tickets stored in Google Sheets. The UI is a three-panel layout: ticket list (with pagination), ticket detail (view/edit), and insights/analytics. All writes sync to the spreadsheet in real time; audit events are appended to a logs sheet.

The system is designed for **medium-to-large ticket volumes** (tested with **1,000–1,500 tickets**) using server-side filtering, aggregate statistics, and client pagination so the browser only receives one page of results at a time.

---

## Features

### Ticket management
- Create tickets via modal (required: name, email, phone)
- Auto-generated ticket IDs (`TKT-0001`, `TKT-0002`, …)
- View and edit ticket details (customer info, status, escalation, notes)
- Link tickets to orders; order details load dynamically
- Store chat transcripts and attachment URLs (Google Drive links)
- Resolution notes and internal transcript fields

### Search and filters
- Search: ticket ID, customer name, email, phone, order ID
- Filter by status, channel, date range
- View modes: **All Tickets**, **Active Only** (non-resolved), **Team Buckets** (escalated)

### Dashboard and insights
- Totals: all, resolved, active, escalated, high-priority
- Status breakdown, channel distribution, top query themes
- Resolution rate (computed over the **full filtered dataset**, not only the current page)

### Data and export
- CSV export of **all tickets matching current filters**
- Pagination in the ticket list (25 / 50 / 100 per page)
- Audit logging (`CREATE` / `UPDATE`) to the `logs` sheet

### UI/UX
- Responsive three-column layout (Tailwind CSS via CDN)
- Modal-based ticket creation
- Edit/view modes with save/cancel
- Color-coded status and priority badges
- Loading states, debounced search, toast notifications

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Google Apps Script (V8) |
| Database | Google Sheets |
| Frontend | HTML5, CSS3, vanilla JavaScript |
| Styling | Tailwind CSS (CDN), custom styles in `styles.html` |
| Hosting | Google Apps Script Web App (`doGet`) |

---

## Project structure

```
datastraw/
├── Code.gs           # Backend: CRUD, filters, pagination, stats, logging
├── index.html        # App shell, layout, includes other HTML partials
├── styles.html       # Custom CSS (scrollbars, toasts, active card)
├── script.html       # App state, load tickets, filters, export, pagination
├── ui.html           # List/detail/insights rendering, edit form
├── tickets.html      # Selection, filter reset, page navigation
├── modal.html        # New-ticket modal
├── utils.html        # Dates, escapeHtml, priority/status helpers
├── README.md         # This file
├── ARCHITECTURE.md   # System design
├── API_DOCS.md       # Server API reference
├── SHEET_SCHEMA.md   # Spreadsheet columns and tabs
├── DEPLOYMENT.md     # Setup and deploy steps
├── PERFORMANCE.md    # Scalability and pagination
└── LIMITATIONS.md    # Known limits and roadmap
```

HTML partials are composed with `<?!= include('filename'); ?>` and served via `HtmlService.createTemplateFromFile`.

---

## Quick start (deployment)

1. Create a Google Sheet with tabs: `Tickets`, `Orders`, `logs` (and optionally `Customers`, `Teams`). See [SHEET_SCHEMA.md](./SHEET_SCHEMA.md).
2. Copy this repo into a new **Apps Script** project bound to that sheet (or set `SHEET_ID` in `Code.gs`).
3. Add all `.gs` / `.html` files to the script project.
4. Run `testConnection()` once to authorize spreadsheet access.
5. **Deploy → New deployment → Web app** (Execute as: Me, Who has access: per your needs).
6. Open the deployment URL and verify list, create, edit, and export.

Full steps: [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Google Sheets schema

Summary (details in [SHEET_SCHEMA.md](./SHEET_SCHEMA.md)):

| Sheet | Purpose |
|-------|---------|
| `Tickets` | Primary ticket store (15 columns) |
| `Orders` | Order lookup for linked tickets |
| `logs` | Audit trail |
| `Customers`, `Teams` | Reserved for future use |

---

## API overview

Frontend calls server functions via `google.script.run`. Main endpoints:

| Function | Purpose |
|----------|---------|
| `getAppMeta()` | Statuses, channels, escalations, categories, views |
| `getTickets(params)` | Filter, sort, paginate; return stats |
| `createTicket(ticket)` | Create row + log |
| `updateTicket(ticket)` | Update row + log |
| `getOrderDetails(orderId)` | Lookup order by ID |

Full request/response shapes: [API_DOCS.md](./API_DOCS.md).

---

## Performance optimization

- **Pagination**: Default 50 tickets per page (max 100); reduces payload to the browser.
- **Server-side aggregates**: `computeTicketStats()` runs on the filtered set once per request; insights stay accurate without sending all rows to the client.
- **Debounced search**: 400 ms delay on search input to limit round-trips.
- **Export path**: `exportAll: true` returns full filtered set only when exporting CSV.

Details and scale notes: [PERFORMANCE.md](./PERFORMANCE.md).

---

## Known limitations

- Full sheet read on each `getTickets` call (needed for cross-field search).
- No multi-user locking or real-time collaborative editing.
- Single spreadsheet ID hard-coded in `Code.gs`.
- No role-based access control in the app layer.

See [LIMITATIONS.md](./LIMITATIONS.md).

---

## Future improvements

- Sheet-level query / cached index for faster reads at 5k+ rows
- `getTicketById` for O(1) detail loads
- User authentication and team-based permissions
- Email/Slack notifications on status change
- Duplicate-ticket detection
- Customers/Teams sheet integration

---

## Documentation index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Components, data flow, file roles |
| [API_DOCS.md](./API_DOCS.md) | API contracts |
| [SHEET_SCHEMA.md](./SHEET_SCHEMA.md) | Column definitions |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy guide |
| [PERFORMANCE.md](./PERFORMANCE.md) | Pagination and 1k–1.5k scale |
| [LIMITATIONS.md](./LIMITATIONS.md) | Limits and roadmap |

---

## License and attribution

Built for the Datastraw hiring assessment. Update the demo video link in this README when your recording is ready.
