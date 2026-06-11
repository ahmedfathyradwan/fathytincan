import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'orders.db');

let db = null;

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export async function getDb() {
  if (db) return db;

  ensureDataDir();

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create orders table if not exists
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

  saveDb();
  return db;
}

export function saveDb() {
  if (db) {
    ensureDataDir();
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}
