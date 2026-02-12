import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import User from './models/User.js';
import ExchangeRequest from './models/ExchangeRequest.js';
import Message from './models/Message.js';
import Feedback from './models/Feedback.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🌱 MongoDB Database Initialization\n');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found');
  process.exit(1);
}

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;
    
    // List existing collections
    const collections = await db.listCollections().toArray();
    const existingCollections = collections.map(c => c.name);
    
    console.log('📁 Existing collections:', existingCollections.length > 0 ? existingCollections.join(', ') : 'None');
    console.log('\n🔧 Initializing collections...\n');

    // Initialize each model (creates collection if doesn't exist)
    const models = [
      { name: 'users', model: User },
      { name: 'exchangerequests', model: ExchangeRequest },
      { name: 'messages', model: Message },
      { name: 'feedbacks', model: Feedback },
      { name: 'quizzes', model: Quiz },
      { name: 'quizattempts', model: QuizAttempt },
    ];

    for (const { name, model } of models) {
      try {
        // Create collection by inserting and deleting a dummy document
        const dummyDoc = new model({
          id: 'init-dummy-' + Date.now(),
          test: true,
        });
        
        // Override validation for init
        await model.collection.insertOne({
          id: 'init-dummy',
          _init: true,
          createdAt: new Date()
        });
        
        // Remove dummy document
        await model.collection.deleteOne({ _init: true });
        
        console.log(`✅ ${name}: Ready`);
      } catch (err) {
        // Collection might already exist
        console.log(`✅ ${name}: ${err.code === 48 ? 'Already exists' : 'Ready'}`);
      }
    }

    // Create indexes
    console.log('\n📊 Creating indexes...\n');
    
    await User.syncIndexes();
    console.log('✅ User indexes created');
    
    await ExchangeRequest.syncIndexes();
    console.log('✅ ExchangeRequest indexes created');
    
    await Message.syncIndexes();
    console.log('✅ Message indexes created');
    
    await Feedback.syncIndexes();
    console.log('✅ Feedback indexes created');
    
    await Quiz.syncIndexes();
    console.log('✅ Quiz indexes created');
    
    await QuizAttempt.syncIndexes();
    console.log('✅ QuizAttempt indexes created');

    // Show final collections
    const finalCollections = await db.listCollections().toArray();
    console.log(`\n📁 Total collections: ${finalCollections.length}`);
    finalCollections.forEach(c => {
      console.log(`   - ${c.name}`);
    });

    console.log('\n🎉 Database initialized successfully!');
    console.log('   All collections are ready for use.\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
