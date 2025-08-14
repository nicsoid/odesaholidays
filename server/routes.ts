import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { mongoStorage } from "./mongodb-storage";
import { authenticateToken, optionalAuth } from "./auth-middleware";
import { insertUserSchema, insertPostcardSchema, insertOrderSchema, insertAnalyticsSchema, insertNewsletterSubscriberSchema } from "@shared/schema";
import { loginSchema, registerSchema, insertSubscriptionPlanSchema } from "../shared/mongodb-schema";
import { insertUserPreferencesSchema, achievementDefinitions } from "../shared/onboarding-schema";
import { aiService } from "./ai-service";
import { aiStoryService } from "./ai-story-service";
import { z } from "zod";

// Initialize Stripe only if keys are available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const { user, token } = await mongoStorage.registerUser(userData);
      res.status(201).json({ user: { ...user, passwordHash: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const { user, token } = await mongoStorage.loginUser(credentials);
      res.json({ user: { ...user, passwordHash: undefined }, token });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({ user: { ...req.user, passwordHash: undefined } });
  });

  app.post("/api/auth/logout", async (req, res) => {
    // Since we're using JWT tokens, we just need to respond successfully
    // The client will clear the token from localStorage
    res.json({ message: "Logged out successfully" });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const result = await mongoStorage.requestPasswordReset(email);
      res.json({ message: "Password reset email sent if account exists" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      const result = await mongoStorage.resetPassword(token, password);
      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const { category, locationId } = req.query;
      const filters: any = {};
      if (category) filters.category = category as string;
      if (locationId) filters.locationId = locationId as string;
      
      const events = await mongoStorage.getEvents(filters);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const { limit } = req.query;
      const events = await mongoStorage.getUpcomingEvents(limit ? parseInt(limit as string) : 10);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/events", authenticateToken, async (req: any, res) => {
    try {
      const eventData = { ...req.body, createdBy: req.user._id };
      const event = await mongoStorage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Locations routes
  app.get("/api/locations", async (req, res) => {
    try {
      const { category } = req.query;
      const filters: any = {};
      if (category) filters.category = category as string;
      
      const locations = await mongoStorage.getLocations(filters);
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/locations/popular", async (req, res) => {
    try {
      const { limit } = req.query;
      const locations = await mongoStorage.getPopularLocations(limit ? parseInt(limit as string) : 10);
      res.json(locations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/locations", authenticateToken, async (req: any, res) => {
    try {
      const locationData = { ...req.body, createdBy: req.user._id };
      const location = await mongoStorage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Templates
  app.get("/api/templates", async (req, res) => {
    try {
      const { category } = req.query;
      const templates = await storage.getTemplates(category as string);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes
  app.post("/api/admin/templates", authenticateToken, async (req: any, res) => {
    try {
      // Check if user is admin (for demo, checking if email contains "admin" or specific user ID)
      const isAdmin = req.user.email?.includes("admin") || req.user._id === "6839cd39c5de6bc3b492e772";
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const template = await mongoStorage.createTemplate(req.body);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", authenticateToken, async (req: any, res) => {
    try {
      const isAdmin = req.user.email?.includes("admin") || req.user._id === "6839cd39c5de6bc3b492e772";
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get actual stats from database
      const stats = await mongoStorage.getAdminStats();

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", authenticateToken, async (req: any, res) => {
    try {
      const isAdmin = req.user.email === "admin@odesa.holiday";
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await mongoStorage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:email", authenticateToken, async (req: any, res) => {
    try {
      const isAdmin = req.user.email === "admin@odesa.holiday";
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { email } = req.params;
      await mongoStorage.deleteUserByEmail(email);
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/users/:id/credits", authenticateToken, async (req: any, res) => {
    try {
      const isAdmin = req.user.email === "admin@odesa.holiday";
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { credits } = req.body;
      await mongoStorage.updateUserCredits(id, credits);
      res.json({ message: "Credits updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Postcards
  app.post("/api/postcards", async (req, res) => {
    try {
      const validatedData = insertPostcardSchema.parse(req.body);
      const postcard = await storage.createPostcard(validatedData);
      
      // Track usage
      if (validatedData.templateId) {
        await storage.updateTemplateUsage(validatedData.templateId);
      }
      
      res.json(postcard);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/postcards/:id", async (req, res) => {
    try {
      const postcard = await storage.getPostcard(parseInt(req.params.id));
      if (!postcard) {
        return res.status(404).json({ message: "Postcard not found" });
      }
      res.json(postcard);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/postcards/user/:userId", async (req, res) => {
    try {
      const postcards = await storage.getPostcardsByUser(parseInt(req.params.userId));
      res.json(postcards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's postcards (authenticated route)
  app.get("/api/postcards/user", authenticateToken, async (req: any, res) => {
    try {
      const postcards = await mongoStorage.getUserPostcards(req.user._id);
      res.json(postcards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/postcards/public/gallery", async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      const postcards = await storage.getPublicPostcards(parseInt(limit as string));
      res.json(postcards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/postcards/:id/download", async (req, res) => {
    try {
      const postcardId = parseInt(req.params.id);
      await storage.updatePostcardStats(postcardId, 'download');
      
      // Track analytics
      if (req.body.userId) {
        await storage.trackEvent({
          userId: req.body.userId,
          postcardId,
          eventType: 'download',
          platform: null,
        });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/postcards/:id/share", async (req, res) => {
    try {
      const postcardId = parseInt(req.params.id);
      const { platform, userId } = req.body;
      
      await storage.updatePostcardStats(postcardId, 'share');
      
      // Track analytics
      if (userId) {
        await storage.trackEvent({
          userId,
          postcardId,
          eventType: 'share',
          platform,
        });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.json(existingUser);
      }
      
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment route for one-time payments (physical postcards)
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        message: "Payment processing is currently unavailable. Please contact support.",
        error: "STRIPE_NOT_CONFIGURED"
      });
    }

    try {
      const { amount, orderId } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          orderId: orderId?.toString() || '',
        },
      });
      
      if (orderId) {
        await storage.updateOrderStatus(orderId, "processing", paymentIntent.id);
      }
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.json(order);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const orders = await storage.getOrdersByUser(parseInt(req.params.userId));
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's orders (authenticated route)
  app.get("/api/orders/user", authenticateToken, async (req: any, res) => {
    try {
      const orders = await mongoStorage.getUserOrders(req.user._id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analytics
  app.get("/api/analytics/user/:userId", async (req, res) => {
    try {
      const analytics = await storage.getUserAnalytics(parseInt(req.params.userId));
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's analytics (authenticated route)
  app.get("/api/analytics/user", authenticateToken, async (req: any, res) => {
    try {
      const analytics = await mongoStorage.getUserAnalytics(req.user._id);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's detailed statistics (authenticated route)
  app.get("/api/analytics/user/detailed", authenticateToken, async (req: any, res) => {
    try {
      const stats = await mongoStorage.getUserDetailedStats(req.user._id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/popular-templates", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const templates = await storage.getPopularTemplates(parseInt(limit as string));
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Newsletter
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriberSchema.parse(req.body);
      const existing = await storage.getNewsletterSubscriber(validatedData.email);
      
      if (existing) {
        return res.json({ message: "Already subscribed", subscriber: existing });
      }
      
      const subscriber = await storage.subscribeToNewsletter(validatedData);
      res.json({ message: "Successfully subscribed", subscriber });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes - protected by admin middleware
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check if user is admin (only admin@odesa.holiday)
    const user = req.user;
    const userEmail = user.email;
    
    if (userEmail !== 'admin@odesa.holiday') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Admin statistics
  app.get("/api/admin/stats", authenticateToken, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin user management
  app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user credits
  app.put("/api/admin/users/:userId/credits", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { credits } = req.body;
      
      if (typeof credits !== 'number' || credits < 0) {
        return res.status(400).json({ message: "Invalid credits value" });
      }

      const result = await storage.updateUserCredits(userId, credits);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin analytics and stats
  app.get("/api/admin/stats", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const stats = await mongoStorage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics/monthly", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const { months = 12 } = req.query;
      const analytics = await mongoStorage.getMonthlyAnalytics(parseInt(months as string));
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const users = await mongoStorage.getUsers({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string
      });
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin template management with file upload support
  app.post("/api/admin/templates", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const templateData = insertTemplateSchema.parse({
        ...req.body,
        uploadedBy: req.user._id
      });
      const template = await mongoStorage.createTemplate(templateData);
      res.json(template);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/templates/:templateId", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const { templateId } = req.params;
      const templateData = insertTemplateSchema.partial().parse(req.body);
      const template = await mongoStorage.updateTemplate(templateId, templateData);
      res.json(template);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/templates/:templateId", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { templateId } = req.params;
      await mongoStorage.deleteTemplate(templateId);
      res.json({ message: "Template deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/templates", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { page = 1, limit = 20, category, search } = req.query;
      const templates = await mongoStorage.getTemplatesAdmin({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        category: category as string,
        search: search as string
      });
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin image upload endpoint
  app.post("/api/admin/upload-image", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const { fileName, fileData, fileSize, mimeType } = req.body;
      
      if (!fileName || !fileData) {
        return res.status(400).json({ message: "Missing file data" });
      }

      // Extract base64 data
      const base64Data = fileData.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate unique filename
      const timestamp = Date.now();
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}_${cleanFileName}`;

      // For now, we'll use a placeholder URL structure
      // In production, you would upload to cloud storage (AWS S3, Google Cloud, etc.)
      const imageUrl = `/uploads/templates/${uniqueFileName}`;

      // Save file locally (for demo purposes)
      const fs = await import('fs');
      const path = await import('path');
      
      const uploadsDir = path.join(process.cwd(), 'uploads', 'templates');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, uniqueFileName);
      fs.writeFileSync(filePath, buffer);

      res.json({
        imageUrl,
        fileName: uniqueFileName,
        size: fileSize,
        mimeType
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Subscription routes
  app.get("/api/subscription/plans", async (req, res) => {
    try {
      const plans = await mongoStorage.getSubscriptionPlans();
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/subscription/status", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const status = await mongoStorage.getUserSubscriptionStatus(userId);
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/subscription/create", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const { planId } = req.body;

      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }

      // Get the subscription plan
      const plan = await mongoStorage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }

      // Create or retrieve Stripe customer
      let customer;
      if (req.user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(req.user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: req.user.email,
          metadata: { userId }
        });
        
        // Update user with Stripe customer ID
        await mongoStorage.updateUserSubscription(userId, {
          stripeSubscriptionId: '',
          subscriptionStatus: 'incomplete',
          subscriptionPlanId: planId,
          subscriptionStartDate: new Date()
        });
      }

      // Create Stripe subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: plan.stripePriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user subscription in database
      await mongoStorage.updateUserSubscription(userId, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlanId: planId,
        subscriptionStartDate: new Date(subscription.created * 1000)
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        status: subscription.status
      });

    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/subscription/cancel", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const user = await mongoStorage.getUserById(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      // Cancel subscription in Stripe
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);

      // Update user subscription status
      await mongoStorage.cancelUserSubscription(userId);

      res.json({ message: "Subscription canceled successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin subscription management
  app.post("/api/admin/subscription/plans", authenticateToken, isAdmin, async (req, res) => {
    try {
      const planData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await mongoStorage.createSubscriptionPlan(planData);
      res.status(201).json(plan);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid plan data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Onboarding routes
  app.get("/api/onboarding/questions", async (req, res) => {
    try {
      const questions = await aiService.generateOnboardingQuestions();
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/onboarding/complete", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const preferencesData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId,
        completedOnboarding: true
      });

      // Create user preferences
      const preferences = await mongoStorage.createUserPreferences(preferencesData);

      // Create user stats if they don't exist
      let userStats = await mongoStorage.getUserStats(userId);
      if (!userStats) {
        userStats = await mongoStorage.createUserStats(userId);
      }

      // Award first achievement
      const firstAchievement = achievementDefinitions.find(a => a.id === 'first_postcard');
      if (firstAchievement) {
        await mongoStorage.addUserAchievement({
          userId,
          achievementId: firstAchievement.id,
          achievementName: firstAchievement.name,
          description: firstAchievement.description,
          icon: firstAchievement.icon,
          points: firstAchievement.points
        });

        // Update user stats
        await mongoStorage.updateUserStats(userId, {
          totalPoints: userStats.totalPoints + firstAchievement.points,
          badges: [...userStats.badges, firstAchievement.id]
        });
      }

      res.json({
        preferences,
        pointsEarned: firstAchievement?.points || 0,
        achievement: firstAchievement
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preferences data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // User preferences routes
  app.get("/api/user/preferences", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const preferences = await mongoStorage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user/stats", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const stats = await mongoStorage.getUserStats(userId);
      const achievements = await mongoStorage.getUserAchievements(userId);
      res.json({ stats, achievements });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI-powered landmark recommendations
  app.get("/api/ai/recommendations", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const preferences = await mongoStorage.getUserPreferences(userId);
      
      if (!preferences || !preferences.completedOnboarding) {
        return res.status(400).json({ message: "Complete onboarding first" });
      }

      // Check if we have cached recommendations for this user
      const cachedRecommendations = await mongoStorage.getCachedRecommendations(userId, preferences);
      if (cachedRecommendations && cachedRecommendations.length > 0) {
        return res.json(cachedRecommendations);
      }

      const userHistory = await mongoStorage.getUserStats(userId);
      const recommendations = await aiService.getPersonalizedLandmarkRecommendations(
        {
          interests: preferences.interests,
          previousVisits: [],
          travelStyle: preferences.travelStyle,
          preferredActivities: preferences.preferredActivities,
          timeOfYear: preferences.timeOfYear
        },
        userHistory?.landmarksVisited || []
      );

      // Cache the recommendations
      await mongoStorage.saveCachedRecommendations(userId, recommendations, preferences);

      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/recommendations/refresh", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const preferences = await mongoStorage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.status(400).json({ message: "User preferences not found" });
      }

      // Clear cached recommendations first
      await mongoStorage.clearCachedRecommendations(userId);

      const userHistory = await mongoStorage.getUserStats(userId);
      const recommendations = await aiService.getPersonalizedLandmarkRecommendations(
        {
          interests: preferences.interests,
          previousVisits: [],
          travelStyle: preferences.travelStyle,
          preferredActivities: preferences.preferredActivities,
          timeOfYear: preferences.timeOfYear
        },
        userHistory?.landmarksVisited || []
      );

      // Cache the new recommendations
      await mongoStorage.saveCachedRecommendations(userId, recommendations, preferences);

      res.json({ recommendations });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Image search for landmarks
  app.get("/api/images/search", async (req, res) => {
    try {
      const { query } = req.query as { query: string };
      if (!query) {
        return res.status(400).json({ message: "Query parameter required" });
      }

      // Fallback to placeholder images with relevant landmarks
      const placeholderImages = [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
          thumb: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
          alt: `${query} landmark`,
          author: 'Unsplash',
          downloadUrl: '#'
        },
        {
          id: '2', 
          url: 'https://images.unsplash.com/photo-1564594985645-4427056bad51?w=800&q=80',
          thumb: 'https://images.unsplash.com/photo-1564594985645-4427056bad51?w=400&q=80',
          alt: `${query} architecture`,
          author: 'Unsplash',
          downloadUrl: '#'
        }
      ];
      
      res.json({ images: placeholderImages });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Social media preview routes
  app.post("/api/social-media/generate", authenticateToken, async (req: any, res) => {
    try {
      const { postcardId, templateName, message, landmark, mood } = req.body;

      if (!postcardId || !templateName || !message || !landmark) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const captions = await aiService.generateSocialMediaCaption({
        templateName,
        message,
        landmark,
        mood: mood || 'excited'
      });

      // Save social media previews
      const platforms = ['instagram', 'twitter', 'facebook'] as const;
      for (const platform of platforms) {
        await mongoStorage.saveSocialMediaPreview({
          postcardId,
          platform,
          caption: captions[platform],
          hashtags: captions.hashtags
        });
      }

      res.json(captions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/social-media/previews/:postcardId", authenticateToken, async (req, res) => {
    try {
      const { postcardId } = req.params;
      const previews = await mongoStorage.getSocialMediaPreviews(postcardId);
      res.json(previews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Travel Story Generator routes
  app.post("/api/stories/generate", authenticateToken, async (req: any, res) => {
    try {
      const { location, mood, style, userContext, language } = req.body;
      
      if (!location) {
        return res.status(400).json({ message: "Location is required" });
      }

      const userId = req.user._id;
      const preferences = await mongoStorage.getUserPreferences(userId);

      const story = await aiStoryService.generateTravelStory({
        location,
        mood: mood || 'happy',
        style: style || 'casual',
        userContext,
        preferences: preferences || undefined
      }, language || 'en'); // Pass language parameter to AI service

      res.json(story);
    } catch (error: any) {
      console.error('Story generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/stories", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const storyData = {
        ...req.body,
        userId: userId.toString() // Convert ObjectId to string for the integer field
      };

      // For now, store in MongoDB as a custom collection
      // since we don't have the PostgreSQL story tables set up yet
      const story = await mongoStorage.createTravelStory(storyData);
      res.status(201).json(story);
    } catch (error: any) {
      console.error('Story save error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stories", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const stories = await mongoStorage.getUserTravelStories(userId);
      res.json(stories);
    } catch (error: any) {
      console.error('Stories fetch error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/story-preferences", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const preferences = await mongoStorage.getUserStoryPreferences(userId);
      res.json(preferences);
    } catch (error: any) {
      console.error('Story preferences fetch error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/story-preferences", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const preferencesData = {
        ...req.body,
        userId: userId.toString()
      };

      const preferences = await mongoStorage.createOrUpdateStoryPreferences(preferencesData);
      res.json(preferences);
    } catch (error: any) {
      console.error('Story preferences save error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Travel Story Generation routes
  app.post("/api/travel-stories/generate", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const { location, mood, style, userContext, preferences } = req.body;
      
      if (!location) {
        return res.status(400).json({ message: "Location is required" });
      }

      // Get user's language preference for story generation
      const userPreferences = await mongoStorage.getUserPreferences(userId);
      const language = userPreferences?.language || 'en';

      const storyService = new AIStoryService();
      const generatedStory = await storyService.generateTravelStory(
        { location, mood, style, userContext, preferences }, 
        language
      );

      // Save the story to user's history
      const storyData = {
        userId,
        location,
        mood,
        style,
        userContext: userContext || '',
        photoUrls: [],
        title: generatedStory.title,
        storyContent: generatedStory.story,
        instagramCaption: generatedStory.instagramCaption,
        hashtags: generatedStory.hashtags,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedStory = await mongoStorage.createTravelStory(storyData);

      res.json({
        storyId: savedStory._id,
        ...generatedStory
      });
    } catch (error: any) {
      console.error('Travel story generation error:', error);
      res.status(500).json({ message: "Failed to generate travel story" });
    }
  });

  app.get("/api/travel-stories/user/:userId", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const requestedUserId = req.params.userId;
      
      // Users can only access their own stories
      if (userId !== requestedUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { page = 1, limit = 10 } = req.query;
      const stories = await mongoStorage.getUserTravelStories(userId, parseInt(page), parseInt(limit));
      res.json(stories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/travel-stories/:storyId", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const { storyId } = req.params;
      
      const story = await mongoStorage.getTravelStory(storyId);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      // Users can only access their own stories
      if (story.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(story);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/travel-stories/:storyId", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const { storyId } = req.params;
      const updateData = req.body;

      const story = await mongoStorage.getTravelStory(storyId);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      // Users can only update their own stories
      if (story.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedStory = await mongoStorage.updateTravelStory(storyId, updateData);
      res.json(updatedStory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/travel-stories/:storyId", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const { storyId } = req.params;

      const story = await mongoStorage.getTravelStory(storyId);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      // Users can only delete their own stories
      if (story.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await mongoStorage.deleteTravelStory(storyId);
      res.json({ message: "Story deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Story Preferences routes
  app.get("/api/story-preferences", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const preferences = await mongoStorage.getUserStoryPreferences(userId);
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/story-preferences", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const preferencesData = { ...req.body, userId };
      const preferences = await mongoStorage.saveUserStoryPreferences(preferencesData);
      res.json(preferences);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
