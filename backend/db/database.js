const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure the db directory exists
const dbDir = path.dirname(path.resolve(process.env.DB_PATH || './db/notes.db'));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.resolve(process.env.DB_PATH || './db/notes.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create notes table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    content    TEXT    NOT NULL DEFAULT '',
    color      TEXT    NOT NULL DEFAULT '#7c3aed',
    pinned     INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

console.log('✅ SQLite database initialized at:', path.resolve(process.env.DB_PATH || './db/notes.db'));

module.exports = db;
