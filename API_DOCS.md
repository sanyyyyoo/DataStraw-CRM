# API Documentation — DataStraw Support CRM

All APIs are **Google Apps Script functions** invoked from the browser with `google.script.run.withSuccessHandler(...).withFailureHandler(...).functionName(args)`.

There is no REST/HTTP JSON API; responses are serialized automatically by Apps Script.

**Deployment:** [Live web app](https://script.google.com/macros/s/AKfycbzjApDExrlmDw4yA-z_MYL_AMCbLc28AgenOrG15LMG8ITsijc7PaoChKg3oydlJksJ/exec)

---

## Web app entry

### `doGet()`

Serves the CRM UI.

| Returns | `HtmlOutput` from template `index` |
| Title | `Customer Support CRM` |
| X-Frame | `ALLOWALL` |

### `include(filename)`

Returns raw HTML string for `<?!= include('…'); ?>` in templates.

| Parameter | Type | Description |
|-----------|------|-------------|
| `filename` | string | File name without extension (e.g. `'ui'`) |

---

## Metadata

### `getAppMeta()`

Dropdown and view configuration for the UI.

**Response**

```javascript
{
  statuses: string[],
  channels: string[],
  escalations: string[],
  categories: string[],
  views: string[]
}
```

**Default values**

- **statuses:** Pending, In Progress, Waiting on Third Party, Waiting on Customer, Resolved  
- **channels:** WhatsApp, Instagram, Facebook, Email, Call  
- **escalations:** Unassigned, Support Team, Technical Team, Sales, Management  
- **categories:** Order Issue, Product Question, Technical Problem, Billing, Other  
- **views:** All Tickets, Active Tickets, Team Buckets  

---

## Tickets

### `getTickets(params)`

Fetch tickets with optional filters, sorting, pagination, and aggregate stats.

**Parameters (`params` object)**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `query` | string | `''` | Case-insensitive search across id, name, email, phone, orderId |
| `status` | string | `''` | Exact status match; empty = all |
| `channel` | string | `''` | Exact channel match |
| `viewMode` | string | — | `All Tickets`, `Active Tickets`, or `Team Buckets` |
| `startDate` | string | — | ISO date `YYYY-MM-DD` (requires `endDate`) |
| `endDate` | string | — | ISO date `YYYY-MM-DD` |
| `page` | number | `1` | Page number (1-based) |
| `pageSize` | number | `50` | Clamped to 1–100 |
| `selectedId` | string | — | If set, full ticket returned in `selectedTicket` even if not on current page |
| `exportAll` | boolean | `false` | If `true`, returns all matching tickets (no pagination slice) |

**Sort order:** `updatedAt` descending (string compare on `yyyy-MM-dd HH:mm:ss`).

**Success response (paginated)**

```javascript
{
  success: true,
  tickets: Ticket[],      // current page only
  total: number,          // count after filters
  page: number,
  pageSize: number,
  totalPages: number,
  stats: TicketStats,
  selectedTicket: Ticket | null
}
```

**Success response (`exportAll: true`)**

```javascript
{
  success: true,
  tickets: Ticket[],      // all matching rows
  total: number,
  stats: TicketStats,
  selectedTicket: Ticket | null
}
```

**`TicketStats`**

```javascript
{
  total: number,
  resolved: number,
  active: number,
  escalated: number,
  highPriority: number,
  byStatus: { [status: string]: number },
  byChannel: { [channel: string]: number },
  byCategory: { [category: string]: number }
}
```

**Error response**

```javascript
{
  success: false,
  error: string,
  tickets: [],
  total: 0,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  stats: null
}
```

---

### `createTicket(ticket)`

**Parameters**

| Field | Required | Notes |
|-------|----------|-------|
| `customerName` | yes | |
| `email` | yes | |
| `phone` | yes | Stored as string |
| `orderId` | no | |
| `channel` | no | |
| `category` | no | |
| `description` | no | |
| `transcript` | no | |
| `attachments` | no | URL string |

Server sets: `id` (generated), `status` = Pending, `escalation` = Unassigned, `resolutionNotes` = `''`, `createdAt` / `updatedAt`.

**Success**

```javascript
{ success: true, ticket: Ticket }
```

**Failure**

```javascript
{ success: false, error: string }
```

---

### `updateTicket(ticket)`

**Parameters:** Must include `id`. Other fields merged over existing row; `updatedAt` refreshed server-side.

**Success**

```javascript
{ success: true, ticket: Ticket }
```

**Failure**

```javascript
{ success: false, error: string }  // e.g. 'Ticket ID missing', 'Ticket not found'
```

---

## Orders

### `getOrderDetails(orderId)`

**Parameters:** `orderId` — string, matched against column A of `Orders` sheet.

**Success**

```javascript
{
  success: true,
  order: {
    orderId: string,
    product: string,
    amount: string | number,
    status: string
  } | null
}
```

**Failure**

```javascript
{ success: false, error: string }
```

---

## Logging (internal)

### `logAction(action, ticketId, details)`

Appends one row to `logs` sheet: timestamp, action, ticketId, details. Failures are caught and written to `Logger.log` only.

---

## Test / diagnostic

### `testConnection()`

```javascript
{ success: true, spreadsheetName: string, timestamp: Date }
// or { success: false, error: string }
```

### `testCreateTicket()` / `testGetTickets()`

Development helpers; run from Apps Script editor.

---

## Ticket object shape

```javascript
{
  id: string,              // e.g. "TKT-0042"
  customerName: string,
  email: string,
  phone: string,
  orderId: string,
  status: string,
  channel: string,
  category: string,
  description: string,
  escalation: string,
  resolutionNotes: string,
  transcript: string,
  attachments: string,     // URL
  createdAt: string,       // "yyyy-MM-dd HH:mm:ss"
  updatedAt: string
}
```

---

## Frontend call map

| UI action | Server function |
|-----------|-----------------|
| Page load | `getAppMeta`, `getTickets` |
| Search / filters / pagination | `getTickets` |
| Export CSV | `getTickets({ …filters, exportAll: true })` |
| New ticket | `createTicket` |
| Save edit | `updateTicket` |
| Order panel | `getOrderDetails` |

---

## Apps Script quotas (reference)

Operations are subject to [Google Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas) (execution time, `UrlFetch` if added later, etc.). Large exports (`exportAll` with 1,500 rows) may approach execution time limits on slow sheets—see [PERFORMANCE.md](./PERFORMANCE.md).
