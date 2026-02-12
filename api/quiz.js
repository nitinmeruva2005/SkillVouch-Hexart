import connectDB from '../lib/mongodb.js';
import Quiz from '../models/Quiz.js';

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

  try {
    await connectDB();

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
      const quiz = new Quiz({
        id: quizId,
        skillName,
        questions: quizQuestions,
        difficulty,
        createdAt: Date.now(),
      });
      
      await quiz.save();

      res.status(201).json({
        success: true,
        quizId,
        skillName,
        difficulty,
        questions: quizQuestions
      });

    } else if (req.method === 'GET') {
      // Get quizzes
      const { skillName } = req.query;
      
      let query = {};
      if (skillName) {
        query.skillName = skillName;
      }
      
      const quizzes = await Quiz.find(query).sort({ createdAt: -1 });
      
      const mapped = quizzes.map(row => ({
        id: row.id,
        skillName: row.skillName,
        questions: row.questions,
        difficulty: row.difficulty,
        createdAt: row.createdAt,
      }));

      res.status(200).json({
        success: true,
        data: mapped,
        count: mapped.length
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
  }
}
