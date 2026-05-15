# Known Limitations & Future Improvements — DataStraw Support CRM

**Project links**

- **GitHub:** [sanyyyyoo/DataStraw-CRM](https://github.com/sanyyyyoo/DataStraw-CRM)
- **Live app:** [Customer Support CRM](https://script.google.com/macros/s/AKfycbzjApDExrlmDw4yA-z_MYL_AMCbLc28AgenOrG15LMG8ITsijc7PaoChKg3oydlJksJ/exec)

---

## Known limitations

### Data and backend

| Limitation | Impact |
|------------|--------|
| **Full sheet read per list request** | Every `getTickets` call loads all ticket rows from Sheets. Search/filter need this today; latency grows linearly with row count. |
| **Hard-coded `SHEET_ID`** | One spreadsheet per deployment; changing environments requires editing `Code.gs`. |
| **No database transactions** | Concurrent edits from two users can overwrite each other’s last save. |
| **Ticket ID generation scans all IDs** | `generateTicketId()` reads all tickets to find max `TKT-####` number. |
| **Date filter requires both dates** | `startDate` and `endDate` must be set together or date filter is skipped. |
| **No sheet data validation** | Invalid status/channel values can be typed directly into the sheet and still display in the app. |

### Security and access

| Limitation | Impact |
|------------|--------|
| **No app-level authentication** | Access control is only via Google’s web app deployment setting and sheet sharing. |
| **No role-based permissions** | All users with app access can create/edit all tickets. |
| **PII in spreadsheet** | Customer email/phone stored in plain text in Sheets. |

### Features

| Limitation | Impact |
|------------|--------|
| **No duplicate ticket detection** | Same customer/issue can be logged multiple times. |
| **No email/Slack notifications** | Status changes are not pushed to external channels. |
| **`Customers` / `Teams` sheets unused** | Escalation teams are hard-coded in `getAppMeta()`, not loaded from `Teams` sheet. |
| **Priority is derived, not stored** | Priority badge logic may differ if rules change and old tickets are not backfilled. |
| **Attachments are URLs only** | No direct Drive upload from the UI; user pastes a link. |
| **CSV export can be slow/large** | Exporting 1,500+ filtered rows is one synchronous server call. |

### Frontend and UX

| Limitation | Impact |
|------------|--------|
| **Tailwind via CDN** | Requires internet for styling; not ideal for locked-down offline networks. |
| **No offline mode** | App requires connection to Apps Script. |
| **Selection off current page** | Ticket detail can show a ticket not visible in the list until user navigates to its page. |

### Platform

| Limitation | Impact |
|------------|--------|
| **Apps Script quotas** | Execution time and payload limits cap extreme workloads. |
| **Google account required** | Depending on deployment, users may need to sign in with Google. |

---

## What works well at current scale

- **1,000–1,500 tickets** with pagination (50 per page)
- Full-filter insights (stats computed server-side)
- Real-time sheet sync for create/update
- Multi-field search and view modes (Active, Team Buckets)

Details: [PERFORMANCE.md](./PERFORMANCE.md)

---

## Future improvements


- [ ] **Duplicate detection** (match email + phone + similar description within 24h)
- [ ] **Assignment workflow** (claim ticket, assignee column)
- [ ] **Comment thread** or append-only activity log per ticket (beyond single transcript field)
- [ ] **Email notifications** via Gmail API on status = Resolved
- [ ] **Bulk status update** for selected tickets
- [ ] Environment config sheet (`Config` tab) for `SHEET_ID`-less deployments

### Long term

- [ ] Migrate datastore to **Firestore** or **Cloud SQL** with Apps Script or Cloud Run API
- [ ] **SSO / Workspace groups** for role-based access
- [ ] **Reporting dashboard** (Looker Studio connector on Sheets or warehouse)
- [ ] **Mobile-optimized** layout and PWA manifest
- [ ] **Webhook integrations** (Zendesk, Intercom, WhatsApp Business API)

---

## Assessment / demo checklist

For reviewers evaluating the project:

| Item | Status |
|------|--------|
| Live deployment works | [Web app URL](https://script.google.com/macros/s/AKfycbzjApDExrlmDw4yA-z_MYL_AMCbLc28AgenOrG15LMG8ITsijc7PaoChKg3oydlJksJ/exec) |
| Source on GitHub | [DataStraw-CRM](https://github.com/sanyyyyoo/DataStraw-CRM) |
| Documentation set | README + ARCHITECTURE + API + SCHEMA + DEPLOY + PERFORMANCE + LIMITATIONS |
| Scale note (1k–1.5k) | Documented in PERFORMANCE.md |
| Demo video | Add link to README when available |

---

## Related documents

- [README.md](./README.md) — overview and links  
- [PERFORMANCE.md](./PERFORMANCE.md) — pagination and scale  
- [DEPLOYMENT.md](./DEPLOYMENT.md) — how to redeploy after changes  
