# Datastraw Support CRM

A Google Apps Script web application for customer support ticket management, backed by Google Sheets.

## Features

- **Ticket Management**: Create, read, update tickets with auto-generated IDs (TKT-XXXX format)
- **Search & Filter**: Find tickets by ID, customer name, email, phone, or order ID
- **Filter by Status**: Pending, In Progress, Waiting on Third Party, Waiting on Customer, Resolved
- **Filter by Channel**: WhatsApp, Instagram, Facebook, Email, Call
- **View Modes**: All Tickets, Active Tickets (non-resolved), Team Buckets (escalated)
- **Ticket Editing**: Update customer info, status, escalation level, resolution notes
- **Order Linking**: Link tickets to order records for context
- **Escalation Tracking**: Assign tickets to team members or departments
- **CSV Export**: Export all tickets to CSV for analysis
- **Responsive UI**: Three-panel layout with ticket list, details, and insights
- **Real-time Updates**: Changes sync immediately to Google Sheets

## Project Structure

- `appsscript.json` - Google Apps Script manifest and web app deployment settings
- `Code.gs` - Backend Apps Script code for the CRM API (CRUD, sheet helpers, logging)
- `index.html` - Frontend application shell and modal markup
- `styles.css` - Styling for the three-panel layout and UI components
- `script.js` - Frontend logic, UI rendering, and backend API calls
- `README.md` - This file

## How to Use

### Creating a New Ticket
1. Click the "New Ticket" button in the top-right
2. Fill in customer details (name, email, phone)
3. Add order ID, channel, category, and description
4. Click "Create Ticket" to save

### Viewing Ticket Details
1. Click any ticket in the left panel
2. View all ticket information in the center panel
3. Click "Edit" to modify ticket details

### Editing a Ticket
1. Select a ticket from the list
2. Click the "Edit" button
3. Update any field (status, escalation, notes, etc.)
4. Click "Save" to persist changes to Google Sheets
5. Click "Cancel" to discard changes

### Searching Tickets
1. Enter a search term (ticket ID, customer name, phone, email, or order ID)
2. Click "Search" to filter results
3. Use dropdown filters for status, channel, or view mode

### Exporting Data
1. Click "Export CSV" in the right panel
2. A CSV file with all tickets will download to your computer

## Google Sheets Schema

The app expects the following sheet tabs with these columns:

### Tickets Sheet
| Column | Type | Description |
|--------|------|-------------|
| TicketID | Text | Auto-generated (TKT-XXXX) |
| CustomerName | Text | Full customer name |
| Email | Email | Customer email address |
| Phone | Text | Customer phone number |
| OrderID | Text | Link to order (optional) |
| Status | Text | Pending, In Progress, Waiting on Third Party, Waiting on Customer, Resolved |
| Channel | Text | WhatsApp, Instagram, Facebook, Email, Call |
| Category | Text | Order Issue, Product Question, Technical Problem, Billing, Other |
| Description | Text | Full issue description |
| Escalation | Text | Unassigned, Support Team, Technical Team, Sales, Management |
| ResolutionNotes | Text | Internal notes on resolution |
| CreatedAt | DateTime | Auto-generated |
| UpdatedAt | DateTime | Auto-updated |

### Other Sheets (optional for future use)
- **Customers**: CustomerID, Name, Email, Phone, Company
- **Orders**: OrderID, CustomerName, Amount, Status, CreatedAt
- **Teams**: TeamID, Name, Department, Email
- **logs**: Timestamp, Action, TicketID, Details (audit trail)

## Backend API

All backend functions are in `Code.gs`:

### Ticket Operations
- `createTicket(ticket)` - Creates a new ticket with auto-generated ID
- `getTickets(params)` - Fetches tickets with filters (query, status, channel, viewMode, date range, pagination)
- `updateTicket(ticket)` - Updates an existing ticket with new values

### Data Retrieval
- `getOrderDetails(orderId)` - Retrieves order information for linking
- `getTeams()` - Returns list of teams for escalation assignment
- `getAppMeta()` - Returns available statuses, channels, categories, escalations

### Utilities
- `testBackend()` - Quick connectivity test
- `testConnection()` - Verifies Sheets connection

## Deployment

1. Open the Google Apps Script editor
2. Click "Deploy" → "New Deployment"
3. Select "Web app" as the deployment type
4. Set "Execute as" to your Google account
5. Set "Who has access" to "Anyone"
6. Click "Deploy"
7. Copy the public URL and share it for team access

## Known Limitations

- Attachments/transcripts stored as URL fields only (no Drive integration in MVP)
- No email notifications (can be added as enhancement)
- Single Google Sheet per deployment (no multi-workspace support)
- Pagination loads up to 50 tickets at a time
- No role-based access control (all users have full access)
- No duplicate detection or prevention

## Future Enhancements

- Email notifications for ticket assignments
- PDF export and printing
- Dashboard with analytics and SLA tracking
- Google Drive integration for file attachments
- Role-based access control (admin, support, manager)
- Automated reporting and metrics
- Ticket templates and canned responses
- Bulk operations (update multiple tickets)
- Custom fields and metadata

## Setup Instructions

1. **Create a Google Sheet** and add the tabs: Tickets, Customers, Orders, Teams, logs
2. **Get the Sheet ID** from the URL (between /d/ and /edit)
3. **Update Code.gs** - Replace the SHEET_ID constant with your sheet ID
4. **Populate sample data** - Add 2-3 test tickets to the Tickets sheet
5. **Deploy the app** as a public web app
6. **Test all features** - Create, search, filter, edit, export
7. **Share the public URL** with your team
