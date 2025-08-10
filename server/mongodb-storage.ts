import { ObjectId, Collection } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from './database';
import type { 
  User, InsertUser, LoginRequest, RegisterRequest,
  Postcard, InsertPostcard,
  Event, InsertEvent,
  Location, InsertLocation,
  Template, InsertTemplate,
  Order, InsertOrder,
  SubscriptionPlan, InsertSubscriptionPlan
} from '../shared/mongodb-schema';
import type {
  UserPreferences, InsertUserPreferences,
  UserAchievement, InsertUserAchievement,
  UserStats, InsertUserStats,
  SocialMediaPreview, InsertSocialMediaPreview
} from '../shared/onboarding-schema';

export interface IMongoStorage {
  // Authentication
  registerUser(userData: RegisterRequest): Promise<{ user: User; token: string }>;
  loginUser(credentials: LoginRequest): Promise<{ user: User; token: string }>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  verifyToken(token: string): Promise<User | null>;
  requestPasswordReset(email: string): Promise<{ message: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ message: string }>;
  
  // Admin methods
  getAdminStats(): Promise<any>;
  getAllUsers(): Promise<User[]>;
  getUserCount(): Promise<number>;
  getPostcardCount(): Promise<number>;
  updateUserCredits(userId: string, credits: number): Promise<User>;
  deleteUserByEmail(email: string): Promise<void>;
  createTemplate(templateData: any): Promise<any>;
  updateTemplate(templateId: string, templateData: any): Promise<any>;
  deleteTemplate(templateId: string): Promise<void>;

  // Postcards
  createPostcard(postcard: InsertPostcard): Promise<Postcard>;
  getPostcard(id: string): Promise<Postcard | null>;
  getPostcardsByUser(userId: string): Promise<Postcard[]>;
  getPublicPostcards(limit?: number): Promise<Postcard[]>;
  updatePostcardStats(id: string, type: 'download' | 'share'): Promise<void>;

  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | null>;
  getEvents(filters?: { category?: string; locationId?: string }): Promise<Event[]>;
  getUpcomingEvents(limit?: number): Promise<Event[]>;

  // Locations
  createLocation(location: InsertLocation): Promise<Location>;
  getLocation(id: string): Promise<Location | null>;
  getLocations(filters?: { category?: string }): Promise<Location[]>;
  getPopularLocations(limit?: number): Promise<Location[]>;

  // Templates
  createTemplate(template: InsertTemplate): Promise<Template>;
  getTemplate(id: string): Promise<Template | null>;
  getTemplates(category?: string): Promise<Template[]>;
  updateTemplateUsage(id: string): Promise<void>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string, stripePaymentIntentId?: string): Promise<Order>;

  // Subscriptions
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | null>;
  updateUserSubscription(userId: string, subscriptionData: {
    stripeSubscriptionId: string;
    subscriptionStatus: string;
    subscriptionPlanId: string;
    subscriptionStartDate: Date;
    subscriptionEndDate?: Date;
  }): Promise<User>;
  cancelUserSubscription(userId: string): Promise<User>;
  getUserSubscriptionStatus(userId: string): Promise<{ isSubscribed: boolean; plan?: SubscriptionPlan; status?: string }>;

  // Onboarding & AI Features
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  getUserPreferences(userId: string): Promise<UserPreferences | null>;
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences>;
  
  // Gamification
  createUserStats(userId: string): Promise<UserStats>;
  getUserStats(userId: string): Promise<UserStats | null>;
  updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats>;
  addUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  
  // Social Media
  saveSocialMediaPreview(preview: InsertSocialMediaPreview): Promise<SocialMediaPreview>;
  getSocialMediaPreviews(postcardId: string): Promise<SocialMediaPreview[]>;
}

export class MongoStorage implements IMongoStorage {
  private users!: Collection<User>;
  private postcards!: Collection<Postcard>;
  private events!: Collection<Event>;
  private locations!: Collection<Location>;
  private templates!: Collection<Template>;
  private orders!: Collection<Order>;
  private subscriptionPlans!: Collection<SubscriptionPlan>;
  private userPreferences!: Collection<UserPreferences>;
  private userStats!: Collection<UserStats>;
  private userAchievements!: Collection<UserAchievement>;
  private socialMediaPreviews!: Collection<SocialMediaPreview>;

  constructor() {
    // Collections will be initialized later
  }

