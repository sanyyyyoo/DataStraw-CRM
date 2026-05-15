# Datastraw Support CRM System

A fully functional web-based customer support ticketing CRM built using Google Apps Script, Google Sheets, HTML, CSS, and JavaScript.

This project was developed as part of the Datastraw AI + Tech Intern Hiring Assessment.

---

# Features

## Ticket Management
- Create new support tickets
- Automatic unique Ticket ID generation
- Edit and update ticket information
- Real-time synchronization with Google Sheets
- Status tracking and escalation handling

## Search & Filters
- Search by:
  - Ticket ID
  - Customer Name
  - Email
  - Phone Number
  - Order ID

- Filter by:
  - Status
  - Communication Channel
  - Date Range
  - Team Buckets
  - Active Tickets

## Data Integration
- Link tickets with orders database
- Display order details dynamically
- Store transcripts and attachment links
- Resolution notes tracking

## Dashboard & Insights
- Total tickets
- Active tickets
- Escalated tickets
- Resolved tickets

## UI/UX
- Responsive three-panel CRM interface
- Modal-based ticket creation
- Edit/View modes
- Color-coded status indicators
- Loading states and notifications

---

# Tech Stack

## Backend
- Google Apps Script

## Database
- Google Sheets

## Frontend
- HTML5
- CSS3
- Vanilla JavaScript

---

# Project Structure

```text
Code.gs            -> Backend logic
index.html         -> Main application UI
styles.html        -> CSS styling
ui.html            -> UI rendering functions
modal.html         -> Modal handling
tickets.html       -> Ticket operations
script.html        -> Main frontend controller
utils.html         -> Utility/helper functions

# Project URL
https://script.google.com/macros/s/AKfycbzjApDExrlmDw4yA-z_MYL_AMCbLc28AgenOrG15LMG8ITsijc7PaoChKg3oydlJksJ/exec
