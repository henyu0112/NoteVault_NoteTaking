require('dotenv').config();

const express = require('express');
const cors = require('cors');
const notesRouter = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

// Allow requests from any origin to simplify deployment testing
app.use(cors({ origin: '*' }));

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (e.g. form submissions)
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (dev only) ────────────────────────────────────────────────
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '📂 Notes API is running!',
    version: '1.0.0',
    endpoints: {
      'GET    /api/notes':          'Fetch all notes (optional ?search= query)',
      'GET    /api/notes/:id':      'Fetch a single note',
      'POST   /api/notes':          'Create a new note',
      'PUT    /api/notes/:id':      'Update a note',
      'DELETE /api/notes/:id':      'Delete a note',
    }
  });
});

// Mount notes router
app.use('/api/notes', notesRouter);

// ─── Error Handling ─────────────────────────────────────────────────────────────
// Fallback route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, error: 'An unexpected server error occurred.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║       📂  Notes API Server Started       ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`  🚀 Running at:  http://localhost:${PORT}`);
  console.log(`  🩺 Health:      http://localhost:${PORT}/`);
  console.log(`  📋 Notes API:   http://localhost:${PORT}/api/notes`);
  console.log('');
});
