import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';

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
    // Connect to MongoDB
    await connectDB();

    if (req.method === 'GET') {
      // Get all users
      const users = await User.find({}).sort({ createdAt: -1 });
      
      return res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    }

    if (req.method === 'POST') {
      // Create new user
      const userData = req.body || {};
      
      const user = new User({
        id: userData.id || crypto.randomUUID(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        avatar: userData.avatar,
        bio: userData.bio || '',
        discordLink: userData.discordLink,
        skillsKnown: userData.skillsKnown || [],
        skillsToLearn: userData.skillsToLearn || [],
        rating: userData.rating || 5.0
      });
      
      await user.save();
      
      return res.status(201).json({ success: true, data: user });
    }

    if (req.method === 'PUT') {
      // Update or create user
      const userData = req.body || {};
      const id = userData.id;
      
      if (!id) {
        return res.status(400).json({ error: 'User id is required in request body' });
      }
      
      const user = await User.findOneAndUpdate(
        { id },
        {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          avatar: userData.avatar,
          bio: userData.bio,
          discordLink: userData.discordLink,
          skillsKnown: userData.skillsKnown || [],
          skillsToLearn: userData.skillsToLearn || [],
          rating: userData.rating
        },
        { upsert: true, new: true }
      );
      
      return res.status(200).json({ success: true, data: user });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Users API error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false,
        error: `${field} already exists`,
        details: error.message
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: error.message
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
