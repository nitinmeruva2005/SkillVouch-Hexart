import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import { authMiddleware } from '../lib/auth.js';

// Get current user profile
async function getMe(req, res) {
  try {
    await connectDB();
    
    const user = await User.findOne({ id: req.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      discordLink: user.discordLink,
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
      createdAt: user.createdAt
    };

    return res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Update user profile
async function updateProfile(req, res) {
  try {
    await connectDB();
    
    const updates = req.body;
    const user = await User.findOneAndUpdate(
      { id: req.userId },
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      discordLink: user.discordLink,
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
      createdAt: user.createdAt
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apply auth middleware
  authMiddleware(req, res, () => {
    if (req.method === 'GET') {
      return getMe(req, res);
    }
    if (req.method === 'PUT') {
      return updateProfile(req, res);
    }
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  });
}
