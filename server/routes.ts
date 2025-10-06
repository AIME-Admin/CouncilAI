import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { askRequestSchema, PLAN_CONFIG } from "@shared/schema";
import { processQuestion } from "./orchestrator";
import { randomUUID } from "crypto";
import { getCachedResult, cacheResult } from "./cache";
import { sendError } from "./websocket";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { createCheckoutSession, handleWebhook, stripe } from "./stripe";

const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // User queries endpoint (with path parameters to match frontend)
  app.get("/api/queries/:page/:limit", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const page = parseInt(req.params.page) || 0;
      const limit = parseInt(req.params.limit) || 50;
      const offset = page * limit;
      
      const queries = await storage.getUserQueries(user.id, limit, offset);
      res.json(queries);
    } catch (error) {
      console.error("Error fetching queries:", error);
      res.status(500).json({ message: "Failed to fetch queries" });
    }
  });

  // User preferences endpoint
  app.get("/api/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const preferences = await storage.getUserPreferences(user.id);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Update preferences endpoint
  app.post("/api/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const preferences = await storage.upsertUserPreferences({
        userId: user.id,
        ...req.body,
      });
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Stripe checkout session
  app.post("/api/stripe/create-checkout-session", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { planTier } = req.body;
      if (!planTier) {
        return res.status(400).json({ error: "Plan tier required" });
      }

      const session = await createCheckoutSession(user.id, user.email!, planTier);
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Stripe webhook
  app.post("/api/stripe/webhook", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).json({ error: "No signature" });
    }

    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error("[Stripe] STRIPE_WEBHOOK_SECRET not set");
        return res.status(500).json({ error: "Webhook not configured" });
      }

      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );

      await handleWebhook(event);
      res.json({ received: true });
    } catch (error) {
      console.error("[Stripe] Webhook error:", error);
      res.status(400).json({ error: "Webhook error" });
    }
  });
  app.post("/api/ask", async (req: any, res) => {
    try {
      const validated = askRequestSchema.parse(req.body);
      const useStreaming = req.query.stream === "true";
      const useCache = req.query.cache !== "false";
      
      // Get user if authenticated
      let user = null;
      let userId: number | undefined = undefined;
      
      if (req.isAuthenticated?.()) {
        user = req.user;
        userId = user?.id;
        
        // Check quota for authenticated users
        if (user && user.quotaRemaining <= 0) {
          return res.status(403).json({
            error: "Quota exceeded",
            message: "You've used all your queries. Please upgrade your plan.",
            quotaRemaining: 0,
          });
        }
      }
      
      console.log("\n" + "=".repeat(80));
      console.log(`[Council] New question received: "${validated.question}"`);
      console.log(`[Council] User: ${user ? user.email : "anonymous"}`);
      console.log(`[Council] Streaming: ${useStreaming}, Cache: ${useCache}`);
      console.log("=".repeat(80) + "\n");

      if (useCache) {
        const cachedResult = await getCachedResult(validated.question);
        if (cachedResult) {
          console.log("[Council] Returning cached result");
          res.json({ ...cachedResult, cached: true });
          return;
        }
      }

      const streamQueryId = useStreaming ? randomUUID() : undefined;
      
      if (useStreaming && streamQueryId) {
        res.json({ query_id: streamQueryId });
        
        setTimeout(() => {
          processQuestion(validated.question, streamQueryId)
            .then(async result => {
              if (useCache) {
                await cacheResult(validated.question, result, userId);
              }
              
              // Save query to database for history
              if (user) {
                const crypto = await import('crypto');
                const questionHash = crypto.createHash('sha256')
                  .update(validated.question.toLowerCase().trim())
                  .digest('hex')
                  .slice(0, 16);
                  
                await storage.createQuery({
                  userId: user.id,
                  questionHash,
                  question: validated.question,
                  responseData: result as any,
                  confidence: result.synthesis.confidence,
                });
              }
              
              // Decrement quota for authenticated users
              if (user) {
                const newQueriesUsed = user.queriesUsed + 1;
                const newQuotaRemaining = user.quotaRemaining - 1;
                await storage.updateUserQuota(user.id, newQueriesUsed, newQuotaRemaining);
              }
            })
            .catch(error => {
              console.error("[Council] Streaming error:", error);
              sendError(streamQueryId, error as Error);
            });
        }, 100);
        
        return;
      }

      const result = await processQuestion(validated.question);
      
      if (useCache) {
        await cacheResult(validated.question, result, userId);
      }
      
      // Save query to database for history
      if (user) {
        const crypto = await import('crypto');
        const questionHash = crypto.createHash('sha256')
          .update(validated.question.toLowerCase().trim())
          .digest('hex')
          .slice(0, 16);
          
        await storage.createQuery({
          userId: user.id,
          questionHash,
          question: validated.question,
          responseData: result as any,
          confidence: result.synthesis.confidence,
        });
      }
      
      // Decrement quota for authenticated users
      let newQuotaRemaining = 0;
      if (user) {
        const newQueriesUsed = user.queriesUsed + 1;
        newQuotaRemaining = user.quotaRemaining - 1;
        await storage.updateUserQuota(user.id, newQueriesUsed, newQuotaRemaining);
      }

      console.log("\n" + "=".repeat(80));
      console.log(`[Council] Query complete!`);
      console.log(`[Council] Confidence: ${(result.synthesis.confidence * 100).toFixed(0)}%`);
      console.log(`[Council] Processing time: ${result.processing_time_ms}ms`);
      console.log(`[Council] Citations: ${result.synthesis.citations.length}`);
      console.log(`[Council] Dissent points: ${result.synthesis.dissent.length}`);
      if (user) {
        console.log(`[Council] User quota remaining: ${newQuotaRemaining}`);
      }
      console.log("=".repeat(80) + "\n");

      res.json(result);
    } catch (error) {
      console.error("[Council] Error processing question:", error);
      
      if (error instanceof Error) {
        res.status(400).json({
          error: error.message,
          details: error.stack,
        });
      } else {
        res.status(500).json({
          error: "An unexpected error occurred",
        });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
