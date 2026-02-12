import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import { authMiddleware } from '../lib/auth.js';

// Submit quiz and update progress
async function submitQuiz(req, res) {
  try {
    await connectDB();
    const { subjectName, score, answers } = req.body || {};

    if (!subjectName || score === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Subject name and score are required' 
      });
    }

    const user = await User.findOne({ id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get current progress
    const currentProgress = user.quizProgress?.get(subjectName) || { 
      score: 0, 
      attempts: 0,
      lastAttempt: null
    };

    // Update with best score
    const newProgress = {
      score: Math.max(currentProgress.score, score),
      attempts: currentProgress.attempts + 1,
      lastAttempt: new Date()
    };

    // Save to quizProgress Map
    user.quizProgress.set(subjectName, newProgress);
    
    // Add to completed subjects if score >= 70%
    if (score >= 70 && !user.subjectsCompleted.includes(subjectName)) {
      user.subjectsCompleted.push(subjectName);
      
      // Remove from subjects to learn if present
      user.subjectsToLearn = user.subjectsToLearn.filter(s => s !== subjectName);
    }

    // Update reputation score
    user.reputationScore += Math.floor(score / 10);

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      quizProgress: Object.fromEntries(user.quizProgress),
      reputationScore: user.reputationScore,
      subjectsCompleted: user.subjectsCompleted,
      currentAttempt: {
        subject: subjectName,
        score,
        attempts: newProgress.attempts
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Get user quiz progress
async function getQuizProgress(req, res) {
  try {
    await connectDB();
    const { subject } = req.query;

    const user = await User.findOne({ id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let progress;
    if (subject) {
      progress = user.quizProgress?.get(subject) || { score: 0, attempts: 0 };
    } else {
      progress = Object.fromEntries(user.quizProgress || new Map());
    }

    return res.status(200).json({
      success: true,
      quizProgress: progress,
      subjectsCompleted: user.subjectsCompleted,
      subjectsToLearn: user.subjectsToLearn
    });
  } catch (error) {
    console.error('Get quiz progress error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Add subject to learn
async function addSubjectToLearn(req, res) {
  try {
    await connectDB();
    const { subject } = req.body || {};

    if (!subject) {
      return res.status(400).json({ success: false, error: 'Subject is required' });
    }

    const user = await User.findOneAndUpdate(
      { id: req.userId },
      { $addToSet: { subjectsToLearn: subject.trim() } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      subjectsToLearn: user.subjectsToLearn
    });
  } catch (error) {
    console.error('Add subject error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Main handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (pathname === '/api/quiz/submit' && req.method === 'POST') {
    return authMiddleware(submitQuiz)(req, res);
  }

  if (pathname === '/api/quiz/progress' && req.method === 'GET') {
    return authMiddleware(getQuizProgress)(req, res);
  }

  if (pathname === '/api/quiz/add-subject' && req.method === 'POST') {
    return authMiddleware(addSubjectToLearn)(req, res);
  }

  return res.status(404).json({ success: false, error: 'Endpoint not found' });
}
