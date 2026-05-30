import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Help generate a unique incremental ticket_id (e.g. TKT-1004)
async function generateTicketId(db) {
  const lastTicket = await db.get('SELECT ticket_id FROM tickets ORDER BY id DESC LIMIT 1');
  if (!lastTicket) {
    return 'TKT-1001';
  }
  const lastNum = parseInt(lastTicket.ticket_id.split('-')[1], 10);
  return `TKT-${lastNum + 1}`;
}

// REST ENDPOINTS

// 1. POST /api/tickets — Create a ticket
app.post('/api/tickets', async (req, res) => {
  const { customer_name, customer_email, subject, description } = req.body;

  // Basic validation
  if (!customer_name || !customer_email || !subject || !description) {
    return res.status(400).json({ error: 'All fields (customer_name, customer_email, subject, description) are required.' });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer_email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    const db = await getDb();
    const ticketId = await generateTicketId(db);
    const createdAt = new Date().toISOString();

    await db.run(
      `INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'Open', ?, ?)`,
      [ticketId, customer_name.trim(), customer_email.trim().toLowerCase(), subject.trim(), description.trim(), createdAt, createdAt]
    );

    return res.status(201).json({
      ticket_id: ticketId,
      created_at: createdAt
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ error: 'Internal server error occurred while creating ticket.' });
  }
});

// 2. GET /api/tickets — List tickets (with search & filter)
app.get('/api/tickets', async (req, res) => {
  const { status, search } = req.query;

  try {
    const db = await getDb();
    let query = 'SELECT ticket_id, customer_name, subject, status, created_at FROM tickets';
    const params = [];
    const conditions = [];

    // Filter by status if provided
    if (status) {
      if (!['Open', 'In Progress', 'Closed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status filter. Must be Open, In Progress, or Closed.' });
      }
      conditions.push('status = ?');
      params.push(status);
    }

    // Search query matches multiple fields
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        '(ticket_id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR subject LIKE ? OR description LIKE ?)'
      );
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Always sort by created_at descending (newest first)
    query += ' ORDER BY created_at DESC';

    const tickets = await db.all(query, params);
    return res.json(tickets);
  } catch (error) {
    console.error('Error listing tickets:', error);
    return res.status(500).json({ error: 'Internal server error occurred while retrieving tickets.' });
  }
});

// 3. GET /api/tickets/{ticket_id} — Detailed ticket view (with notes)
app.get('/api/tickets/:ticket_id', async (req, res) => {
  const { ticket_id } = req.params;

  try {
    const db = await getDb();
    const ticket = await db.get(
      'SELECT ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at FROM tickets WHERE ticket_id = ?',
      [ticket_id]
    );

    if (!ticket) {
      return res.status(404).json({ error: `Ticket with ID ${ticket_id} not found.` });
    }

    // Fetch notes for the ticket
    const notes = await db.all(
      'SELECT note_text, created_at FROM notes WHERE ticket_id = ? ORDER BY created_at DESC',
      [ticket_id]
    );

    return res.json({
      ...ticket,
      notes
    });
  } catch (error) {
    console.error('Error retrieving ticket details:', error);
    return res.status(500).json({ error: 'Internal server error occurred while retrieving ticket details.' });
  }
});

// 4. PUT /api/tickets/{ticket_id} — Update status & add notes
app.put('/api/tickets/:ticket_id', async (req, res) => {
  const { ticket_id } = req.params;
  const { status, notes } = req.body;

  try {
    const db = await getDb();

    // Verify ticket exists
    const ticket = await db.get('SELECT id FROM tickets WHERE ticket_id = ?', [ticket_id]);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket with ID ${ticket_id} not found.` });
    }

    const updatedAt = new Date().toISOString();

    // Update status if provided
    if (status) {
      if (!['Open', 'In Progress', 'Closed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be Open, In Progress, or Closed.' });
      }
      await db.run(
        'UPDATE tickets SET status = ?, updated_at = ? WHERE ticket_id = ?',
        [status, updatedAt, ticket_id]
      );
    } else {
      // Just update updated_at if only note is added
      await db.run('UPDATE tickets SET updated_at = ? WHERE ticket_id = ?', [updatedAt, ticket_id]);
    }

    // Insert new note if provided
    if (notes && notes.trim() !== '') {
      await db.run(
        'INSERT INTO notes (ticket_id, note_text, created_at) VALUES (?, ?, ?)',
        [ticket_id, notes.trim(), updatedAt]
      );
    }

    return res.json({
      success: true,
      updated_at: updatedAt
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return res.status(500).json({ error: 'Internal server error occurred while updating ticket.' });
  }
});

// SERVE FRONTEND PRODUCTION ASSETS
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Fallback to React index.html for clientside routing support
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // If index.html doesn't exist (e.g. running only backend in dev mode)
      res.status(200).send('API Server is online. Frontend is not compiled yet.');
    }
  });
});

// Start Server with dynamic port scanner fallback
const START_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3010;

function startServer(portAttempt) {
  const server = app.listen(portAttempt, () => {
    console.log(`=================================================`);
    console.log(`  Datastraw CRM Server running on port ${portAttempt}`);
    console.log(`  Local Server: http://localhost:${portAttempt}`);
    console.log(`=================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${portAttempt} is in use, trying next port ${portAttempt + 1}...`);
      startServer(portAttempt + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(START_PORT);
