import { Pool } from 'pg';
const pool = new Pool();

export async function runSettingsMigrations(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export async function getSetting(key: string): Promise<string | null> {
  const result = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
  if (result.rows.length > 0) return result.rows[0].value;
  return null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await pool.query(
    `INSERT INTO settings (key, value)
     VALUES ($1, $2)
     ON CONFLICT (key)
     DO UPDATE SET value = $2`,
    [key, value]
  );
}
