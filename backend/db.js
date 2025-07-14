const Database = require('better-sqlite3');
const db = new Database('db/data.db');

// create tables if not exist
db.prepare(`CREATE TABLE IF NOT EXISTS journal (
  id INTEGER PRIMARY KEY,
  entry TEXT,
  sentiment REAL,
  timestamp TEXT
)`).run();
