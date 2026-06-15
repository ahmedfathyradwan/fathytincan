/**
 * Migration script: transfers all data from local SQLite (data/orders.db) to MongoDB.
 * Run once with:  node scripts/migrateToMongo.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local');
  process.exit(1);
}

const DB_PATH = path.join(__dirname, '..', 'data', 'orders.db');
if (!fs.existsSync(DB_PATH)) {
  console.error('❌ No local SQLite database found at', DB_PATH);
  process.exit(1);
}

const OrderSchema = new mongoose.Schema(
  {
    companyName: String,
    quantity:    Number,
    sizeValue:   Number,
    sizeLabel:   String,
    canName:     String,
    status:      String,
    createdAt:   String,
  },
  { versionKey: false }
);
const Order = mongoose.model('Order', OrderSchema);

async function migrate() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Dynamic import for ESM-only sql.js
  const initSqlJs = (await import('sql.js')).default;
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(fileBuffer);

  const res = db.exec(
    'SELECT id, companyName, quantity, sizeValue, sizeLabel, canName, status, createdAt FROM orders ORDER BY id ASC;'
  );

  if (!res || res.length === 0) {
    console.log('ℹ️  No records found in SQLite database. Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  const { columns, values } = res[0];
  const rows = values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => (obj[col] = row[i]));
    return obj;
  });

  console.log(`📦 Found ${rows.length} records in SQLite. Migrating...`);

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const { companyName, quantity, sizeValue, sizeLabel, canName, status, createdAt } = row;

    const exists = await Order.findOne({ companyName, sizeValue, createdAt });
    if (exists) {
      skipped++;
      continue;
    }

    await new Order({
      companyName,
      quantity: Number(quantity),
      sizeValue: Number(sizeValue),
      sizeLabel,
      canName,
      status,
      createdAt,
    }).save();

    inserted++;
  }

  console.log(`✅ Migration complete! Inserted: ${inserted} | Skipped (duplicates): ${skipped}`);
  db.close();
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
