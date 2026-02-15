import connectDB from '../lib/mongodb.js';
import Quiz from '../models/Quiz.js';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || 'WCDEgp3sS6bERPYNBvhYvzFyT5UzVkdZ';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Generate quiz using Mistral AI
const generateQuizWithAI = async (skillName, difficulty, count = 5) => {
  try {
    const prompt = `Generate ${count} multiple-choice quiz questions about ${skillName} at ${difficulty} level.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "string",
      "codeSnippet": "string (optional code example)",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswerIndex": 0
    }
  ]
}

Requirements:
- Questions should be appropriate for ${difficulty} level
- Include practical, real-world scenarios
- Code snippets should be relevant and properly formatted
- Exactly 4 options per question
- correctAnswerIndex must be 0, 1, 2, or 3
- Do not include any markdown formatting or explanations
- Return only the JSON object`;

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from Mistral API');
    }

    const cleanContent = content.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format');
    }

    return parsed.questions;
  } catch (error) {
    console.error('AI Quiz generation error:', error);
    // Fallback questions
    return [
      {
        question: `What is the basic concept of ${skillName}?`,
        codeSnippet: `// Example ${skillName} code\nconsole.log("Hello ${skillName}");`,
        options: ["Basic concept", "Wrong answer", "Another wrong answer", "Final wrong answer"],
        correctAnswerIndex: 0
      },
      {
        question: `How do you implement ${skillName} in practice?`,
        codeSnippet: `// Implementation example\nfunction ${skillName}Example() {\n  return true;\n}`,
        options: ["Correct implementation", "Incorrect approach", "Wrong method", "Invalid solution"],
        correctAnswerIndex: 0
      }
    ];
  }
};

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

      // Generate quiz questions using AI
      const quizQuestions = await generateQuizWithAI(skillName, difficulty, count);

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
