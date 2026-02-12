import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🧪 MongoDB Connection Test\n');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.log('\nPlease create a .env file with:');
  console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillvouch?retryWrites=true&w=majority');
  process.exit(1);
}

console.log('✅ MONGODB_URI found');
console.log(`🔗 Connection string: ${MONGODB_URI.replace(/:([^@]+)@/, ':****@')}\n`);

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully!\n');
    
    // Test database info
    const db = mongoose.connection.db;
    const adminDb = db.admin();
    const serverInfo = await adminDb.serverInfo();
    
    console.log('📊 Server Info:');
    console.log(`   Version: ${serverInfo.version}`);
    console.log(`   Database: ${db.databaseName}`);
    console.log(`   Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Collections (${collections.length}):`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Test creating a document
    console.log('\n📝 Testing document creation...');
    const TestSchema = new mongoose.Schema({
      test: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.models.Test || mongoose.model('Test', TestSchema);
    
    const testDoc = await TestModel.create({
      test: 'Connection test successful'
    });
    
    console.log(`✅ Test document created: ${testDoc._id}`);
    
    // Clean up
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🗑️  Test document cleaned up\n');
    
    console.log('🎉 All tests passed! MongoDB is ready for deployment.\n');
    
    await mongoose.disconnect();
    console.log('🔌 Connection closed');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ MongoDB connection failed:\n');
    console.error(error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Check your connection string and network access in MongoDB Atlas.');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Check your username and password in the connection string.');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 The cluster URL might be incorrect.');
    }
    
    process.exit(1);
  }
}

testConnection();
