import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import { authMiddleware } from '../lib/auth.js';

// Get current user profile
async function getUserProfile(req, res) {
  try {
    await connectDB();

    const user = await User.findOne({ id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        discordLink: user.discordLink,
        skills: user.skills,
        skillsKnown: user.skillsKnown,
        skillsToLearn: user.skillsToLearn,
        learningGoals: user.learningGoals,
        subjectsCompleted: user.subjectsCompleted,
        subjectsToLearn: user.subjectsToLearn,
        reputationScore: user.reputationScore,
        rating: user.rating,
        quizProgress: user.quizProgress,
        roadmap: user.roadmap,
        messages: user.messages,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Update user profile
async function updateUserProfile(req, res) {
  try {
    await connectDB();

    const updates = req.body || {};
    
    // Fields that can be updated
    const allowedUpdates = [
      'name', 'bio', 'discordLink', 'avatar', 'skills', 
      'skillsKnown', 'skillsToLearn', 'learningGoals',
      'subjectsCompleted', 'subjectsToLearn'
    ];

    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const user = await User.findOneAndUpdate(
      { id: req.userId },
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        discordLink: user.discordLink,
        skills: user.skills,
        skillsKnown: user.skillsKnown,
        skillsToLearn: user.skillsToLearn,
        learningGoals: user.learningGoals,
        subjectsCompleted: user.subjectsCompleted,
        subjectsToLearn: user.subjectsToLearn,
        reputationScore: user.reputationScore,
        rating: user.rating,
        quizProgress: user.quizProgress,
        roadmap: user.roadmap
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Add skill
async function addSkill(req, res) {
  try {
    await connectDB();
    const { skill } = req.body || {};

    if (!skill) {
      return res.status(400).json({ success: false, error: 'Skill is required' });
    }

    const user = await User.findOneAndUpdate(
      { id: req.userId },
      { $addToSet: { skills: skill.trim() } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, skills: user.skills });
  } catch (error) {
    console.error('Add skill error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Add learning goal
async function addLearningGoal(req, res) {
  try {
    await connectDB();
    const { goal } = req.body || {};

    if (!goal) {
      return res.status(400).json({ success: false, error: 'Goal is required' });
    }

    const user = await User.findOneAndUpdate(
      { id: req.userId },
      { $addToSet: { learningGoals: goal.trim() } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, learningGoals: user.learningGoals });
  } catch (error) {
    console.error('Add learning goal error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Update quiz progress
async function updateQuizProgress(req, res) {
  try {
    await connectDB();
    const { subjectName, score } = req.body || {};

    if (!subjectName || score === undefined) {
      return res.status(400).json({ success: false, error: 'Subject name and score are required' });
    }

    const user = await User.findOne({ id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get current progress for this subject
    const currentProgress = user.quizProgress?.get(subjectName) || { score: 0, attempts: 0 };
    
    // Update progress
    user.quizProgress.set(subjectName, {
      score: Math.max(currentProgress.score, score),
      attempts: currentProgress.attempts + 1,
      lastAttempt: new Date()
    });

    await user.save();

    return res.status(200).json({ 
      success: true, 
      quizProgress: Object.fromEntries(user.quizProgress) 
    });
  } catch (error) {
    console.error('Update quiz progress error:', error);
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

  // Route to appropriate handler
  if (pathname === '/api/user/me' && req.method === 'GET') {
    return authMiddleware(getUserProfile)(req, res);
  }

  if (pathname === '/api/user/update' && req.method === 'PUT') {
    return authMiddleware(updateUserProfile)(req, res);
  }

  if (pathname === '/api/user/add-skill' && req.method === 'POST') {
    return authMiddleware(addSkill)(req, res);
  }

  if (pathname === '/api/user/add-learning-goal' && req.method === 'POST') {
    return authMiddleware(addLearningGoal)(req, res);
  }

  if (pathname === '/api/user/update-progress' && req.method === 'POST') {
    return authMiddleware(updateQuizProgress)(req, res);
  }

  return res.status(404).json({ success: false, error: 'Endpoint not found' });
}
