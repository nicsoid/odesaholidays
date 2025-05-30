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
  Order, InsertOrder
} from '../shared/mongodb-schema';

export interface IMongoStorage {
  // Authentication
  registerUser(userData: RegisterRequest): Promise<{ user: User; token: string }>;
  loginUser(credentials: LoginRequest): Promise<{ user: User; token: string }>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  verifyToken(token: string): Promise<User | null>;

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
}

export class MongoStorage implements IMongoStorage {
  private users: Collection<User>;
  private postcards: Collection<Postcard>;
  private events: Collection<Event>;
  private locations: Collection<Location>;
  private templates: Collection<Template>;
  private orders: Collection<Order>;

  constructor() {
    const db = getDatabase();
    this.users = db.collection('users');
    this.postcards = db.collection('postcards');
    this.events = db.collection('events');
    this.locations = db.collection('locations');
    this.templates = db.collection('templates');
    this.orders = db.collection('orders');
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
}

export const mongoStorage = new MongoStorage();