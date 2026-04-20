import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  host: env.dbHost,
  port: Number(env.dbPort),
  database: env.dbName,
  user: env.dbUser,
  password: String(env.dbPassword || ''),
});