  initialize() {
    const db = getDatabase();
    this.users = db.collection('users');
    this.postcards = db.collection('postcards');
    this.events = db.collection('events');
    this.locations = db.collection('locations');
    this.templates = db.collection('templates');
    this.orders = db.collection('orders');
    this.subscriptionPlans = db.collection('subscriptionPlans');
    this.userPreferences = db.collection('userPreferences');
    this.userStats = db.collection('userStats');
    this.userAchievements = db.collection('userAchievements');
    this.socialMediaPreviews = db.collection('socialMediaPreviews');
  }

  // Authentication methods
  async registerUser(userData: RegisterRequest): Promise<{ user: User; token: string }> {
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);
    const newUser: Omit<User, '_id'> = {
      email: userData.email,
      passwordHash,
      username: userData.username,
      isEmailVerified: false,
      credits: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.users.insertOne(newUser as User);
    const user = { ...newUser, _id: result.insertedId.toString() };
    
    const token = this.generateToken(user._id!);
    return { user, token };
  }

  async loginUser(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    const user = await this.getUserByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user._id!);
    return { user, token };
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.users.findOne({ _id: new ObjectId(id) } as any);
    return user ? { ...user, _id: user._id.toString() } : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.users.findOne({ email });
    return user ? { ...user, _id: user._id.toString() } : null;
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
      return await this.getUserById(decoded.userId);
    } catch {
      return null;
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
  }

  private generateResetToken(): string {
    return jwt.sign({ reset: true, timestamp: Date.now() }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '1h' });
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const user = await this.users.findOne({ email });
      
      if (!user) {
        // Return success message even if user doesn't exist for security
        return { message: "Password reset email sent if account exists" };
      }

      const resetToken = this.generateResetToken();
      
      // Store reset token with expiration (1 hour from now)
      await this.users.updateOne(
        { _id: user._id },
        { 
          $set: { 
            resetToken,
            resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
          } 
        }
      );

      // Send password reset email
      const { EmailService } = await import('./email-service');
      const emailSent = await EmailService.sendPasswordResetEmail(email, resetToken);
      
      // Always log the reset link for development/testing
      const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
      console.log(`\n🔑 Password Reset Link for ${email}:`);
      console.log(`🔗 ${resetLink}`);
      console.log(`⏰ Link expires in 1 hour\n`);

      return { message: "Password reset email sent if account exists" };
    } catch (error) {
      throw new Error("Failed to process password reset request");
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      // Verify the reset token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      } catch (error) {
        throw new Error("Invalid or expired reset token");
      }

      if (!decoded.reset) {
        throw new Error("Invalid reset token");
      }

      // Find user with this reset token
      const user = await this.users.findOne({ 
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() }
      });

      if (!user) {
        throw new Error("Invalid or expired reset token");
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password and remove reset token
      await this.users.updateOne(
        { _id: user._id },
        { 
          $set: { passwordHash: hashedPassword },
          $unset: { resetToken: "", resetTokenExpiry: "" }
        }
      );

      return { message: "Password reset successfully" };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to reset password");
    }
  }

  // Admin methods
  async getAdminStats(): Promise<any> {
    try {
      const totalUsers = await this.users.countDocuments();
      const totalPostcards = await this.postcards.countDocuments();
      const totalTemplates = await this.templates.countDocuments();
      const totalEvents = await this.events.countDocuments();
      const totalLocations = await this.locations.countDocuments();

      // Calculate revenue (mock data for demo)
      const revenueThisMonth = 1247.50;
      const activeUsers = Math.floor(totalUsers * 0.65);

      return {
        totalUsers,
        totalPostcards,
        totalTemplates,
        totalEvents,
        totalLocations,
        revenueThisMonth,
        activeUsers,
        popularTemplates: []
      };
    } catch (error) {
      throw new Error("Failed to get admin stats");
    }
  }

  async getUserCount(): Promise<number> {
    try {
      return await this.users.countDocuments();
    } catch (error) {
      throw new Error("Failed to get user count");
    }
  }

  async getPostcardCount(): Promise<number> {
    try {
      return await this.postcards.countDocuments();
    } catch (error) {
      throw new Error("Failed to get postcard count");
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await this.users.find({}, { 
        projection: { passwordHash: 0, resetToken: 0 } 
      }).toArray();
      
      return users.map(user => ({
        ...user,
        _id: user._id.toString()
      })) as User[];
    } catch (error) {
      throw new Error("Failed to get users");
    }
  }

  async deleteUserByEmail(email: string): Promise<void> {
    try {
      await this.users.deleteOne({ email });
    } catch (error) {
      throw new Error("Failed to delete user");
    }
  }

  async updateUserCredits(userId: string, credits: number): Promise<User> {
    try {
      const result = await this.users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { credits, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        throw new Error("User not found");
      }
      
      return { ...result.value, _id: result.value._id.toString() } as User;
    } catch (error) {
      throw new Error("Failed to get all users");
    }
  }

  async updateUserCredits(userId: string, credits: number): Promise<User> {
    try {
      const result = await this.users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            credits: credits.toString(), 
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error("User not found");
      }

      return {
        ...result,
        _id: result._id.toString(),
        passwordHash: undefined,
        resetToken: undefined
      } as User;
    } catch (error) {
      throw new Error("Failed to update user credits");
    }
  }

  async createTemplate(templateData: any): Promise<any> {
    try {
      // Check if template ID already exists
      const existing = await this.templates.findOne({ id: templateData.id });
      if (existing) {
        throw new Error("Template with this ID already exists");
      }

      const newTemplate = {
        ...templateData,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      };

      const result = await this.templates.insertOne(newTemplate);
      return { ...newTemplate, _id: result.insertedId.toString() };
    } catch (error) {
      throw new Error("Failed to create template");
    }
  }

  async updateTemplate(templateId: string, templateData: any): Promise<any> {
    try {
      const result = await this.templates.findOneAndUpdate(
        { id: templateId },
        { 
          $set: { 
            ...templateData,
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error("Template not found");
      }

      return { ...result, _id: result._id.toString() };
    } catch (error) {
      throw new Error("Failed to update template");
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const result = await this.templates.deleteOne({ id: templateId });
      
      if (result.deletedCount === 0) {
        throw new Error("Template not found");
      }
    } catch (error) {
      throw new Error("Failed to delete template");
    }
  }

  // Postcard methods
  async createPostcard(postcard: InsertPostcard): Promise<Postcard> {
    const newPostcard: Omit<Postcard, '_id'> = {
      ...postcard,
      downloadCount: 0,
      shareCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.postcards.insertOne(newPostcard as Postcard);
    return { ...newPostcard, _id: result.insertedId.toString() };
  }

  async getPostcard(id: string): Promise<Postcard | null> {
    const postcard = await this.postcards.findOne({ _id: new ObjectId(id) } as any);
    return postcard ? { ...postcard, _id: postcard._id.toString() } : null;
  }

  async getPostcardsByUser(userId: string): Promise<Postcard[]> {
    const postcards = await this.postcards.find({ userId }).toArray();
    return postcards.map(p => ({ ...p, _id: p._id.toString() }));
  }

  async getPublicPostcards(limit = 20): Promise<Postcard[]> {
    const postcards = await this.postcards
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return postcards.map(p => ({ ...p, _id: p._id.toString() }));
  }

  async updatePostcardStats(id: string, type: 'download' | 'share'): Promise<void> {
    const field = type === 'download' ? 'downloadCount' : 'shareCount';
    await this.postcards.updateOne(
      { _id: new ObjectId(id) } as any,
      { $inc: { [field]: 1 }, $set: { updatedAt: new Date() } }
    );
  }

  // Event methods
  async createEvent(event: InsertEvent): Promise<Event> {
    const newEvent: Omit<Event, '_id'> = {
      ...event,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.events.insertOne(newEvent as Event);
    return { ...newEvent, _id: result.insertedId.toString() };
  }

  async getEvent(id: string): Promise<Event | null> {
    const event = await this.events.findOne({ _id: new ObjectId(id) } as any);
    return event ? { ...event, _id: event._id.toString() } : null;
  }

  async getEvents(filters?: { category?: string; locationId?: string }): Promise<Event[]> {
    const query: any = { isActive: true };
    if (filters?.category) query.category = filters.category;
    if (filters?.locationId) query.locationId = filters.locationId;

    const events = await this.events.find(query).sort({ startDate: 1 }).toArray();
    return events.map(e => ({ ...e, _id: e._id.toString() }));
  }

  async getUpcomingEvents(limit = 10): Promise<Event[]> {
    const events = await this.events
      .find({ 
        isActive: true,
        startDate: { $gte: new Date() }
      })
      .sort({ startDate: 1 })
      .limit(limit)
      .toArray();
    return events.map(e => ({ ...e, _id: e._id.toString() }));
  }

  // Location methods
  async createLocation(location: InsertLocation): Promise<Location> {
    const newLocation: Omit<Location, '_id'> = {
      ...location,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.locations.insertOne(newLocation as Location);
    return { ...newLocation, _id: result.insertedId.toString() };
  }

  async getLocation(id: string): Promise<Location | null> {
    const location = await this.locations.findOne({ _id: new ObjectId(id) } as any);
    return location ? { ...location, _id: location._id.toString() } : null;
  }

  async getLocations(filters?: { category?: string }): Promise<Location[]> {
    const query: any = {};
    if (filters?.category) query.category = filters.category;

    const locations = await this.locations.find(query).sort({ name: 1 }).toArray();
    return locations.map(l => ({ ...l, _id: l._id.toString() }));
  }

  async getPopularLocations(limit = 10): Promise<Location[]> {
    const locations = await this.locations
      .find({ isPopular: true })
      .sort({ name: 1 })
      .limit(limit)
      .toArray();
    return locations.map(l => ({ ...l, _id: l._id.toString() }));
  }

  // Template methods
  async createTemplate(template: InsertTemplate): Promise<Template> {
    const newTemplate: Omit<Template, '_id'> = {
      ...template,
      usageCount: 0,
      createdAt: new Date(),
    };

    const result = await this.templates.insertOne(newTemplate as Template);
    return { ...newTemplate, _id: result.insertedId.toString() };
  }

  async getTemplate(id: string): Promise<Template | null> {
    const template = await this.templates.findOne({ id });
    return template ? { ...template, _id: template._id.toString() } : null;
  }

  async getTemplates(category?: string): Promise<Template[]> {
    const query: any = {};
    if (category) query.category = category;

    const templates = await this.templates.find(query).sort({ name: 1 }).toArray();
    return templates.map(t => ({ ...t, _id: t._id.toString() }));
  }

  async updateTemplateUsage(id: string): Promise<void> {
    await this.templates.updateOne(
      { id },
      { $inc: { usageCount: 1 } }
    );
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder: Omit<Order, '_id'> = {
      ...order,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.orders.insertOne(newOrder as Order);
    return { ...newOrder, _id: result.insertedId.toString() };
  }

  async getOrder(id: string): Promise<Order | null> {
    const order = await this.orders.findOne({ _id: new ObjectId(id) } as any);
    return order ? { ...order, _id: order._id.toString() } : null;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const orders = await this.orders.find({ userId }).sort({ createdAt: -1 }).toArray();
    return orders.map(o => ({ ...o, _id: o._id.toString() }));
  }

  async updateOrderStatus(id: string, status: string, stripePaymentIntentId?: string): Promise<Order> {
    const updateData: any = { status, updatedAt: new Date() };
    if (stripePaymentIntentId) updateData.stripePaymentIntentId = stripePaymentIntentId;

    const result = await this.orders.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Order not found');
    }

    return { ...result, _id: result._id.toString() };
  }

  // Subscription methods
  async createSubscriptionPlan(planData: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    try {
      const plan = { ...planData, createdAt: new Date() };
      const result = await this.subscriptionPlans.insertOne(plan as SubscriptionPlan);
      return { ...plan, _id: result.insertedId.toString() } as SubscriptionPlan;
    } catch (error) {
      throw new Error("Failed to create subscription plan");
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const plans = await this.subscriptionPlans.find({ isActive: true }).toArray();
      return plans.map(plan => ({
        ...plan,
        _id: plan._id.toString()
      })) as SubscriptionPlan[];
    } catch (error) {
      throw new Error("Failed to get subscription plans");
    }
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | null> {
    try {
      const plan = await this.subscriptionPlans.findOne({ id });
      if (!plan) return null;
      return { ...plan, _id: plan._id.toString() } as SubscriptionPlan;
    } catch (error) {
      throw new Error("Failed to get subscription plan");
    }
  }

  async updateUserSubscription(userId: string, subscriptionData: {
    stripeSubscriptionId: string;
    subscriptionStatus: string;
    subscriptionPlanId: string;
    subscriptionStartDate: Date;
    subscriptionEndDate?: Date;
  }): Promise<User> {
    try {
      const result = await this.users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            ...subscriptionData,
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error("User not found");
      }

      return { ...result, _id: result._id.toString() } as User;
    } catch (error) {
      throw new Error("Failed to update user subscription");
    }
  }

  async cancelUserSubscription(userId: string): Promise<User> {
    try {
      const result = await this.users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            subscriptionStatus: 'canceled',
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error("User not found");
      }

      return { ...result, _id: result._id.toString() } as User;
    } catch (error) {
      throw new Error("Failed to cancel user subscription");
    }
  }

  async getUserSubscriptionStatus(userId: string): Promise<{ isSubscribed: boolean; plan?: SubscriptionPlan; status?: string }> {
    try {
      const user = await this.users.findOne({ _id: new ObjectId(userId) });
      if (!user || !user.subscriptionStatus) {
        return { isSubscribed: false };
      }

      const isActive = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
      
      if (isActive && user.subscriptionPlanId) {
        const plan = await this.getSubscriptionPlan(user.subscriptionPlanId);
        return { 
          isSubscribed: true, 
          plan: plan || undefined, 
          status: user.subscriptionStatus 
        };
      }

      return { 
        isSubscribed: false, 
        status: user.subscriptionStatus 
      };
    } catch (error) {
      throw new Error("Failed to get user subscription status");
    }
  }

  // Onboarding & AI Features
  async createUserPreferences(preferencesData: InsertUserPreferences): Promise<UserPreferences> {
    try {
      const preferences = { 
        ...preferencesData, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      const result = await this.userPreferences.insertOne(preferences as UserPreferences);
      return { ...preferences, _id: result.insertedId.toString() } as UserPreferences;
    } catch (error) {
      throw new Error("Failed to create user preferences");
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const preferences = await this.userPreferences.findOne({ userId });
      if (!preferences) return null;
      return { ...preferences, _id: preferences._id.toString() } as UserPreferences;
    } catch (error) {
      throw new Error("Failed to get user preferences");
    }
  }

  async updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const result = await this.userPreferences.findOneAndUpdate(
        { userId },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      if (!result) throw new Error("User preferences not found");
      return { ...result, _id: result._id.toString() } as UserPreferences;
    } catch (error) {
      throw new Error("Failed to update user preferences");
    }
  }

  // Gamification
  async createUserStats(userId: string): Promise<UserStats> {
    try {
      const stats = {
        userId,
        level: 1,
        totalPoints: 0,
        postcardsCreated: 0,
        postcardsSent: 0,
        landmarksVisited: [],
        streakDays: 0,
        badges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await this.userStats.insertOne(stats as UserStats);
      return { ...stats, _id: result.insertedId.toString() } as UserStats;
    } catch (error) {
      throw new Error("Failed to create user stats");
    }
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const stats = await this.userStats.findOne({ userId });
      if (!stats) return null;
      return { ...stats, _id: stats._id.toString() } as UserStats;
    } catch (error) {
      throw new Error("Failed to get user stats");
    }
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats> {
    try {
      const result = await this.userStats.findOneAndUpdate(
        { userId },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      if (!result) throw new Error("User stats not found");
      return { ...result, _id: result._id.toString() } as UserStats;
    } catch (error) {
      throw new Error("Failed to update user stats");
    }
  }

  async addUserAchievement(achievementData: InsertUserAchievement): Promise<UserAchievement> {
    try {
      const achievement = {
        ...achievementData,
        unlockedAt: new Date()
      };
      const result = await this.userAchievements.insertOne(achievement as UserAchievement);
      return { ...achievement, _id: result.insertedId.toString() } as UserAchievement;
    } catch (error) {
      throw new Error("Failed to add user achievement");
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const achievements = await this.userAchievements.find({ userId }).sort({ unlockedAt: -1 }).toArray();
      return achievements.map(achievement => ({
        ...achievement,
        _id: achievement._id.toString()
      })) as UserAchievement[];
    } catch (error) {
      throw new Error("Failed to get user achievements");
    }
  }

  // Social Media
  async saveSocialMediaPreview(previewData: InsertSocialMediaPreview): Promise<SocialMediaPreview> {
    try {
      const preview = {
        ...previewData,
        generatedAt: new Date()
      };
      const result = await this.socialMediaPreviews.insertOne(preview as SocialMediaPreview);
      return { ...preview, _id: result.insertedId.toString() } as SocialMediaPreview;
    } catch (error) {
      throw new Error("Failed to save social media preview");
    }
  }

  async getSocialMediaPreviews(postcardId: string): Promise<SocialMediaPreview[]> {
    try {
      const previews = await this.socialMediaPreviews.find({ postcardId }).sort({ generatedAt: -1 }).toArray();
      return previews.map(preview => ({
        ...preview,
        _id: preview._id.toString()
      })) as SocialMediaPreview[];
    } catch (error) {
      throw new Error("Failed to get social media previews");
    }
  }
}

export const mongoStorage = new MongoStorage();