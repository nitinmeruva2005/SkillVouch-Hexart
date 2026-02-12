import mysql from 'mysql2/promise';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let connection;
  
  try {
    const databaseUrl = process.env.DATABASE_URL;
    let connectionConfig;

    if (databaseUrl) {
      const url = new URL(databaseUrl);
      connectionConfig = {
        host: url.hostname,
        port: url.port || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1),
        ssl: { rejectUnauthorized: false }
      };
    } else {
      connectionConfig = {
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'skillvouch',
        ssl: process.env.MYSQL_HOST?.includes('railway.app') || 
              process.env.MYSQL_HOST?.includes('planetscale') ||
              process.env.MYSQL_HOST?.includes('clever-cloud.com')
          ? { rejectUnauthorized: false } 
          : false
      };
    }

    connection = await mysql.createConnection(connectionConfig);
    await connection.ping();

    // Create tables if they don't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS exchange_requests (
        id VARCHAR(64) PRIMARY KEY,
        from_user_id VARCHAR(64) NOT NULL,
        to_user_id VARCHAR(64) NOT NULL,
        offered_skill VARCHAR(255) NOT NULL,
        requested_skill VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
        created_at BIGINT NOT NULL,
        completed_at BIGINT NULL,
        FOREIGN KEY (from_user_id) REFERENCES users(id),
        FOREIGN KEY (to_user_id) REFERENCES users(id)
      )
    `);

    if (req.method === 'POST') {
      // Create exchange request
      const r = req.body || {};
      const requestId = r.id || crypto.randomUUID();
      
      await connection.execute(
        `INSERT INTO exchange_requests (id, from_user_id, to_user_id, offered_skill, requested_skill, message, status, created_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          requestId,
          r.fromUserId,
          r.toUserId,
          r.offeredSkill,
          r.requestedSkill,
          r.message,
          r.status || 'pending',
          r.createdAt || Date.now(),
          r.completedAt || null
        ]
      );

      res.status(201).json({ success: true });

    } else if (req.method === 'GET') {
      // Get requests for user
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: 'userId query param required' });
      }

      const [rows] = await connection.execute(
        `SELECT * FROM exchange_requests
         WHERE from_user_id = ? OR to_user_id = ?
         ORDER BY created_at DESC`,
        [userId, userId]
      );

      const mapped = rows.map((row) => ({
        id: row.id,
        fromUserId: row.from_user_id,
        toUserId: row.to_user_id,
        offeredSkill: row.offered_skill,
        requestedSkill: row.requested_skill,
        message: row.message,
        status: row.status,
        createdAt: Number(row.created_at),
        completedAt: row.completed_at ? Number(row.completed_at) : undefined,
      }));

      res.json(mapped);
    }

  } catch (error) {
    console.error('Requests API error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Request operation failed',
      details: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}
