import connectDB from '../lib/mongodb.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    if (req.method === 'POST') {
      // Create exchange request
      const r = req.body || {};
      
      const request = new ExchangeRequest({
        id: r.id || crypto.randomUUID(),
        fromUserId: r.fromUserId,
        toUserId: r.toUserId,
        offeredSkill: r.offeredSkill,
        requestedSkill: r.requestedSkill,
        message: r.message,
        status: r.status || 'pending',
        createdAt: r.createdAt || Date.now(),
        completedAt: r.completedAt || null,
      });

      await request.save();

      res.status(201).json({ success: true });

    } else if (req.method === 'GET') {
      // Get requests for user
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: 'userId query param required' });
      }

      const requests = await ExchangeRequest.find({
        $or: [{ fromUserId: userId }, { toUserId: userId }]
      }).sort({ createdAt: -1 });

      const mapped = requests.map((row) => ({
        id: row.id,
        fromUserId: row.fromUserId,
        toUserId: row.toUserId,
        offeredSkill: row.offeredSkill,
        requestedSkill: row.requestedSkill,
        message: row.message,
        status: row.status,
        createdAt: row.createdAt,
        completedAt: row.completedAt || undefined,
      }));

      res.json(mapped);
    }

  } catch (error) {
    console.error('Requests API error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Request operation failed',
      details: error.message
    });
  }
}
