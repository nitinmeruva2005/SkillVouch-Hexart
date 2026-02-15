import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Import API routes
import authHandler from './api/auth.js';
import meHandler from './api/me.js';
import usersHandler from './api/users.js';
import messagesHandler from './api/messages.js';
import conversationsHandler from './api/conversations.js';
import requestsHandler from './api/requests.js';
import feedbackHandler from './api/feedback.js';
import quizHandler from './api/quiz.js';
import aiHandler from './api/ai.js';
import healthHandler from './api/health.js';

// API Routes - Direct mapping
app.post('/api/auth/signup', (req, res) => authHandler(req, res));
app.post('/api/auth/login', (req, res) => authHandler(req, res));
app.get('/api/me', (req, res) => meHandler(req, res));
app.put('/api/me', (req, res) => meHandler(req, res));
app.get('/api/users', (req, res) => usersHandler(req, res));
app.put('/api/users', (req, res) => usersHandler(req, res));
app.get('/api/messages', (req, res) => messagesHandler(req, res));
app.post('/api/messages', (req, res) => messagesHandler(req, res));
app.get('/api/conversations', (req, res) => conversationsHandler(req, res));
app.get('/api/requests', (req, res) => requestsHandler(req, res));
app.post('/api/requests', (req, res) => requestsHandler(req, res));
app.get('/api/feedback', (req, res) => feedbackHandler(req, res));
app.post('/api/feedback', (req, res) => feedbackHandler(req, res));
app.get('/api/quiz', (req, res) => quizHandler(req, res));
app.post('/api/quiz/generate', (req, res) => quizHandler(req, res));
app.post('/api/ai/roadmap', (req, res) => aiHandler(req, res));
app.post('/api/ai/chat', (req, res) => aiHandler(req, res));
app.get('/api/ai/chat-history', (req, res) => aiHandler(req, res));
app.get('/api/health', (req, res) => healthHandler(req, res));

// Serve static files for frontend (if needed)
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// Catch-all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB URI: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🤖 Mistral API: ${process.env.MISTRAL_API_KEY ? '✅ Configured' : '❌ Missing'}`);
});

export default app;
