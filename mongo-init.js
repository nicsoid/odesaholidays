
// MongoDB initialization script
db = db.getSiblingDB('odesa-holiday');

// Create a user for the application
db.createUser({
  user: "app",
  pwd: "password123",
  roles: [
    {
      role: "readWrite",
      db: "odesa-holiday"
    }
  ]
});

// Create initial collections
db.createCollection("users");
db.createCollection("postcards");
db.createCollection("templates");
db.createCollection("events");
db.createCollection("locations");
db.createCollection("orders");
db.createCollection("subscriptionPlans");
db.createCollection("userPreferences");
db.createCollection("userStats");
db.createCollection("userAchievements");
db.createCollection("socialMediaPreviews");
db.createCollection("travelStories");
db.createCollection("storyPreferences");

print('Database initialized successfully');
