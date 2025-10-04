import type { Express } from "express";
import { createServer, type Server } from "http";
import { askRequestSchema } from "@shared/schema";
import { processQuestion } from "./orchestrator";
import { randomUUID } from "crypto";
import { getCachedResult, cacheResult } from "./cache";
import { sendError } from "./websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/ask", async (req, res) => {
    try {
      const validated = askRequestSchema.parse(req.body);
      const useStreaming = req.query.stream === "true";
      const useCache = req.query.cache !== "false";
      
      console.log("\n" + "=".repeat(80));
      console.log(`[Council] New question received: "${validated.question}"`);
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
            .then(result => {
              if (useCache) {
                return cacheResult(validated.question, result);
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
        await cacheResult(validated.question, result);
      }

      console.log("\n" + "=".repeat(80));
      console.log(`[Council] Query complete!`);
      console.log(`[Council] Confidence: ${(result.synthesis.confidence * 100).toFixed(0)}%`);
      console.log(`[Council] Processing time: ${result.processing_time_ms}ms`);
      console.log(`[Council] Citations: ${result.synthesis.citations.length}`);
      console.log(`[Council] Dissent points: ${result.synthesis.dissent.length}`);
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
