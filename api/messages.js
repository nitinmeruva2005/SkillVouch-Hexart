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
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(64) PRIMARY KEY,
        sender_id VARCHAR(64) NOT NULL,
        receiver_id VARCHAR(64) NOT NULL,
        content TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        \`read\` TINYINT(1) NOT NULL DEFAULT 0,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      )
    `);

    if (req.method === 'POST') {
      // Send message
      const m = req.body || {};
      const messageId = m.id || crypto.randomUUID();
      const timestamp = m.timestamp || Date.now();
      const read = m.read ? 1 : 0;

      await connection.execute(
        `INSERT INTO messages (id, sender_id, receiver_id, content, timestamp, \`read\`)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [messageId, m.senderId, m.receiverId, m.content, timestamp, read]
      );

      res.status(201).json({
        id: messageId,
        senderId: m.senderId,
        receiverId: m.receiverId,
        content: m.content,
        timestamp,
        read: !!m.read,
      });

    } else if (req.method === 'GET') {
      const { user1Id, user2Id, userId } = req.query;

      if (user1Id && user2Id) {
        // Get conversation
        const [rows] = await connection.execute(
          `SELECT * FROM messages
           WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
           ORDER BY timestamp ASC`,
          [user1Id, user2Id, user2Id, user1Id]
        );

        const mapped = rows.map((row) => ({
          id: row.id,
          senderId: row.sender_id,
          receiverId: row.receiver_id,
          content: row.content,
          timestamp: Number(row.timestamp),
          read: !!row.read,
        }));

        res.json(mapped);

      } else if (userId) {
        // Get unread count
        const [rows] = await connection.execute(
          'SELECT COUNT(*) AS cnt FROM messages WHERE receiver_id = ? AND `read` = 0',
          [userId]
        );
        
        const count = rows[0]?.cnt || 0;
        res.json({ count: Number(count) });

      } else {
        // Get conversations list
        if (!userId) {
          return res.status(400).json({ error: 'userId query param required' });
        }

        const [rows] = await connection.execute(
          `SELECT DISTINCT
             CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_user_id
           FROM messages
           WHERE sender_id = ? OR receiver_id = ?`,
          [userId, userId, userId]
        );

        if (rows.length === 0) return res.json([]);

        const ids = rows.map((r) => r.other_user_id);
        const placeholders = ids.map(() => '?').join(', ');
        const [userRows] = await connection.execute(
          `SELECT * FROM users WHERE id IN (${placeholders})`,
          ids
        );

        const mapped = userRows.map(row => ({
          id: row.id,
          name: row.name,
          email: row.email,
          avatar: row.avatar,
          bio: row.bio || '',
          discordLink: row.discord_link || undefined,
          skillsKnown: row.skills_known ? JSON.parse(row.skills_known) : [],
          skillsToLearn: row.skills_to_learn ? JSON.parse(row.skills_to_learn) : [],
          rating: parseFloat(row.rating) || 0,
        }));

        res.json(mapped);
      }
    }

  } catch (error) {
    console.error('Messages API error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Message operation failed',
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
