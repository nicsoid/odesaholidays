import { z } from "zod";

// User schema for MongoDB with email authentication
export const userSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email(),
  passwordHash: z.string(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  isEmailVerified: z.boolean().default(false),
  stripeCustomerId: z.string().optional(),
  referralCode: z.string().optional(),
  referredBy: z.string().optional(),
  credits: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Postcard schema
export const postcardSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  templateId: z.string(),
  title: z.string(),
  message: z.string(),
  customImageUrl: z.string().optional(),
  fontFamily: z.string().default("Inter"),
  backgroundColor: z.string().default("#FFFFFF"),
  textColor: z.string().default("#000000"),
  isPublic: z.boolean().default(false),
  downloadCount: z.number().default(0),
  shareCount: z.number().default(0),
  eventId: z.string().optional(),
  locationId: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Event schema
export const eventSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  locationId: z.string().optional(),
  organizer: z.string(),
  category: z.string(),
  ticketUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  createdBy: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Location schema
export const locationSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  address: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  imageUrl: z.string().optional(),
  category: z.string(),
  isPopular: z.boolean().default(false),
  createdBy: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Template schema
export const templateSchema = z.object({
  _id: z.string().optional(),
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string(),
  category: z.string(),
  isPremium: z.boolean().default(false),
  usageCount: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
});

// Order schema
export const orderSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  postcardId: z.string(),
  stripePaymentIntentId: z.string().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalAmount: z.number(),
  shippingAddress: z.string(),
  status: z.string().default("pending"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Auth schemas for login/register
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().optional(),
});

// Insert schemas (for creating new documents)
export const insertUserSchema = userSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
  isEmailVerified: true,
  stripeCustomerId: true,
  referralCode: true,
  credits: true,
}).extend({
  password: z.string().min(6),
});

export const insertPostcardSchema = postcardSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  downloadCount: true,
  shareCount: true,
});

export const insertEventSchema = eventSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationSchema = locationSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = templateSchema.omit({
  _id: true,
  createdAt: true,
  usageCount: true,
});

export const insertOrderSchema = orderSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  stripePaymentIntentId: true,
  status: true,
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

export type Postcard = z.infer<typeof postcardSchema>;
export type InsertPostcard = z.infer<typeof insertPostcardSchema>;

export type Event = z.infer<typeof eventSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Location = z.infer<typeof locationSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Template = z.infer<typeof templateSchema>;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;