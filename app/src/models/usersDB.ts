// src/models/usersDB.ts
import { Pool } from 'pg';

const pool = new Pool();

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

export async function runMigrations(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );
  `);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await pool.query('SELECT id, username, password, role FROM users WHERE username = $1', [username]);
  return result.rows[0] || null;
}

export async function updateUserPassword(username: string, hashedPassword: string): Promise<void> {
  await pool.query('UPDATE users SET password = $1 WHERE username = $2', [hashedPassword, username]);
}

export async function createUser(username: string, hashedPassword: string, role: string = 'user'): Promise<User> {
  const result = await pool.query(
    'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, password, role',
    [username, hashedPassword, role]
  );
  return result.rows[0];
}

// Update a user’s password by ID
export async function updateUserPasswordById(userId: number, hashedPassword: string): Promise<void> {
  await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2',
    [hashedPassword, userId]
  );
}

// Delete a user by ID
export async function deleteUserById(userId: number): Promise<void> {
  await pool.query(
    'DELETE FROM users WHERE id = $1',
    [userId]
  );
}

export async function getAllUsers(): Promise<User[]> {
  const result = await pool.query(
    'SELECT id, username, role FROM users'
  );
  return result.rows;
}