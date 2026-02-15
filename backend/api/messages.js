import connectDB from '../lib/mongodb.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    if (req.method === 'POST') {
      // Send message
      const m = req.body || {};
      const timestamp = m.timestamp || Date.now();

      const message = new Message({
        id: m.id || crypto.randomUUID(),
        senderId: m.senderId,
        receiverId: m.receiverId,
        content: m.content,
        timestamp,
        read: m.read || false,
      });

      await message.save();

      res.status(201).json({
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        timestamp: message.timestamp,
        read: message.read,
      });

    } else if (req.method === 'GET') {
      const { user1Id, user2Id, userId } = req.query;

      if (user1Id && user2Id) {
        // Get conversation
        const messages = await Message.find({
          $or: [
            { senderId: user1Id, receiverId: user2Id },
            { senderId: user2Id, receiverId: user1Id }
          ]
        }).sort({ timestamp: 1 });

        const mapped = messages.map((row) => ({
          id: row.id,
          senderId: row.senderId,
          receiverId: row.receiverId,
          content: row.content,
          timestamp: row.timestamp,
          read: row.read,
        }));

        res.json(mapped);

      } else if (userId) {
        // Get unread count
        const count = await Message.countDocuments({
          receiverId: userId,
          read: false
        });
        
        res.json({ count });

      } else {
        return res.status(400).json({ error: 'userId query param required' });
      }
    }

  } catch (error) {
    console.error('Messages API error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Message operation failed',
      details: error.message
    });
  }
}
