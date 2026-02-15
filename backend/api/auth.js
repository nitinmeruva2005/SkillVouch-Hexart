import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    // SIGNUP
    if (req.method === 'POST' && req.url?.includes('/signup')) {
      const { name, email, password } = req.body || {};

      if (!name || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name, email, and password are required' 
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }

      // Create new user (password will be hashed by pre-save hook)
      const userId = crypto.randomUUID();
      const avatarUrl = `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(name)}`;

      const newUser = new User({
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password, // Will be hashed by pre-save hook
        avatar: avatarUrl,
        bio: '',
        skillsKnown: [],
        skillsToLearn: [],
        learningGoals: [],
        subjectsCompleted: [],
        subjectsToLearn: [],
        reputationScore: 0,
        rating: 5.0,
        quizProgress: {},
        roadmap: [],
        messages: [],
        lastLogin: new Date()
      });

      await newUser.save();
      console.log('✅ User saved to MongoDB:', newUser.id, newUser.email);

      // Return user without sensitive data
      const userResponse = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar
      };

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userResponse
      });
    }

    // LOGIN
    if (req.method === 'POST' && req.url?.includes('/login')) {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Check password using bcrypt compare
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Return user without sensitive data
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userResponse
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error'
    });
  }
}
