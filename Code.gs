/**
 * DATAStraw CRM Ticketing System
 * Google Apps Script Backend
 */

/* ============================================================================
   CONFIG
============================================================================ */

const SHEET_ID = '11Jk4d1grrmsiaRyTRaKW2R_uYcwS6scwSvPJps7L9n4';

const SHEETS = {
  TICKETS: 'Tickets',
  CUSTOMERS: 'Customers',
  ORDERS: 'Orders',
  TEAMS: 'Teams',
  LOGS: 'logs'
};

/* ============================================================================
   WEB APP
============================================================================ */

function doGet() {
  return HtmlService
    .createTemplateFromFile('index')
    .evaluate()
    .setTitle('Customer Support CRM')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}

/* ============================================================================
   METADATA
============================================================================ */

function getAppMeta() {
  return {
    statuses: [
      'Pending',
      'In Progress',
      'Waiting on Third Party',
      'Waiting on Customer',
      'Resolved'
    ],

    channels: [
      'WhatsApp',
      'Instagram',
      'Facebook',
      'Email',
      'Call'
    ],

    escalations: [
      'Unassigned',
      'Support Team',
      'Technical Team',
      'Sales',
      'Management'
    ],

    categories: [
      'Order Issue',
      'Product Question',
      'Technical Problem',
      'Billing',
      'Other'
    ],

    views: [
      'All Tickets',
      'Active Tickets',
      'Team Buckets'
    ]
  };
}

/* ============================================================================
   SPREADSHEET HELPERS
============================================================================ */

function getSpreadsheet() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function getSheet(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }

  return sheet;
}

function getTicketSheet() {
  return getSheet(SHEETS.TICKETS);
}

function getCurrentTimestamp() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd HH:mm:ss'
  );
}

/* ============================================================================
   TICKET HELPERS
============================================================================ */

function cellToString(val) {
  if (val === null || val === undefined || val === '') return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  }
  return String(val);
}

function rowToTicket(row) {

  return {

    id: cellToString(row[0]),

    customerName: cellToString(row[1]),

    email: cellToString(row[2]),

    phone: cellToString(row[3]),

    orderId: cellToString(row[4]),

    status: cellToString(row[5]) || 'Pending',

    channel: cellToString(row[6]),

    category: cellToString(row[7]),

    description: cellToString(row[8]),

    escalation: cellToString(row[9]) || 'Unassigned',

    resolutionNotes: cellToString(row[10]),

    transcript: cellToString(row[11]),

    attachments: cellToString(row[12]),

    createdAt: cellToString(row[13]),

    updatedAt: cellToString(row[14])
  };
}

function ticketToRow(ticket) {

  return [

    ticket.id,

    ticket.customerName,

    ticket.email,

    ticket.phone,

    ticket.orderId,

    ticket.status,

    ticket.channel,

    ticket.category,

    ticket.description,

    ticket.escalation,

    ticket.resolutionNotes,

    ticket.transcript || '',

    ticket.attachments || '',

    ticket.createdAt,

    ticket.updatedAt
  ];
}

function getAllTickets() {
  const sheet = getTicketSheet();

  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  return data
    .slice(1)
    .map(rowToTicket)
    .filter(ticket => ticket.id);
}

function generateTicketId() {
  const tickets = getAllTickets();

  let maxNumber = 0;

  tickets.forEach(ticket => {
    const match = ticket.id.match(/TKT-(\d+)/);

    if (match) {
      maxNumber = Math.max(
        maxNumber,
        parseInt(match[1], 10)
      );
    }
  });

  return `TKT-${String(maxNumber + 1).padStart(4, '0')}`;
}

/* ============================================================================
   CREATE TICKET
============================================================================ */

function createTicket(ticket) {

  try {

    if (
      !ticket.customerName ||
      !ticket.email ||
      !ticket.phone
    ) {
      return {
        success: false,
        error: 'Required fields missing'
      };
    }

    const sheet = getTicketSheet();

    const now = getCurrentTimestamp();

    const newTicket = {

      id: generateTicketId(),

      customerName: ticket.customerName,

      email: ticket.email,

      phone: String(ticket.phone || ''),

      orderId: ticket.orderId || '',

      status: 'Pending',

      channel: ticket.channel || '',

      category: ticket.category || '',

      description: ticket.description || '',

      escalation: 'Unassigned',

      resolutionNotes: '',

      // NEW
      transcript: ticket.transcript || '',

      // NEW
      attachments: ticket.attachments || '',

      createdAt: now,

      updatedAt: now
    };

    sheet.appendRow([
      newTicket.id,
      newTicket.customerName,
      newTicket.email,
      newTicket.phone,
      newTicket.orderId,
      newTicket.status,
      newTicket.channel,
      newTicket.category,
      newTicket.description,
      newTicket.escalation,
      newTicket.resolutionNotes,
      newTicket.transcript,
      newTicket.attachments,
      newTicket.createdAt,
      newTicket.updatedAt
    ]);

    logAction(
      'CREATE',
      newTicket.id,
      'Ticket created'
    );

    return {
      success: true,
      ticket: newTicket
    };

  } catch (error) {

    return {
      success: false,
      error: error.toString()
    };
  }
}
/* ============================================================================
   GET TICKETS
============================================================================ */

