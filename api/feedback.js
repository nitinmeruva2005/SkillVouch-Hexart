import mysql from 'mysql2/promise';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
        ssl: process.env.MYSQL_HOST?.includes('railway.app') || process.env.MYSQL_HOST?.includes('planetscale') 
          ? { rejectUnauthorized: false } 
          : false
      };
    }

    connection = await mysql.createConnection(connectionConfig);
    await connection.ping();

    // Create tables if they don't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS exchange_feedback (
        id VARCHAR(64) PRIMARY KEY,
        request_id VARCHAR(64) NOT NULL,
        from_user_id VARCHAR(64) NOT NULL,
        to_user_id VARCHAR(64) NOT NULL,
        stars INT NOT NULL,
        comment TEXT NULL,
        created_at BIGINT NOT NULL,
        UNIQUE KEY uniq_feedback_per_request_per_user (request_id, from_user_id),
        FOREIGN KEY (request_id) REFERENCES exchange_requests(id),
        FOREIGN KEY (from_user_id) REFERENCES users(id),
        FOREIGN KEY (to_user_id) REFERENCES users(id)
      )
    `);

    if (req.method === 'POST') {
      // Submit feedback
      const f = req.body || {};
      const stars = Number(f.stars);
      
      if (!f.requestId || !f.fromUserId || !f.toUserId) {
        return res.status(400).json({ error: 'requestId, fromUserId, and toUserId are required' });
      }
      
      if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
        return res.status(400).json({ error: 'stars must be between 1 and 5' });
      }

      const feedbackId = f.id || crypto.randomUUID();
      const createdAt = f.createdAt || Date.now();

      await connection.execute(
        `INSERT INTO exchange_feedback (id, request_id, from_user_id, to_user_id, stars, comment, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           stars = VALUES(stars),
           comment = VALUES(comment),
           created_at = VALUES(created_at)`,
        [feedbackId, f.requestId, f.fromUserId, f.toUserId, stars, f.comment || null, createdAt]
      );

      // Update user rating
      const [avgRows] = await connection.execute(
        'SELECT AVG(stars) AS avgStars FROM exchange_feedback WHERE to_user_id = ?',
        [f.toUserId]
      );
      
      const avgStars = avgRows?.[0]?.avgStars != null ? Number(avgRows[0].avgStars) : 0;
      await connection.execute('UPDATE users SET rating = ? WHERE id = ?', [avgStars, f.toUserId]);

      res.status(201).json({ 
        id: feedbackId, 
        requestId: f.requestId, 
        fromUserId: f.fromUserId, 
        toUserId: f.toUserId, 
        stars, 
        comment: f.comment || undefined, 
        createdAt 
      });

    } else if (req.method === 'GET') {
      const userId = req.query.userId;
      const type = req.query.type;

      if (!userId) {
        return res.status(400).json({ error: 'userId query param required' });
      }

      if (type === 'received') {
        // Get received feedback
        const [rows] = await connection.execute(
          `SELECT * FROM exchange_feedback
           WHERE to_user_id = ?
           ORDER BY created_at DESC`,
          [userId]
        );

        const mapped = rows.map((row) => ({
          id: row.id,
          requestId: row.request_id,
          fromUserId: row.from_user_id,
          toUserId: row.to_user_id,
          stars: Number(row.stars),
          comment: row.comment || undefined,
          createdAt: Number(row.created_at),
        }));

        res.json(mapped);

      } else if (type === 'stats') {
        // Get feedback stats
        const [rows] = await connection.execute(
          'SELECT AVG(stars) AS avgStars, COUNT(*) AS cnt FROM exchange_feedback WHERE to_user_id = ?',
          [userId]
        );
        
        const avgStars = rows?.[0]?.avgStars != null ? Number(rows[0].avgStars) : 0;
        const count = rows?.[0]?.cnt != null ? Number(rows[0].cnt) : 0;
        
        res.json({ avgStars, count });
      }
    }

  } catch (error) {
    console.error('Feedback API error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Feedback operation failed',
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
