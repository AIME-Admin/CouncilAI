import {
  users,
  queries,
  userPreferences,
  subscriptions,
  type User,
  type InsertUser,
  type Query,
  type InsertQuery,
  type UserPreferences,
  type InsertUserPreferences,
  type Subscription,
  type InsertSubscription,
  PLAN_CONFIG,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByReplitId(replitId: string): Promise<User | undefined>;
  upsertUser(user: Partial<InsertUser>): Promise<User>;
  updateUserQuota(userId: number, queriesUsed: number, quotaRemaining: number): Promise<void>;
  
  // Query operations
  createQuery(query: InsertQuery): Promise<Query>;
  getUserQueries(userId: number, limit?: number, offset?: number): Promise<Query[]>;
  getQueryById(id: number): Promise<Query | undefined>;
  
  // Preferences operations
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  upsertUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;
  
  // Subscription operations
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(userId: number, updates: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  getActiveSubscription(userId: number): Promise<Subscription | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByReplitId(replitId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.replitId, replitId));
    return user;
  }

  async upsertUser(userData: Partial<InsertUser>): Promise<User> {
    // If replitId exists, try to find existing user
    if (userData.replitId) {
      const existing = await this.getUserByReplitId(userData.replitId);
      
      if (existing) {
        // Update existing user
        const [updated] = await db
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date(),
          })
          .where(eq(users.replitId, userData.replitId))
          .returning();
        return updated;
      }
    }
    
    // Create new user with free plan defaults
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        planTier: "free",
        queriesUsed: 0,
        quotaRemaining: PLAN_CONFIG.free.queries,
      } as InsertUser)
      .returning();
    return user;
  }

  async updateUserQuota(userId: number, queriesUsed: number, quotaRemaining: number): Promise<void> {
    await db
      .update(users)
      .set({ queriesUsed, quotaRemaining })
      .where(eq(users.id, userId));
  }

  // Query operations
  async createQuery(queryData: InsertQuery): Promise<Query> {
    const [query] = await db.insert(queries).values(queryData).returning();
    return query;
  }

  async getUserQueries(userId: number, limit = 50, offset = 0): Promise<Query[]> {
    return await db
      .select()
      .from(queries)
      .where(eq(queries.userId, userId))
      .orderBy(desc(queries.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getQueryById(id: number): Promise<Query | undefined> {
    const [query] = await db.select().from(queries).where(eq(queries.id, id));
    return query;
  }

  // Preferences operations
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async upsertUserPreferences(prefsData: InsertUserPreferences): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(prefsData.userId);
    
    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({
          ...prefsData,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, prefsData.userId))
        .returning();
      return updated;
    }
    
    const [prefs] = await db
      .insert(userPreferences)
      .values(prefsData)
      .returning();
    return prefs;
  }

  // Subscription operations
  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(subscriptionData)
      .returning();
    return subscription;
  }

  async updateSubscription(userId: number, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [updated] = await db
      .update(subscriptions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return updated;
  }

  async getActiveSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return subscription;
  }
}

export const storage = new DatabaseStorage();
