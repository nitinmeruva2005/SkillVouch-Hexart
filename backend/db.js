import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER ,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add SSL for Railway/production environments
  ssl: process.env.MYSQL_HOST?.includes('railway.app') ? {
    rejectUnauthorized: false
  } : false
});

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export { pool, query };
