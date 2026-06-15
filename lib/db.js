import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

let db = null;

function getCandidateDataDir() {
  // Priority: explicit env -> project data dir -> system temp
  const envDir = process.env.SUPABASE_DB_LOCAL_DIR || process.env.DATA_DIR;
  if (envDir) return envDir;
  return path.join(process.cwd(), 'data');
}

function ensureDataDir() {
  const candidates = [getCandidateDataDir(), path.join(os.tmpdir(), 'fathytincan-data')];
  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // test write permission by attempting to write a temp file
      const testFile = path.join(dir, '.writable_test');
      fs.writeFileSync(testFile, 'ok');
      fs.unlinkSync(testFile);
      return dir;
    } catch (err) {
      // try next candidate
    }
  }
  // If all candidates fail, throw so callers can handle gracefully
  throw new Error('No writable data directory available');
}

function getDbPath() {
  try {
    const dataDir = ensureDataDir();
    return path.join(dataDir, 'orders.db');
  } catch (err) {
    // Fallback to in-memory only database
    return null;
  }
}

export async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();
  const dbPath = getDbPath();

  if (dbPath && fs.existsSync(dbPath)) {
    try {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } catch (err) {
      // if reading fails, start empty in-memory DB
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Create orders table if not exists
  try {
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        sizeValue REAL NOT NULL,
        sizeLabel TEXT NOT NULL,
        canName TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'غير متاح',
        createdAt TEXT NOT NULL
      )
    `);
  } catch (err) {
    // ignore table creation errors in memory-restricted environments
  }

  // attempt save (no-op if dbPath is null)
  saveDb();
  return db;
}

export function saveDb() {
  if (!db) return;
  const dbPath = getDbPath();
  if (!dbPath) return; // cannot persist

  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.warn('Failed to save local DB:', err.message || err);
  }
}
