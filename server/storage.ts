import { 
  users, postcards, orders, templates, analytics, newsletterSubscribers,
  type User, type InsertUser, type Postcard, type InsertPostcard, 
  type Order, type InsertOrder, type Template, type InsertTemplate,
  type Analytics, type InsertAnalytics, type NewsletterSubscriber, 
  type InsertNewsletterSubscriber
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(userId: number, credits: string): Promise<User>;
  generateReferralCode(userId: number): Promise<string>;

  // Postcards
  getPostcard(id: number): Promise<Postcard | undefined>;
  getPostcardsByUser(userId: number): Promise<Postcard[]>;
  getPublicPostcards(limit?: number): Promise<Postcard[]>;
  createPostcard(postcard: InsertPostcard): Promise<Postcard>;
  updatePostcardStats(id: number, type: 'download' | 'share'): Promise<void>;

  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string, stripePaymentIntentId?: string): Promise<Order>;

  // Templates
  getTemplate(id: string): Promise<Template | undefined>;
  getTemplates(category?: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplateUsage(id: string): Promise<void>;

  // Analytics
  trackEvent(analytics: InsertAnalytics): Promise<Analytics>;
  getUserAnalytics(userId: number): Promise<Analytics[]>;
  getPopularTemplates(limit?: number): Promise<Template[]>;

  // Newsletter
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private postcards: Map<number, Postcard> = new Map();
  private orders: Map<number, Order> = new Map();
  private templates: Map<string, Template> = new Map();
  private analytics: Map<number, Analytics> = new Map();
  private newsletterSubscribers: Map<number, NewsletterSubscriber> = new Map();
  
  private currentUserId = 1;
  private currentPostcardId = 1;
  private currentOrderId = 1;
  private currentAnalyticsId = 1;
  private currentSubscriberId = 1;

  constructor() {
    // Initialize with default templates
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const defaultTemplates: Template[] = [
      {
        id: "opera-house-classic",
        name: "Opera House Classic",
        description: "Elegant architectural beauty",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        category: "landmarks",
        isPremium: false,
        usageCount: 34,
        createdAt: new Date(),
      },
      {
        id: "potemkin-steps",
        name: "Potemkin Steps",
        description: "Historic landmark views",
        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        category: "landmarks",
        isPremium: false,
        usageCount: 22,
        createdAt: new Date(),
      },
      {
        id: "black-sea-sunset",
        name: "Black Sea Sunset",
        description: "Coastal paradise views",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        category: "coastal",
        isPremium: false,
        usageCount: 28,
        createdAt: new Date(),
      },
      {
        id: "maritime-harbor",
        name: "Maritime Harbor",
        description: "Port city essence",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        category: "coastal",
        isPremium: false,
        usageCount: 18,
        createdAt: new Date(),
      },
      {
        id: "golden-domes",
        name: "Golden Domes",
        description: "Spiritual architecture",
        imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        category: "historic",
        isPremium: false,
        usageCount: 15,
        createdAt: new Date(),
      },
      {
        id: "old-town-charm",
        name: "Old Town Charm",
        description: "Historic streetscapes",
        imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        category: "historic",
        isPremium: false,
        usageCount: 12,
        createdAt: new Date(),
      },
      {
        id: "seaside-promenade",
        name: "Seaside Promenade",
        description: "Coastal walkways",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        category: "coastal",
        isPremium: false,
        usageCount: 20,
        createdAt: new Date(),
      },
      {
        id: "vintage-ukraine",
        name: "Vintage Ukraine",
        description: "Traditional aesthetic",
        imageUrl: "https://images.unsplash.com/photo-1517654443271-21d3b904eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        category: "vintage",
        isPremium: true,
        usageCount: 8,
        createdAt: new Date(),
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      username: insertUser.username || null,
      stripeCustomerId: null,
      referralCode: `REF${id.toString().padStart(6, '0')}`,
      referredBy: null,
      credits: "0.00",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserCredits(userId: number, credits: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, credits };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async generateReferralCode(userId: number): Promise<string> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const referralCode = `REF${userId.toString().padStart(6, '0')}`;
    const updatedUser = { ...user, referralCode };
    this.users.set(userId, updatedUser);
    return referralCode;
  }

  // Postcards
  async getPostcard(id: number): Promise<Postcard | undefined> {
    return this.postcards.get(id);
  }

  async getPostcardsByUser(userId: number): Promise<Postcard[]> {
    return Array.from(this.postcards.values()).filter(postcard => postcard.userId === userId);
  }

  async getPublicPostcards(limit = 20): Promise<Postcard[]> {
    return Array.from(this.postcards.values())
      .filter(postcard => postcard.isPublic)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createPostcard(insertPostcard: InsertPostcard): Promise<Postcard> {
    const id = this.currentPostcardId++;
    const postcard: Postcard = {
      ...insertPostcard,
      id,
      userId: insertPostcard.userId || null,
      customImageUrl: insertPostcard.customImageUrl || null,
      fontFamily: insertPostcard.fontFamily || null,
      backgroundColor: insertPostcard.backgroundColor || null,
      textColor: insertPostcard.textColor || null,
      isPublic: insertPostcard.isPublic || null,
      downloadCount: 0,
      shareCount: 0,
      createdAt: new Date(),
    };
    this.postcards.set(id, postcard);
    return postcard;
  }

  async updatePostcardStats(id: number, type: 'download' | 'share'): Promise<void> {
    const postcard = this.postcards.get(id);
    if (!postcard) throw new Error("Postcard not found");
    
    const updatedPostcard = {
      ...postcard,
      downloadCount: type === 'download' ? postcard.downloadCount! + 1 : postcard.downloadCount!,
      shareCount: type === 'share' ? postcard.shareCount! + 1 : postcard.shareCount!,
    };
    this.postcards.set(id, updatedPostcard);
  }

  // Orders
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      ...insertOrder,
      id,
      userId: insertOrder.userId || null,
      postcardId: insertOrder.postcardId || null,
      stripePaymentIntentId: null,
      status: "pending",
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string, stripePaymentIntentId?: string): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    
    const updatedOrder = { 
      ...order, 
      status,
      ...(stripePaymentIntentId && { stripePaymentIntentId })
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Templates
  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getTemplates(category?: string): Promise<Template[]> {
    const templates = Array.from(this.templates.values());
    if (category) {
      return templates.filter(template => template.category === category);
    }
    return templates.sort((a, b) => b.usageCount! - a.usageCount!);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const template: Template = {
      ...insertTemplate,
      description: insertTemplate.description || null,
      isPremium: insertTemplate.isPremium || null,
      usageCount: 0,
      createdAt: new Date(),
    };
    this.templates.set(template.id, template);
    return template;
  }

  async updateTemplateUsage(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (!template) throw new Error("Template not found");
    
    const updatedTemplate = {
      ...template,
      usageCount: template.usageCount! + 1,
    };
    this.templates.set(id, updatedTemplate);
  }

  // Analytics
  async trackEvent(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.currentAnalyticsId++;
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
      userId: insertAnalytics.userId || null,
      postcardId: insertAnalytics.postcardId || null,
      platform: insertAnalytics.platform || null,
      createdAt: new Date(),
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getUserAnalytics(userId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(analytics => analytics.userId === userId);
  }

  async getPopularTemplates(limit = 10): Promise<Template[]> {
    return Array.from(this.templates.values())
      .sort((a, b) => b.usageCount! - a.usageCount!)
      .slice(0, limit);
  }

  // Newsletter
  async subscribeToNewsletter(insertSubscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = this.currentSubscriberId++;
    const subscriber: NewsletterSubscriber = {
      ...insertSubscriber,
      id,
      source: insertSubscriber.source || null,
      isActive: true,
      createdAt: new Date(),
    };
    this.newsletterSubscribers.set(id, subscriber);
    return subscriber;
  }

  async getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined> {
    return Array.from(this.newsletterSubscribers.values()).find(subscriber => subscriber.email === email);
  }
}

export const storage = new MemStorage();
