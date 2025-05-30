import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { mongoStorage } from "./mongodb-storage";
import { authenticateToken, optionalAuth } from "./auth-middleware";
import { insertUserSchema, insertPostcardSchema, insertOrderSchema, insertAnalyticsSchema, insertNewsletterSubscriberSchema } from "@shared/schema";
import { loginSchema, registerSchema } from "../shared/mongodb-schema";
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

  // Analytics
  app.get("/api/analytics/user/:userId", async (req, res) => {
    try {
      const analytics = await storage.getUserAnalytics(parseInt(req.params.userId));
      res.json(analytics);
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

  const httpServer = createServer(app);
  return httpServer;
}
