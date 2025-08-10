import { z } from "zod";

// User preferences schema for AI recommendations
export const userPreferencesSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  interests: z.array(z.string()),
  travelStyle: z.string(),
  preferredActivities: z.array(z.string()),
  timeOfYear: z.string(),
  groupSize: z.string(),
  postcardPurpose: z.array(z.string()),
  timePreference: z.string(),
  completedOnboarding: z.boolean().default(false),
  onboardingProgress: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Gamification schema
export const userAchievementSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  achievementId: z.string(),
  achievementName: z.string(),
  description: z.string(),
  icon: z.string(),
  points: z.number(),
  unlockedAt: z.date().default(() => new Date()),
});

export const userStatsSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  level: z.number().default(1),
  totalPoints: z.number().default(0),
  postcardsCreated: z.number().default(0),
  postcardsSent: z.number().default(0),
  landmarksVisited: z.array(z.string()).default([]),
  streakDays: z.number().default(0),
  lastActivityDate: z.date().optional(),
  badges: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Social media preview schema
export const socialMediaPreviewSchema = z.object({
  _id: z.string().optional(),
  postcardId: z.string(),
  platform: z.enum(['instagram', 'twitter', 'facebook']),
  caption: z.string(),
  hashtags: z.array(z.string()),
  generatedAt: z.date().default(() => new Date()),
});

// Insert schemas
export const insertUserPreferencesSchema = userPreferencesSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserAchievementSchema = userAchievementSchema.omit({
  _id: true,
  unlockedAt: true,
});

export const insertUserStatsSchema = userStatsSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialMediaPreviewSchema = socialMediaPreviewSchema.omit({
  _id: true,
  generatedAt: true,
});

// Type exports
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type UserAchievement = z.infer<typeof userAchievementSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type UserStats = z.infer<typeof userStatsSchema>;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

export type SocialMediaPreview = z.infer<typeof socialMediaPreviewSchema>;
export type InsertSocialMediaPreview = z.infer<typeof insertSocialMediaPreviewSchema>;

// Onboarding question interface
export interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'single_choice' | 'text';
  options?: string[];
  category: string;
}

// Achievement definitions
export const achievementDefinitions = [
  {
    id: 'first_postcard',
    name: 'First Steps',
    description: 'Created your first postcard',
    icon: '🎯',
    points: 10,
    condition: 'postcardsCreated >= 1'
  },
  {
    id: 'social_sharer',
    name: 'Social Butterfly',
    description: 'Shared 5 postcards on social media',
    icon: '📱',
    points: 25,
    condition: 'socialShares >= 5'
  },
  {
    id: 'explorer',
    name: 'Odesa Explorer',
    description: 'Visited 10 different landmarks',
    icon: '🗺️',
    points: 50,
    condition: 'landmarksVisited.length >= 10'
  },
  {
    id: 'weekly_streak',
    name: 'Weekly Warrior',
    description: 'Created postcards for 7 days in a row',
    icon: '🔥',
    points: 75,
    condition: 'streakDays >= 7'
  },
  {
    id: 'collector',
    name: 'Postcard Collector',
    description: 'Created 25 postcards',
    icon: '📮',
    points: 100,
    condition: 'postcardsCreated >= 25'
  },
  {
    id: 'ambassador',
    name: 'Odesa Ambassador',
    description: 'Sent 50 physical postcards',
    icon: '👑',
    points: 200,
    condition: 'postcardsSent >= 50'
  }
];