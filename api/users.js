import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  
  try {
    // Parse DATABASE_URL or use individual environment variables
    const databaseUrl = process.env.DATABASE_URL;
    let connectionConfig;

    if (databaseUrl) {
      // Parse DATABASE_URL format: mysql://user:password@host:port/database
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
      // Use individual environment variables (fallback)
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

    // Create connection inside handler
    connection = await mysql.createConnection(connectionConfig);

    // Test connection
    await connection.ping();

    // Check if users table exists, create if not
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar TEXT NOT NULL,
        bio TEXT NOT NULL,
        discord_link VARCHAR(255) NULL,
        skills_known TEXT NOT NULL,
        skills_to_learn TEXT NOT NULL,
        rating FLOAT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Fetch users from database
    const [rows] = await connection.execute('SELECT * FROM users ORDER BY created_at DESC');
    
    // Transform rows to match frontend expectations
    const users = rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      avatar: row.avatar,
      bio: row.bio || '',
      discordLink: row.discord_link || undefined,
      skillsKnown: row.skills_known ? JSON.parse(row.skills_known) : [],
      skillsToLearn: row.skills_to_learn ? JSON.parse(row.skills_to_learn) : [],
      rating: parseFloat(row.rating) || 0,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
    }));

    // Return success response
    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });

  } catch (error) {
    console.error('Database error:', error);
    
    // Return detailed error for debugging
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users',
      details: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  } finally {
    // Always close connection
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}
