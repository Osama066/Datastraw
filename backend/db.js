import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'database.sqlite');

let dbConnection = null;

export async function getDb() {
  if (dbConnection) {
    return dbConnection;
  }

  // Open database connection
  dbConnection = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await dbConnection.get('PRAGMA foreign_keys = ON');

  // Initialize schema
  await initSchema(dbConnection);

  return dbConnection;
}

async function initSchema(db) {
  // Create tickets table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Open', 'In Progress', 'Closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create notes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT NOT NULL,
      note_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
    )
  `);

  // Check if seed data already exists
  const ticketCount = await db.get('SELECT COUNT(*) as count FROM tickets');
  if (ticketCount.count === 0) {
    console.log('Database empty. Seeding initial test data...');
    await seedData(db);
  }
}

async function seedData(db) {
  const seedTickets = [
    {
      ticket_id: 'TKT-1001',
      customer_name: 'Sarah Jenkins',
      customer_email: 'sarah.j@example.com',
      subject: 'Urgent: Unable to log into my dashboard',
      description: 'Hi Support, since yesterday I am receiving a 500 error when trying to access my analytics dashboard. I have cleared my cookies and cache but the issue persists. Please help!',
      status: 'Open',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
      updated_at: new Date(Date.now() - 3 * 3600000).toISOString()
    },
    {
      ticket_id: 'TKT-1002',
      customer_name: 'Alex Rivera',
      customer_email: 'alex.rivera@techcorp.io',
      subject: 'Webhook verification failures on staging',
      description: 'We are experiencing failure in verifying the signatures on webhook payloads sent to our endpoint. Did the public key rotate recently? We are using the standard SDK integration.',
      status: 'In Progress',
      created_at: new Date(Date.now() - 18 * 3600000).toISOString(), // 18 hours ago
      updated_at: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      ticket_id: 'TKT-1003',
      customer_name: 'Emily Chen',
      customer_email: 'emily.chen@designs.co',
      subject: 'Subscription renewal billing inquiry',
      description: 'Hello, I see double charges on my credit card statement for this month\'s subscription. Could you check if there was a duplicate invoice generated for invoice #INV-9283?',
      status: 'Closed',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString() // 1 day ago
    }
  ];

  for (const t of seedTickets) {
    await db.run(
      `INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.ticket_id, t.customer_name, t.customer_email, t.subject, t.description, t.status, t.created_at, t.updated_at]
    );
  }

  const seedNotes = [
    {
      ticket_id: 'TKT-1002',
      note_text: 'Investigating standard signature header verification. Asked backend team if there was a deployments or rotations recently.',
      created_at: new Date(Date.now() - 15 * 3600000).toISOString()
    },
    {
      ticket_id: 'TKT-1002',
      note_text: 'Replied to customer: Verified that no public keys have rotated. Requested they share their current payload receiver logs to examine headers.',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      ticket_id: 'TKT-1003',
      note_text: 'Reviewed accounts panel. Indeed, a minor network glitch triggered two capture operations on the same token. Refunded invoice charge ending in x9382.',
      created_at: new Date(Date.now() - 1.5 * 86400000).toISOString()
    },
    {
      ticket_id: 'TKT-1003',
      note_text: 'Refund processed successfully. Sent confirmation email to customer. Closed ticket.',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  for (const n of seedNotes) {
    await db.run(
      `INSERT INTO notes (ticket_id, note_text, created_at)
       VALUES (?, ?, ?)`,
      [n.ticket_id, n.note_text, n.created_at]
    );
  }

  console.log('Seeding completed successfully.');
}
