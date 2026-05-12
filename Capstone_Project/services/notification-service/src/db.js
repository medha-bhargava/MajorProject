const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://smart:smart@localhost:5432/notification_db' });

async function initDb() {
  await pool.query(
    'CREATE EXTENSION IF NOT EXISTS pgcrypto; ' +
    'CREATE TABLE IF NOT EXISTS notifications (' +
    'id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ' +
    'type VARCHAR(80) NOT NULL, ' +
    'title VARCHAR(160) NOT NULL, ' +
    'message TEXT NOT NULL, ' +
    "payload JSONB NOT NULL DEFAULT '{}'::jsonb, " +
    'read_at TIMESTAMPTZ, ' +
    'created_at TIMESTAMPTZ NOT NULL DEFAULT now())'
  );
}

async function saveNotification({ type, title, message, payload = {} }) {
  const result = await pool.query(
    'INSERT INTO notifications(type, title, message, payload) VALUES ($1, $2, $3, $4) RETURNING *',
    [type, title, message, payload]
  );
  return result.rows[0];
}

async function listNotifications() {
  const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100');
  return result.rows;
}

async function markRead(id) {
  const result = await pool.query('UPDATE notifications SET read_at = now() WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

module.exports = { initDb, saveNotification, listNotifications, markRead, pool };
