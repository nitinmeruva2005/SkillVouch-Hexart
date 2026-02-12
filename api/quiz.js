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

  let connection;
  
  try {
    // Parse DATABASE_URL or use individual environment variables
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

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id VARCHAR(64) PRIMARY KEY,
        skill_name VARCHAR(255) NOT NULL,
        questions TEXT NOT NULL,
        difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
        created_at BIGINT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        quiz_id VARCHAR(64) NOT NULL,
        answers TEXT NOT NULL,
        score INT NOT NULL,
        completed_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
      )
    `);

    if (req.method === 'POST') {
      // Generate quiz
      const { skillName, difficulty = 'beginner', count = 5 } = req.body;
      
      if (!skillName) {
        return res.status(400).json({ error: 'skillName is required' });
      }

      // Generate quiz questions (mock implementation for now)
      const quizQuestions = [
        {
          question: `What is the basic concept of ${skillName}?`,
          codeSnippet: `// Example ${skillName} code\nconsole.log("Hello ${skillName}");`,
          options: [
            "Option A: Basic concept",
            "Option B: Wrong answer",
            "Option C: Another wrong answer", 
            "Option D: Final wrong answer"
          ],
          correctAnswerIndex: 0
        },
        {
          question: `How do you implement ${skillName} in practice?`,
          codeSnippet: `// Implementation example\nfunction ${skillName}Example() {\n  return true;\n}`,
          options: [
            "Option A: Correct implementation",
            "Option B: Incorrect approach",
            "Option C: Wrong method",
            "Option D: Invalid solution"
          ],
          correctAnswerIndex: 0
        }
      ];

      const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store quiz in database
      await connection.execute(
        'INSERT INTO quizzes (id, skill_name, questions, difficulty, created_at) VALUES (?, ?, ?, ?, ?)',
        [quizId, skillName, JSON.stringify(quizQuestions), difficulty, Date.now()]
      );

      res.status(201).json({
        success: true,
        quizId,
        skillName,
        difficulty,
        questions: quizQuestions
      });

    } else if (req.method === 'GET') {
      // Get quizzes
      const { userId, skillName } = req.query;
      
      let query = 'SELECT * FROM quizzes';
      let params = [];
      
      if (skillName) {
        query += ' WHERE skill_name = ?';
        params.push(skillName);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [rows] = await connection.execute(query, params);
      
      const quizzes = rows.map(row => ({
        id: row.id,
        skillName: row.skill_name,
        questions: JSON.parse(row.questions),
        difficulty: row.difficulty,
        createdAt: parseInt(row.created_at),
        updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : null
      }));

      res.status(200).json({
        success: true,
        data: quizzes,
        count: quizzes.length
      });
    }

  } catch (error) {
    console.error('Quiz API error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Quiz operation failed',
      details: error.message,
      code: error.code
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
