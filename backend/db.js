import mysql from "mysql2/promise";

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

// 🚨 Safety check
if (!DB_HOST) {
  console.error("❌ DB_HOST is not defined");
}

const pool = mysql.createPool({
  host: DB_HOST || "invalid-host",
  port: 3306,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Optional: Test connection at startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export { pool, query };
