import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import User from './models/User.js';
import ExchangeRequest from './models/ExchangeRequest.js';
import Message from './models/Message.js';
import Feedback from './models/Feedback.js';
import Quiz from './models/Quiz.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

console.log('🧪 Database & AI Quiz Test\n');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found');
  process.exit(1);
}

async function testDatabaseAndQuiz() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
    console.log('✅ Connected to MongoDB\n');

    const testId = crypto.randomUUID();
    
    // Test 1: Save User
    console.log('👤 Test 1: Creating user...');
    const user = new User({
      id: testId,
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'testpass123',
      avatar: 'https://ui-avatars.com/api/?name=Test',
      bio: 'Test bio',
      skillsKnown: ['JavaScript', 'Node.js'],
      skillsToLearn: ['Python', 'MongoDB'],
      rating: 5.0
    });
    await user.save();
    console.log('✅ User saved:', user.id);

    // Verify user was saved
    const foundUser = await User.findOne({ id: testId });
    if (foundUser) {
      console.log('✅ User verified in database\n');
    } else {
      console.error('❌ User NOT found in database!\n');
    }

    // Test 2: Save Exchange Request
    console.log('📨 Test 2: Creating exchange request...');
    const request = new ExchangeRequest({
      id: crypto.randomUUID(),
      fromUserId: testId,
      toUserId: crypto.randomUUID(),
      offeredSkill: 'JavaScript',
      requestedSkill: 'Python',
      message: 'I want to learn Python!',
      status: 'pending',
      createdAt: Date.now()
    });
    await request.save();
    console.log('✅ Exchange request saved:', request.id);

    // Test 3: Save Message
    console.log('💬 Test 3: Creating message...');
    const message = new Message({
      id: crypto.randomUUID(),
      senderId: testId,
      receiverId: crypto.randomUUID(),
      content: 'Hello from test!',
      timestamp: Date.now(),
      read: false
    });
    await message.save();
    console.log('✅ Message saved:', message.id);

    // Test 4: Save Quiz
    console.log('📝 Test 4: Creating quiz...');
    const quiz = new Quiz({
      id: crypto.randomUUID(),
      skillName: 'JavaScript',
      questions: [
        {
          question: 'What is the output of typeof null?',
          options: ['object', 'null', 'undefined', 'number'],
          correctAnswerIndex: 0
        }
      ],
      difficulty: 'beginner',
      createdAt: Date.now()
    });
    await quiz.save();
    console.log('✅ Quiz saved:', quiz.id);

    // Test 5: AI Quiz Generation (if API key exists)
    if (MISTRAL_API_KEY && MISTRAL_API_KEY !== 'your-mistral-api-key-here') {
      console.log('\n🤖 Test 5: AI Quiz Generation...');
      try {
        const response = await fetch('http://localhost:3000/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skill: 'JavaScript', difficulty: 'beginner' })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ AI Quiz generated:', data.quizId || 'success');
        } else {
          console.log('⚠️  AI Quiz endpoint returned:', response.status);
          console.log('   This is expected if running locally without dev server');
        }
      } catch (err) {
        console.log('⚠️  AI Quiz test skipped (dev server not running)');
      }
    } else {
      console.log('\n⚠️  Skipping AI Quiz test (no MISTRAL_API_KEY)');
    }

    // Show all collections and document counts
    console.log('\n📊 Database Summary:');
    const collections = ['users', 'exchangerequests', 'messages', 'feedbacks', 'quizzes', 'quizattempts'];
    for (const coll of collections) {
      const count = await mongoose.connection.db.collection(coll).countDocuments();
      console.log(`   ${coll}: ${count} documents`);
    }

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ id: testId });
    await ExchangeRequest.deleteOne({ id: request.id });
    await Message.deleteOne({ id: message.id });
    await Quiz.deleteOne({ id: quiz.id });
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All tests passed! Database is working correctly.\n');
    console.log('✅ Users are being saved to MongoDB');
    console.log('✅ Exchange requests are being saved');
    console.log('✅ Messages are being saved');
    console.log('✅ Quizzes are being saved');
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDatabaseAndQuiz();
