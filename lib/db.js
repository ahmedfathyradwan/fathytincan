// This file is kept as a compatibility shim.
// All database operations now go through MongoDB via lib/mongoose.js and lib/models/Order.js
// The old SQLite (sql.js) implementation has been removed.

export { connectToDatabase } from '@/lib/mongoose';