function getTickets(params) {
  params = params || {};
  try {

    let tickets = getAllTickets();

    /* SEARCH */

    if (params.query) {

      const q = params.query.toLowerCase();

      tickets = tickets.filter(ticket => {

        return (
          ticket.id.toLowerCase().includes(q) ||
          ticket.customerName.toLowerCase().includes(q) ||
          ticket.email.toLowerCase().includes(q) ||
          ticket.phone.toLowerCase().includes(q) ||
          ticket.orderId.toLowerCase().includes(q)
        );
      });
    }

    /* STATUS FILTER */

    if (params.status) {
      tickets = tickets.filter(
        ticket => ticket.status === params.status
      );
    }

    /* CHANNEL FILTER */

    if (params.channel) {
      tickets = tickets.filter(
        ticket => ticket.channel === params.channel
      );
    }

    /* VIEW FILTER */

    if (params.viewMode === 'Active Tickets') {
      tickets = tickets.filter(
        ticket => ticket.status !== 'Resolved'
      );
    }

    if (params.viewMode === 'Team Buckets') {
      tickets = tickets.filter(
        ticket => ticket.escalation !== 'Unassigned'
      );
    }

/* DATE FILTER */

if (params.startDate && params.endDate) {

  const start = new Date(params.startDate);

  const end = new Date(params.endDate);

  tickets = tickets.filter(ticket => {

    if (!ticket.createdAt) return false;

    const created = new Date(ticket.createdAt);

    return created >= start && created <= end;
  });
}

    /* SORT */

    tickets.sort((a, b) => {
      // ISO-like 'yyyy-MM-dd HH:mm:ss' strings sort correctly as strings
      const da = a.updatedAt || '';
      const db = b.updatedAt || '';
      if (db > da) return 1;
      if (db < da) return -1;
      return 0;
    });

    return {
      success: true,
      tickets,
      total: tickets.length
    };

  } catch (error) {

    return {
      success: false,
      error: error.toString(),
      tickets: [],
      total: 0
    };
  }
}

/* ============================================================================
   UPDATE TICKET
============================================================================ */

function updateTicket(ticket) {
  try {

    if (!ticket.id) {
      return {
        success: false,
        error: 'Ticket ID missing'
      };
    }

    const sheet = getTicketSheet();

    const data = sheet.getDataRange().getValues();

    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {

      if (data[i][0] === ticket.id) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      return {
        success: false,
        error: 'Ticket not found'
      };
    }

    const existing = rowToTicket(
      data[rowIndex - 1]
    );

    const updatedTicket = {
      ...existing,
      ...ticket,
      updatedAt: getCurrentTimestamp()
    };

    const rowValues = ticketToRow(updatedTicket);
    sheet
      .getRange(rowIndex, 1)
      .offset(0, 0, 1, rowValues.length)
      .setValues([rowValues]);

    logAction(
      'UPDATE',
      ticket.id,
      'Ticket updated'
    );

    return {
      success: true,
      ticket: updatedTicket
    };

  } catch (error) {

    return {
      success: false,
      error: error.toString()
    };
  }
}

/* ============================================================================
   ORDER DETAILS
============================================================================ */

function getOrderDetails(orderId) {
  try {

    const sheet = getSheet(SHEETS.ORDERS);

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {

      if (data[i][0] == orderId) {

        return {
          success: true,
          order: {
            orderId: data[i][0],
            product: data[i][1],
            amount: data[i][2],
            status: data[i][3]
          }
        };
      }
    }

    return {
      success: true,
      order: null
    };

  } catch (error) {

    return {
      success: false,
      error: error.toString()
    };
  }
}

/* ============================================================================
   LOGGING
============================================================================ */

function logAction(action, ticketId, details) {

  try {

    const sheet = getSheet(SHEETS.LOGS);

    sheet.appendRow([
      getCurrentTimestamp(),
      action,
      ticketId,
      details
    ]);

  } catch (error) {

    Logger.log(error);
  }
}

/* ============================================================================
   TEST FUNCTIONS
============================================================================ */

function testConnection() {

  try {

    const spreadsheet = getSpreadsheet();

    return {
      success: true,
      spreadsheetName: spreadsheet.getName(),
      timestamp: new Date()
    };

  } catch (error) {

    return {
      success: false,
      error: error.toString()
    };
  }
}

function testCreateTicket() {

  return createTicket({
    customerName: 'Test User',
    email: 'test@example.com',
    phone: '9999999999',
    orderId: 'ORD-1001',
    channel: 'Email',
    category: 'Technical Problem',
    description: 'Test ticket'
  });
}

function testGetTickets() {

  const result = getTickets({
    query: '',
    status: '',
    channel: '',
    viewMode: 'All Tickets'
  });

  Logger.log(result);

  return result;
}