
#!/bin/bash
set -e

echo "🚀 Starting Odesa Holiday Postcards App..."

# Wait for MongoDB
echo "⏳ Waiting for MongoDB..."
until mongosh --host mongodb:27017 --username admin --password password --authenticationDatabase admin --eval "print('MongoDB is ready')" > /dev/null 2>&1; do
  echo "MongoDB is unavailable - sleeping"
  sleep 2
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
