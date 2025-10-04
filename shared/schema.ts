import { z } from "zod";
import { pgTable, text, serial, varchar, timestamp, jsonb, real, integer } from "drizzle-orm/pg-core";

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

export type User = typeof users.$inferSelect;
export type UpsertUser = Partial<typeof users.$inferInsert>;

// Database tables - sessions table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [{ indexName: "IDX_session_expire", columns: [table.expire] }]
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replitId: varchar("replit_id", { length: 255 }).unique(),
  username: varchar("username", { length: 255 }),
  email: varchar("email", { length: 255 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url"),
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
