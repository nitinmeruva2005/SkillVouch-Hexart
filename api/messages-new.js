import connectDB from '../lib/mongodb.js';
import Message from '../models/Message.js';
import { authMiddleware } from '../lib/auth.js';
import crypto from 'crypto';

// Send message
async function sendMessage(req, res) {
  try {
    await connectDB();
    const { receiverId, content } = req.body || {};

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, error: 'Receiver ID and content are required' });
    }

    const message = new Message({
      id: crypto.randomUUID(),
      senderId: req.userId,
      receiverId,
      content: content.trim(),
      timestamp: Date.now(),
      read: false
    });

    await message.save();

    return res.status(201).json({
      success: true,
      message: {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        timestamp: message.timestamp,
        read: message.read
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Get messages for user
async function getMessages(req, res) {
  try {
    await connectDB();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Get conversation between logged-in user and specified user
    const messages = await Message.find({
      $or: [
        { senderId: req.userId, receiverId: userId },
        { senderId: userId, receiverId: req.userId }
      ]
    }).sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      messages: messages.map(m => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        content: m.content,
        timestamp: m.timestamp,
        read: m.read
      }))
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Get unread count
async function getUnreadCount(req, res) {
  try {
    await connectDB();

    const count = await Message.countDocuments({
      receiverId: req.userId,
      read: false
    });

    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Mark messages as read
async function markAsRead(req, res) {
  try {
    await connectDB();
    const { senderId } = req.body || {};

    if (!senderId) {
      return res.status(400).json({ success: false, error: 'Sender ID is required' });
    }

    await Message.updateMany(
      { senderId, receiverId: req.userId, read: false },
      { read: true }
    );

    return res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Get conversation list
async function getConversations(req, res) {
  try {
    await connectDB();

    // Find all unique users the current user has messaged with
    const messages = await Message.find({
      $or: [{ senderId: req.userId }, { receiverId: req.userId }]
    });

    const partnerIds = [...new Set(
      messages.map(m => m.senderId === req.userId ? m.receiverId : m.senderId)
    )];

    return res.status(200).json({ success: true, conversations: partnerIds });
  } catch (error) {
    console.error('Get conversations error:', error);
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

  if (pathname === '/api/messages/send' && req.method === 'POST') {
    return authMiddleware(sendMessage)(req, res);
  }

  if (pathname === '/api/messages' && req.method === 'GET') {
    return authMiddleware(getMessages)(req, res);
  }

  if (pathname === '/api/messages/unread' && req.method === 'GET') {
    return authMiddleware(getUnreadCount)(req, res);
  }

  if (pathname === '/api/messages/read' && req.method === 'POST') {
    return authMiddleware(markAsRead)(req, res);
  }

  if (pathname === '/api/messages/conversations' && req.method === 'GET') {
    return authMiddleware(getConversations)(req, res);
  }

  return res.status(404).json({ success: false, error: 'Endpoint not found' });
}
