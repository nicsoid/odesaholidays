import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username"),
  stripeCustomerId: text("stripe_customer_id"),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by"),
  credits: decimal("credits", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postcards = pgTable("postcards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  templateId: text("template_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  customImageUrl: text("custom_image_url"),
  fontFamily: text("font_family").default("Inter"),
  backgroundColor: text("background_color").default("#FFFFFF"),
  textColor: text("text_color").default("#000000"),
  isPublic: boolean("is_public").default(false),
  downloadCount: integer("download_count").default(0),
  shareCount: integer("share_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  postcardId: integer("postcard_id").references(() => postcards.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  isPremium: boolean("is_premium").default(false),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  postcardId: integer("postcard_id").references(() => postcards.id),
  eventType: text("event_type").notNull(), // 'view', 'download', 'share', 'print_order'
  platform: text("platform"), // 'instagram', 'facebook', 'twitter', 'email'
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true),
  source: text("source"), // 'homepage', 'checkout', 'creator'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  stripeCustomerId: true,
  referralCode: true,
  credits: true,
});

export const insertPostcardSchema = createInsertSchema(postcards).omit({
  id: true,
  createdAt: true,
  downloadCount: true,
  shareCount: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  stripePaymentIntentId: true,
  status: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  createdAt: true,
  usageCount: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Postcard = typeof postcards.$inferSelect;
export type InsertPostcard = z.infer<typeof insertPostcardSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
