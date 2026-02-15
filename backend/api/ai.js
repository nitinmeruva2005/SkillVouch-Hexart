import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import crypto from 'crypto';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || 'WCDEgp3sS6bERPYNBvhYvzFyT5UzVkdZ';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Generate AI Roadmap
async function generateRoadmap(req, res) {
  try {
    await connectDB();
    const { skillsKnown, learningGoals } = req.body || {};

    if (!skillsKnown || !learningGoals) {
      return res.status(400).json({ success: false, error: 'Skills and learning goals are required' });
    }

    const prompt = `Generate a personalized 6-8 step learning roadmap for a user with the following profile:

Current Skills: ${skillsKnown.join(', ')}
Learning Goals: ${learningGoals.join(', ')}

Return ONLY valid JSON in this exact format:
{
  "roadmap": [
    {
      "step": 1,
      "title": "Step Title",
      "description": "Detailed description of what to learn",
      "duration": "1-2 weeks",
      "resources": ["Resource 1", "Resource 2", "Resource 3"]
    }
  ]
}

Requirements:
- Create 6-8 progressive steps from beginner to advanced
- Each step should build on previous knowledge
- Include practical projects and exercises
- Provide realistic timeframes
- Include exactly 3 learning resources per step
- Focus on the user's learning goals
- Return only the JSON object, no markdown`;

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
        max_tokens: 2500
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

    if (!parsed.roadmap || !Array.isArray(parsed.roadmap)) {
      throw new Error('Invalid response format');
    }

    // Save roadmap to user document
    const user = await User.findOneAndUpdate(
      { id: req.userId },
      { roadmap: parsed.roadmap },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      roadmap: parsed.roadmap
    });
  } catch (error) {
    console.error('Generate roadmap error:', error);
    // Return fallback roadmap
    const fallbackRoadmap = [
      {
        step: 1,
        title: 'Foundation Basics',
        description: 'Learn the fundamental concepts and syntax',
        duration: '1-2 weeks',
        resources: ['Official documentation', 'Beginner tutorials', 'Practice exercises'],
        completed: false
      },
      {
        step: 2,
        title: 'Core Concepts',
        description: 'Master essential principles and patterns',
        duration: '2-3 weeks',
        resources: ['Video courses', 'Hands-on projects', 'Community forums'],
        completed: false
      },
      {
        step: 3,
        title: 'Practical Application',
        description: 'Build real-world projects and applications',
        duration: '3-4 weeks',
        resources: ['Project templates', 'Code repositories', 'Mentorship programs'],
        completed: false
      }
    ];
    return res.status(200).json({ success: true, roadmap: fallbackRoadmap });
  }
}

// AI Chatbot
async function aiChat(req, res) {
  try {
    await connectDB();
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Get user context
    const user = await User.findOne({ id: req.userId });
    const context = user ? `User knows: ${user.skillsKnown?.join(', ') || 'none'}. Wants to learn: ${user.skillsToLearn?.join(', ') || 'various skills'}.` : '';

    const prompt = `You are SkillVouch AI, a helpful learning assistant. ${context}

User message: ${message}

Provide a helpful, encouraging response about learning and skill development. Be concise but informative. If the user is asking about specific skills, provide practical advice and resources.`;

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small',
        messages: [
          { role: 'system', content: 'You are a helpful AI learning assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, I could not process your request.';

    // Save chat to user messages
    await User.findOneAndUpdate(
      { id: req.userId },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: message, timestamp: new Date() },
              { role: 'assistant', content: aiResponse, timestamp: new Date() }
            ],
            $slice: -50 // Keep last 50 messages
          }
        }
      }
    );

    return res.status(200).json({
      success: true,
      response: aiResponse
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(200).json({
      success: true,
      response: 'I apologize, I am having trouble connecting to my knowledge base. Please try again later.'
    });
  }
}

// Get chat history
async function getChatHistory(req, res) {
  try {
    await connectDB();

    const user = await User.findOne({ id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      messages: user.messages || []
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Main handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (pathname === '/api/ai/roadmap' && req.method === 'POST') {
    return generateRoadmap(req, res);
  }

  if (pathname === '/api/ai/chat' && req.method === 'POST') {
    return aiChat(req, res);
  }

  if (pathname === '/api/ai/chat-history' && req.method === 'GET') {
    return getChatHistory(req, res);
  }

  return res.status(404).json({ success: false, error: 'Endpoint not found' });
}
