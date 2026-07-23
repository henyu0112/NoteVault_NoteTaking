const express = require('express');
const router = express.Router();
const db = require('../db/database');

// ─── Helper ────────────────────────────────────────────────────────────────────

/**
 * Validates that a note object has the required fields.
 * Returns an error message string or null if valid.
 */
function validateNote(title, content) {
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return 'Title is required and must be a non-empty string.';
  }
  if (title.trim().length > 200) {
    return 'Title must not exceed 200 characters.';
  }
  if (content !== undefined && typeof content !== 'string') {
    return 'Content must be a string.';
  }
  return null;
}

// ─── GET /api/notes ─────────────────────────────────────────────────────────
// Fetch all notes, pinned notes first, then by newest updated_at
router.get('/', (req, res) => {
  try {
    const { search } = req.query;

    let stmt;
    let notes;

    if (search && search.trim().length > 0) {
      const pattern = `%${search.trim()}%`;
      stmt = db.prepare(`
        SELECT * FROM notes
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY pinned DESC, updated_at DESC
      `);
      notes = stmt.all(pattern, pattern);
    } else {
      stmt = db.prepare(`
        SELECT * FROM notes
        ORDER BY pinned DESC, updated_at DESC
      `);
      notes = stmt.all();
    }

    // Convert SQLite integer (0/1) to boolean for pinned field
    notes = notes.map(note => ({ ...note, pinned: note.pinned === 1 }));

    res.json({ success: true, data: notes, count: notes.length });
  } catch (err) {
    console.error('GET /api/notes error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch notes.' });
  }
});

// ─── GET /api/notes/:id ──────────────────────────────────────────────────────
// Fetch a single note by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);

    if (!note) {
      return res.status(404).json({ success: false, error: `Note with id ${id} not found.` });
    }

    res.json({ success: true, data: { ...note, pinned: note.pinned === 1 } });
  } catch (err) {
    console.error(`GET /api/notes/${req.params.id} error:`, err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch note.' });
  }
});

// ─── POST /api/notes ─────────────────────────────────────────────────────────
// Create a new note
router.post('/', (req, res) => {
  try {
    const { title, content = '', color = '#7c3aed', pinned = false } = req.body;

    const validationError = validateNote(title, content);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const stmt = db.prepare(`
      INSERT INTO notes (title, content, color, pinned)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(title.trim(), content.trim(), color, pinned ? 1 : 0);

    // Return the newly created note
    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Note created successfully.',
      data: { ...newNote, pinned: newNote.pinned === 1 }
    });
  } catch (err) {
    console.error('POST /api/notes error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create note.' });
  }
});

// ─── PUT /api/notes/:id ──────────────────────────────────────────────────────
// Update an existing note
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check the note exists first
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: `Note with id ${id} not found.` });
    }

    // Merge existing values with provided updates (partial update support)
    const {
      title = existing.title,
      content = existing.content,
      color = existing.color,
      pinned = existing.pinned === 1
    } = req.body;

    const validationError = validateNote(title, content);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    db.prepare(`
      UPDATE notes
      SET title = ?, content = ?, color = ?, pinned = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(title.trim(), content.trim(), color, pinned ? 1 : 0, id);

    const updatedNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Note updated successfully.',
      data: { ...updatedNote, pinned: updatedNote.pinned === 1 }
    });
  } catch (err) {
    console.error(`PUT /api/notes/${req.params.id} error:`, err.message);
    res.status(500).json({ success: false, error: 'Failed to update note.' });
  }
});

// ─── DELETE /api/notes/:id ───────────────────────────────────────────────────
// Delete a note by ID
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: `Note with id ${id} not found.` });
    }

    db.prepare('DELETE FROM notes WHERE id = ?').run(id);

    res.json({
      success: true,
      message: `Note "${existing.title}" deleted successfully.`,
      data: { id: Number(id) }
    });
  } catch (err) {
    console.error(`DELETE /api/notes/${req.params.id} error:`, err.message);
    res.status(500).json({ success: false, error: 'Failed to delete note.' });
  }
});

module.exports = router;
