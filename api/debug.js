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

  try {
    // Debug environment variables
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? '***SET***' : 'NOT SET',
      MYSQL_HOST: process.env.MYSQL_HOST || 'NOT SET',
      MYSQL_PORT: process.env.MYSQL_PORT || 'NOT SET',
      MYSQL_USER: process.env.MYSQL_USER || 'NOT SET',
      MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? '***SET***' : 'NOT SET',
      MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
    };

    // Test DATABASE_URL parsing
    let connectionConfig = null;
    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL);
        connectionConfig = {
          host: url.hostname,
          port: url.port || 3306,
          user: url.username,
          password: url.password ? '***SET***' : 'NOT SET',
          database: url.pathname.substring(1),
          ssl: { rejectUnauthorized: false }
        };
      } catch (parseError) {
        connectionConfig = { error: 'Invalid DATABASE_URL format: ' + parseError.message };
      }
    }

    res.status(200).json({
      success: true,
      message: 'Environment variables debug',
      environment: process.env.NODE_ENV,
      vercelEnvironment: process.env.VERCEL_ENV,
      envVars,
      connectionConfig,
      timestamp: new Date().toISOString(),
      instructions: {
        fix: 'Add DATABASE_URL in Vercel Settings → Environment Variables',
        format: 'DATABASE_URL=mysql://username:password@host:port/database',
        examples: [
          'DATABASE_URL=mysql://admin:password@mydb.c123abc.us-east-1.rds.amazonaws.com:3306/skillvouch',
          'DATABASE_URL=mysql://doadmin:password@db-mysql-nyc1-12345-do-user-1234567-0.db.ondigitalocean.com:25060/skillvouch'
        ]
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Debug endpoint failed',
      details: error.message
    });
  }
}
