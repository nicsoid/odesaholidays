
#!/bin/bash
set -e

echo "🚀 Starting Odesa Holiday Postcards App..."

# Wait for MongoDB
echo "⏳ Waiting for MongoDB..."
until node -e "
import { MongoClient } from 'mongodb';
const client = new MongoClient('mongodb://admin:password@mongodb:27017/odesa-holiday?authSource=admin');
client.connect().then(() => {
  return client.db().admin().ping();
}).then(() => {
  console.log('MongoDB is ready');
  client.close();
  process.exit(0);
}).catch(() => {
  process.exit(1);
});
" > /dev/null 2>&1; do
  echo "MongoDB is unavailable - sleeping"
  sleep 3
done
echo "✅ MongoDB is ready!"

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U postgres > /dev/null 2>&1; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Run database migrations if needed
echo "🔧 Running database setup..."
node docker-healthcheck.js

echo "🎯 Starting the application..."
exec npm start
