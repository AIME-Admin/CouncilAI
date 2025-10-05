import { z } from "zod";
import { sql } from "drizzle-orm";
import { pgTable, text, serial, varchar, timestamp, jsonb, real, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// AI Model Types
export type AIModel = "gpt5" | "claude" | "gemini" | "perplexity";

// Claim structure for individual model responses
export const claimSchema = z.object({
  text: z.string(),
  support: z.array(z.string()),
});

export type Claim = z.infer<typeof claimSchema>;

// Draft response from each AI model
export const draftResponseSchema = z.object({
  agent: z.enum(["gpt5", "claude", "gemini", "perplexity"]),
  claims: z.array(claimSchema),
  confidence: z.number().min(0).max(1),
});

export type DraftResponse = z.infer<typeof draftResponseSchema>;

// Critique feedback from one model about another
export const critiqueSchema = z.object({
  reviewer: z.enum(["gpt5", "claude", "gemini", "perplexity"]),
  target: z.enum(["gpt5", "claude", "gemini", "perplexity"]),
  issues: z.array(z.string()),
});

export type Critique = z.infer<typeof critiqueSchema>;

// Dissent point showing disagreement
export const dissentSchema = z.object({
  point: z.string(),
  who: z.array(z.enum(["gpt5", "claude", "gemini", "perplexity"])),
});

export type Dissent = z.infer<typeof dissentSchema>;

// Final synthesis result
export const synthesisSchema = z.object({
  summary: z.string(),
  confidence: z.number().min(0).max(1),
  citations: z.array(z.string()),
  decision_log: z.array(z.string()),
  dissent: z.array(dissentSchema),
});

export type Synthesis = z.infer<typeof synthesisSchema>;

// Request/Response types
export const askRequestSchema = z.object({
  question: z.string().min(1, "Question is required"),
});

export type AskRequest = z.infer<typeof askRequestSchema>;

export const askResponseSchema = z.object({
  synthesis: synthesisSchema,
  drafts: z.array(draftResponseSchema),
  critiques: z.array(critiqueSchema),
  processing_time_ms: z.number(),
  timestamp: z.string(),
  query_id: z.string(),
});

export type AskResponse = z.infer<typeof askResponseSchema>;

// Database tables - sessions table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table with monetization fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replitId: varchar("replit_id", { length: 255 }).unique(),
  username: varchar("username", { length: 255 }),
  email: varchar("email", { length: 255 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url"),
  planTier: varchar("plan_tier", { length: 50 }).notNull().default("free"),
  queriesUsed: integer("queries_used").notNull().default(0),
  quotaRemaining: integer("quota_remaining").notNull().default(10),
  billingCycleStart: timestamp("billing_cycle_start").defaultNow(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const queries = pgTable("queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  questionHash: varchar("question_hash", { length: 64 }).notNull(),
  question: text("question").notNull(),
  responseData: jsonb("response_data").notNull(),
  confidence: real("confidence").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  modelWeights: jsonb("model_weights").notNull().default('{"gpt5": 1, "claude": 1, "gemini": 1, "perplexity": 1}'),
  enabledModels: jsonb("enabled_models").notNull().default('["gpt5", "claude", "gemini", "perplexity"]'),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Subscriptions table for Stripe integration
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull(),
  planTier: varchar("plan_tier", { length: 50 }).notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Select types
export type User = typeof users.$inferSelect;
export type Query = typeof queries.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;

// Insert and select schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertQuerySchema = createInsertSchema(queries).omit({
  id: true,
  createdAt: true,
});
export type InsertQuery = z.infer<typeof insertQuerySchema>;

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  updatedAt: true,
});
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Plan configurations
export const PLAN_CONFIG = {
  free: { name: "Free", queries: 10, price: 0 },
  basic: { name: "Basic", queries: 100, price: 19 },
  pro: { name: "Pro", queries: 500, price: 49 },
  team: { name: "Team", queries: 2000, price: 99 },
} as const;

export type PlanTier = keyof typeof PLAN_CONFIG;
