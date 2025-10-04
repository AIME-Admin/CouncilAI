import { randomUUID } from "crypto";
import * as gpt5 from "./agents/gpt5";
import * as claude from "./agents/claude";
import * as gemini from "./agents/gemini";
import * as perplexity from "./agents/perplexity";
import { synthesize } from "./supervisor";
import { type DraftResponse, type Critique, type AskResponse } from "@shared/schema";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export async function processQuestion(question: string): Promise<AskResponse> {
  const startTime = Date.now();
  const queryId = randomUUID();

  console.log(`[Council] Starting query ${queryId.slice(0, 8)}...`);
  console.log(`[Council] Question: "${question}"`);

  console.log("[Council] Phase 1: Collecting drafts from all models...");
  
  const draftPromises = [
    withTimeout(gpt5.getDraft(question), 30000, "gpt5"),
    withTimeout(claude.getDraft(question), 30000, "claude"),
    withTimeout(gemini.getDraft(question), 30000, "gemini"),
    withTimeout(perplexity.getDraft(question), 30000, "perplexity"),
  ];

  const draftResults = await Promise.allSettled(draftPromises);
  const drafts: DraftResponse[] = [];
  
  for (let i = 0; i < draftResults.length; i++) {
    const result = draftResults[i];
    if (result.status === "fulfilled") {
      drafts.push(result.value);
    } else {
      const modelName = ["gpt5", "claude", "gemini", "perplexity"][i];
      console.error(`[Council] ${modelName} draft failed:`, result.reason);
    }
  }
  
  if (drafts.length === 0) {
    throw new Error("All AI models failed to respond. Please try again later.");
  }
  
  console.log(`[Council] Drafts collected from ${drafts.length}/4 models.`);

  console.log("[Council] Phase 2: Cross-critique...");
  const critiquePromises: Promise<Critique>[] = [];
  
  for (const draft of drafts) {
    for (const otherDraft of drafts) {
      if (draft.agent !== otherDraft.agent) {
        let critiquePromise: Promise<Critique>;
        
        if (draft.agent === "gpt5") {
          critiquePromise = withTimeout(gpt5.getCritique(question, otherDraft.agent, otherDraft), 20000, `${draft.agent}-critique`);
        } else if (draft.agent === "claude") {
          critiquePromise = withTimeout(claude.getCritique(question, otherDraft.agent, otherDraft), 20000, `${draft.agent}-critique`);
        } else if (draft.agent === "gemini") {
          critiquePromise = withTimeout(gemini.getCritique(question, otherDraft.agent, otherDraft), 20000, `${draft.agent}-critique`);
        } else if (draft.agent === "perplexity") {
          critiquePromise = withTimeout(perplexity.getCritique(question, otherDraft.agent, otherDraft), 20000, `${draft.agent}-critique`);
        } else {
          continue;
        }
        
        critiquePromises.push(critiquePromise);
      }
    }
  }

  const critiqueResults = await Promise.allSettled(critiquePromises);
  const critiques: Critique[] = [];
  
  for (const result of critiqueResults) {
    if (result.status === "fulfilled") {
      critiques.push(result.value);
    } else {
      console.error("[Council] Critique failed:", result.reason);
    }
  }
  
  console.log(`[Council] Cross-critique complete. ${critiques.filter(c => c.issues.length > 0).length} critiques with issues.`);

  console.log("[Council] Phase 3: Synthesis...");
  const synthesis = synthesize(question, drafts, critiques);
  console.log(`[Council] Synthesis ready. Confidence: ${(synthesis.confidence * 100).toFixed(0)}%`);

  const processingTime = Date.now() - startTime;

  return {
    synthesis,
    drafts,
    critiques,
    processing_time_ms: processingTime,
    timestamp: new Date().toISOString(),
    query_id: queryId,
  };
}
