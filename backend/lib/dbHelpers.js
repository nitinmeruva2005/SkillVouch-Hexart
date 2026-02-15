import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import Message from '../models/Message.js';
import Feedback from '../models/Feedback.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import crypto from 'crypto';

// CORS headers helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export { connectDB, User, ExchangeRequest, Message, Feedback, Quiz, QuizAttempt, crypto, setCorsHeaders };
