import { createHash } from "crypto";
import { db, queries } from "./db";
import { eq } from "drizzle-orm";
import type { AskResponse } from "@shared/schema";

export function hashQuestion(question: string): string {
  return createHash("sha256").update(question.trim().toLowerCase()).digest("hex");
}

export async function getCachedResult(question: string): Promise<AskResponse | null> {
  try {
    const hash = hashQuestion(question);
    const results = await db
      .select()
      .from(queries)
      .where(eq(queries.questionHash, hash))
      .limit(1);

    if (results.length > 0) {
      const cached = results[0];
      console.log(`[Cache] Hit for question hash ${hash.slice(0, 8)}`);
      return cached.responseData as AskResponse;
    }

    console.log(`[Cache] Miss for question hash ${hash.slice(0, 8)}`);
    return null;
  } catch (error) {
    console.error("[Cache] Error retrieving cached result:", error);
    return null;
  }
}

export async function cacheResult(
  question: string,
  response: AskResponse,
  userId?: number
): Promise<void> {
  try {
    const hash = hashQuestion(question);

    await db.insert(queries).values({
      userId: userId || null,
      questionHash: hash,
      question: question,
      responseData: response as any,
      confidence: response.synthesis.confidence,
    });

    console.log(`[Cache] Stored result for question hash ${hash.slice(0, 8)}`);
  } catch (error) {
    console.error("[Cache] Error caching result:", error);
  }
}
