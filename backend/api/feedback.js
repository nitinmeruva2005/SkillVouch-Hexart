import connectDB from '../lib/mongodb.js';
import Feedback from '../models/Feedback.js';
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
      // Submit feedback
      const f = req.body || {};
      const stars = Number(f.stars);
      
      if (!f.requestId || !f.fromUserId || !f.toUserId) {
        return res.status(400).json({ error: 'requestId, fromUserId, and toUserId are required' });
      }
      
      if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
        return res.status(400).json({ error: 'stars must be between 1 and 5' });
      }

      const createdAt = f.createdAt || Date.now();

      // Upsert feedback
      const feedback = await Feedback.findOneAndUpdate(
        { requestId: f.requestId, fromUserId: f.fromUserId },
        {
          id: f.id || crypto.randomUUID(),
          requestId: f.requestId,
          fromUserId: f.fromUserId,
          toUserId: f.toUserId,
          stars,
          comment: f.comment || null,
          createdAt,
        },
        { upsert: true, new: true }
      );

      // Update user rating
      const avgResult = await Feedback.aggregate([
        { $match: { toUserId: f.toUserId } },
        { $group: { _id: null, avgStars: { $avg: '$stars' } } }
      ]);
      
      const avgStars = avgResult.length > 0 ? avgResult[0].avgStars : 0;
      await User.findOneAndUpdate(
        { id: f.toUserId },
        { rating: avgStars }
      );

      res.status(201).json({ 
        id: feedback.id, 
        requestId: feedback.requestId, 
        fromUserId: feedback.fromUserId, 
        toUserId: feedback.toUserId, 
        stars: feedback.stars, 
        comment: feedback.comment || undefined, 
        createdAt: feedback.createdAt 
      });

    } else if (req.method === 'GET') {
      const userId = req.query.userId;
      const type = req.query.type;

      if (!userId) {
        return res.status(400).json({ error: 'userId query param required' });
      }

      if (type === 'received') {
        // Get received feedback
        const feedbacks = await Feedback.find({ toUserId: userId })
          .sort({ createdAt: -1 });

        const mapped = feedbacks.map((row) => ({
          id: row.id,
          requestId: row.requestId,
          fromUserId: row.fromUserId,
          toUserId: row.toUserId,
          stars: row.stars,
          comment: row.comment || undefined,
          createdAt: row.createdAt,
        }));

        res.json(mapped);

      } else if (type === 'stats') {
        // Get feedback stats
        const stats = await Feedback.aggregate([
          { $match: { toUserId: userId } },
          { 
            $group: { 
              _id: null, 
              avgStars: { $avg: '$stars' },
              count: { $sum: 1 }
            } 
          }
        ]);
        
        const avgStars = stats.length > 0 ? stats[0].avgStars : 0;
        const count = stats.length > 0 ? stats[0].count : 0;
        
        res.json({ avgStars, count });
      }
    }

  } catch (error) {
    console.error('Feedback API error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Feedback operation failed',
      details: error.message
    });
  }
}
