# Performance & Scalability — DataStraw Support CRM

This document describes how the CRM behaves at scale, what was optimized, and what to expect with large ticket volumes.

**Dataset scale:** Tested with **1,000–1,500 tickets** on the `Tickets` sheet with filters, pagination, insights, and CSV export enabled.

**Live app:** [Deployed web app](https://script.google.com/macros/s/AKfycbzjApDExrlmDw4yA-z_MYL_AMCbLc28AgenOrG15LMG8ITsijc7PaoChKg3oydlJksJ/exec)

---

## Problem statement

With 1,200+ tickets, loading every row into the browser on each request causes:

- Large `google.script.run` payloads (slow transfer, risk of size limits)
- Heavy DOM rendering (hundreds of list cards)
- Sluggish UI on mid-range devices

The spreadsheet backend also pays a fixed cost: **one full read** of the `Tickets` tab per `getTickets` call.

---

## Optimizations implemented

### 1. Server-side pagination

`getTickets(params)` accepts:

| Param | Default | Max |
|-------|---------|-----|
| `page` | 1 | — |
| `pageSize` | 50 | 100 |

After filters and sort, only the current slice is returned:

```javascript
const start = (page - 1) * pageSize;
const pageTickets = tickets.slice(start, start + pageSize);
```

**Client impact:** ~50 ticket objects per list load instead of 1,500.

### 2. Aggregate statistics on the server

`computeTicketStats(filteredTickets)` runs once per request and returns:

- Counts: total, resolved, active, escalated, highPriority  
- Maps: `byStatus`, `byChannel`, `byCategory`

The insights panel uses `result.stats`, so analytics reflect the **entire filtered dataset**, not only the visible page.

### 3. Debounced search

Search input uses a **400 ms debounce** before calling `getTickets`, reducing rapid-fire server calls while typing.

### 4. Selected ticket retention

`selectedId` is sent with list requests. The server returns `selectedTicket` from the full filtered set even when that ticket is not on the current page—so the detail panel stays correct when paginating.

### 5. Dedicated export path

CSV export calls `getTickets({ …filters, exportAll: true })`, which skips pagination and returns all matching rows **only when the user exports**—not on every page view.

### 6. UI loading state

The ticket list shows a loading message while a fetch is in flight, avoiding duplicate interaction during slow round-trips.

---

## What still runs on every list request

| Operation | Cost | Why |
|-----------|------|-----|
| `getDataRange().getValues()` on `Tickets` | O(n) rows | Required for multi-field search across columns |
| In-memory filter + sort | O(n) | Flexible filters without complex Sheet queries |
| `computeTicketStats` | O(n) | Accurate dashboard for full filter set |

For **n ≈ 1,000–1,500**, this is typically acceptable under Apps Script’s **6-minute** max execution time, but wall-clock latency may be **2–8+ seconds** depending on sheet size, formulas in cells, and Google’s load.

---

## Observed behavior at 1k–1.5k tickets

| Action | Typical behavior |
|--------|------------------|
| Initial page load | One meta call + one paginated `getTickets` |
| Change page | New `getTickets` (full sheet read again) |
| Apply filter | Resets to page 1; full read + filter |
| Export CSV | Single request returning all filtered rows (largest payload) |
| Create / update | Single row write + optional list refresh |

**Bottleneck:** Spreadsheet read + serializing rows in Apps Script, not rendering 50 cards in the browser.

---

## Apps Script limits (relevant)

Consult current [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas):

- **Execution time** per run (consumer vs Workspace accounts differ)
- **Response size** for `google.script.run` (very large exports may fail)
- **Triggers / concurrent executions** if you add background jobs later

At ~1,500 rows × ~15 columns of mostly text, export usually remains within limits; beyond **~3,000–5,000** rows, test export and list latency in your environment.

---

## Recommended usage patterns

1. Use **date range filters** when analyzing historical data to shrink the filtered set.
2. Keep **page size at 50** unless users need denser lists (100 increases payload slightly).
3. Avoid leaving export open in automation; batch exports off-peak if you script them later.
4. Minimize volatile formulas in the `Tickets` sheet columns—the script reads values, but recalc can slow the sheet.

---

## Related documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — data flow  
- [API_DOCS.md](./API_DOCS.md) — `getTickets` parameters  
- [LIMITATIONS.md](./LIMITATIONS.md) — current caps  
