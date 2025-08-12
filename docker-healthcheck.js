
import { MongoClient } from 'mongodb';
import pg from 'pg';
const { Client } = pg;

async function checkDatabases() {
  let mongoConnected = false;
  let postgresConnected = false;

  // Check MongoDB
  try {
    const mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    await mongoClient.db().admin().ping();
    mongoConnected = true;
    await mongoClient.close();
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
  }

  // Check PostgreSQL
  try {
    const pgClient = new Client({
      connectionString: process.env.DATABASE_URL
    });
    await pgClient.connect();
    await pgClient.query('SELECT 1');
    postgresConnected = true;
    await pgClient.end();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.log('❌ PostgreSQL connection failed:', error.message);
  }

  if (mongoConnected && postgresConnected) {
    console.log('🎉 All databases are ready!');
    process.exit(0);
  } else {
    console.log('⏳ Waiting for databases...');
    process.exit(1);
  }
}

checkDatabases();
