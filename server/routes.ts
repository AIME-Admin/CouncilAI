import type { Express } from "express";
import { createServer, type Server } from "http";
import { askRequestSchema } from "@shared/schema";
import { processQuestion } from "./orchestrator";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/ask", async (req, res) => {
    try {
      const validated = askRequestSchema.parse(req.body);
      
      console.log("\n" + "=".repeat(80));
      console.log(`[Council] New question received: "${validated.question}"`);
      console.log("=".repeat(80) + "\n");

      const result = await processQuestion(validated.question);

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
