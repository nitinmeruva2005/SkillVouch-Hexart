import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    const userId = req.query.userId;
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

  } catch (error) {
    console.error('Conversations API error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch conversations',
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
