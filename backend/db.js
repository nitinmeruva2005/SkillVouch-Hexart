import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Parse DATABASE_URL or use individual environment variables
const databaseUrl = process.env.DATABASE_URL;
let poolConfig;

if (databaseUrl) {
  // Parse DATABASE_URL format: mysql://user:password@host:port/database
  const url = new URL(databaseUrl);
  poolConfig = {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
  };
} else {
  // Use individual environment variables (fallback)
  poolConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'skillvouch',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Add SSL for cloud environments
    ssl: process.env.MYSQL_HOST?.includes('railway.app') || 
          process.env.MYSQL_HOST?.includes('planetscale') ||
          process.env.MYSQL_HOST?.includes('clever-cloud.com')
      ? { rejectUnauthorized: false } 
      : false
  };
}

const pool = mysql.createPool(poolConfig);

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export { pool, query };
