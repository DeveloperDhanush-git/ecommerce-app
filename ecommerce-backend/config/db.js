import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // ── Pool configuration ────────────────────────────────────────
  waitForConnections: true,   // queue requests when pool is full
  connectionLimit: 10,        // max simultaneous connections
  queueLimit: 0,              // unlimited queue (0 = no limit)
  connectTimeout: 10_000,     // 10 s connection timeout
  // Proactively check connections to detect stale ones
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
});

// Log pool creation
console.log(`[DB] MySQL pool created → ${process.env.DB_HOST}/${process.env.DB_NAME}`);

export default db.promise();
