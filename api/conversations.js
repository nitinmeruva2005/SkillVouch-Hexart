import connectDB from '../lib/mongodb.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

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
    await connectDB();

    if (req.method === 'GET') {
      const userId = req.query.userId;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId query param required' });
      }

      // Get distinct conversation partners
      const messages = await Message.find({
        $or: [{ senderId: userId }, { receiverId: userId }]
      });

      const partnerIds = [...new Set(
        messages.map(m => m.senderId === userId ? m.receiverId : m.senderId)
      )];

      if (partnerIds.length === 0) {
        return res.json([]);
      }

      // Get user details for partners
      const users = await User.find({ id: { $in: partnerIds } });

      const mapped = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || '',
        discordLink: user.discordLink || undefined,
        skillsKnown: user.skillsKnown || [],
        skillsToLearn: user.skillsToLearn || [],
        rating: user.rating || 0,
      }));

      res.json(mapped);
    }

  } catch (error) {
    console.error('Conversations API error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch conversations',
      details: error.message
    });
  }
}
