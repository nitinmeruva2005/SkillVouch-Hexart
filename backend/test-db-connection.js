import { query } from './db.js';

console.log('🔍 Testing Database Connection...');
console.log('Environment Variables:');
console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
console.log('MYSQL_USER:', process.env.MYSQL_USER);
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '***SET***' : 'NOT SET');

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n📋 Testing basic connection...');
    const result = await query('SELECT 1 as test');
    console.log('✅ Basic connection successful:', result);

    // Test database exists
    console.log('\n📋 Testing database access...');
    const dbResult = await query('SELECT DATABASE() as current_db');
    console.log('✅ Current database:', dbResult[0].current_db);

    // Test tables exist
    console.log('\n📋 Testing table access...');
    const tables = await query('SHOW TABLES');
    console.log('✅ Available tables:', tables.map(t => Object.values(t)[0]));

    // Test users table specifically
    console.log('\n📋 Testing users table...');
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Users table count:', userCount[0].count);

    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Error Number:', error.errno);
    
    // Provide specific fixes based on error
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Fix: Check if Railway database is running');
      console.log('Go to Railway dashboard and ensure MySQL is not paused');
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Fix: Check username/password');
      console.log('Verify MYSQL_USER and MYSQL_PASSWORD are correct');
    }
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n🔧 Fix: Database not found');
      console.log('Check if MYSQL_DATABASE name is correct');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Fix: Host not found');
      console.log('Check MYSQL_HOST - should be containers.railway.app');
    }
  }
}

testConnection();
