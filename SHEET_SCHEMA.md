# Google Sheets Schema — DataStraw Support CRM

The CRM uses one Google Spreadsheet as its database. Configure the spreadsheet ID in `Code.gs` as `SHEET_ID`.

---

## Required tabs

| Tab name | Constant | Required |
|----------|----------|----------|
| `Tickets` | `SHEETS.TICKETS` | **Yes** — primary data |
| `Orders` | `SHEETS.ORDERS` | **Yes** — order lookup |
| `logs` | `SHEETS.LOGS` | **Yes** — audit trail |

## Optional tabs (referenced in code, not required for core flows)

| Tab name | Constant | Notes |
|----------|----------|-------|
| `Customers` | `SHEETS.CUSTOMERS` | Reserved for future features |
| `Teams` | `SHEETS.TEAMS` | Reserved for future features |

Tab names are **case-sensitive** and must match exactly.

---

## `Tickets` sheet

Row 1 = header row. Data starts at row 2.

| Col | Header (recommended) | Field | Type | Description |
|-----|----------------------|-------|------|-------------|
| A | TicketID | `id` | Text | Unique ID, format `TKT-####` |
| B | CustomerName | `customerName` | Text | |
| C | Email | `email` | Text | |
| D | Phone | `phone` | Text | |
| E | OrderID | `orderId` | Text | Optional link to Orders |
| F | Status | `status` | Text | Pending, In Progress, … |
| G | Channel | `channel` | Text | WhatsApp, Email, … |
| H | Category | `category` | Text | Order Issue, Billing, … |
| I | Description | `description` | Text | Issue summary / body |
| J | Escalation | `escalation` | Text | Unassigned, Support Team, … |
| K | ResolutionNotes | `resolutionNotes` | Text | Internal resolution notes |
| L | Transcript | `transcript` | Text | Chat transcript |
| M | Attachments | `attachments` | Text | URL (e.g. Google Drive) |
| N | CreatedAt | `createdAt` | DateTime | `yyyy-MM-dd HH:mm:ss` |
| O | UpdatedAt | `updatedAt` | DateTime | Auto-updated on edit |

**Note:** Column H in code maps to `category` (index 7) and column I to `description` (index 8). Use distinct headers in row 1 for clarity:

`TicketID | CustomerName | Email | Phone | OrderID | Status | Channel | Category | Description | Escalation | ResolutionNotes | Transcript | Attachments | CreatedAt | UpdatedAt`

### Valid enum values (enforced in UI, not by sheet validation)

**Status:** Pending, In Progress, Waiting on Third Party, Waiting on Customer, Resolved  

**Channel:** WhatsApp, Instagram, Facebook, Email, Call  

**Escalation:** Unassigned, Support Team, Technical Team, Sales, Management  

**Category:** Order Issue, Product Question, Technical Problem, Billing, Other  

---

## `Orders` sheet

| Col | Header | Field | Type |
|-----|--------|-------|------|
| A | OrderID | `orderId` | Text |
| B | Product | `product` | Text |
| C | Amount | `amount` | Number/Text |
| D | Status | `status` | Text |

Lookup: `getOrderDetails(orderId)` scans column A from row 2.

**Example row**

`ORD-1001 | Widget Pro | 49.99 | Shipped`

---

## `logs` sheet

| Col | Header | Description |
|-----|--------|-------------|
| A | Timestamp | `yyyy-MM-dd HH:mm:ss` |
| B | Action | `CREATE`, `UPDATE`, … |
| C | TicketID | Related ticket |
| D | Details | Free-text description |

Append-only via `logAction()`.

---

## `Customers` sheet (optional / future)

| Col | Suggested header |
|-----|------------------|
| A | CustomerID |
| B | Name |
| C | Email |
| D | Phone |
| E | Company |

Not read by current production code.

---

## `Teams` sheet (optional / future)

| Col | Suggested header |
|-----|------------------|
| A | TeamID |
| B | Name |
| C | Department |
| D | Email |

Escalation dropdown values come from `getAppMeta()`, not this sheet.

---

## Setup checklist

1. Create spreadsheet with tabs listed above.
2. Paste header row into `Tickets`, `Orders`, `logs`.
3. Copy spreadsheet ID from URL → set `SHEET_ID` in `Code.gs`.
4. Bind Apps Script project to the spreadsheet (recommended) or use standalone project + ID.
5. Share sheet with the Google account that deploys the web app (Editor access).

---

## Data volume

Tested with **1,000–1,500 rows** on the `Tickets` sheet. See [PERFORMANCE.md](./PERFORMANCE.md) for behavior at scale.

---

## Related

- [API_DOCS.md](./API_DOCS.md) — how rows map to API objects  
- [DEPLOYMENT.md](./DEPLOYMENT.md) — initial sheet setup  
