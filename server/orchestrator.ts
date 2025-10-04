import { randomUUID } from "crypto";
import * as gpt5 from "./agents/gpt5";
import * as claude from "./agents/claude";
import * as gemini from "./agents/gemini";
import * as perplexity from "./agents/perplexity";
import { synthesize } from "./supervisor";
import { type DraftResponse, type Critique, type AskResponse } from "@shared/schema";
import { sendStreamMessage } from "./websocket";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export async function processQuestion(question: string, streamQueryId?: string): Promise<AskResponse> {
  const startTime = Date.now();
  const queryId = streamQueryId || randomUUID();

  console.log(`[Council] Starting query ${queryId.slice(0, 8)}...`);
  console.log(`[Council] Question: "${question}"`);

  if (streamQueryId) {
    sendStreamMessage(queryId, {
      type: "draft",
      phase: "Starting draft collection from 4 AI models...",
    });
  }

  console.log("[Council] Phase 1: Collecting drafts from all models...");
  
  const modelNames = ["gpt5", "claude", "gemini", "perplexity"];
  const draftFunctions = [gpt5.getDraft, claude.getDraft, gemini.getDraft, perplexity.getDraft];
  
  const drafts: DraftResponse[] = [];
  
  const draftPromises = draftFunctions.map(async (getDraft, index) => {
    try {
      const modelName = modelNames[index];
      const draft = await withTimeout(getDraft(question), 30000, modelName);
      drafts.push(draft);
      
      if (streamQueryId) {
        sendStreamMessage(queryId, {
          type: "draft",
          agent: draft.agent,
          data: draft,
          phase: `${modelName} draft complete`,
        });
      }
      
      return draft;
    } catch (error) {
      const modelName = modelNames[index];
      console.error(`[Council] ${modelName} draft failed:`, error);
      
      if (streamQueryId) {
        sendStreamMessage(queryId, {
          type: "error",
          agent: modelName,
          message: `${modelName} failed to respond`,
        });
      }
      
      return null;
    }
  });

  await Promise.all(draftPromises);
  
  if (drafts.length === 0) {
    throw new Error("All AI models failed to respond. Please try again later.");
  }
  
  console.log(`[Council] Drafts collected from ${drafts.length}/4 models.`);

  if (streamQueryId) {
    sendStreamMessage(queryId, {
      type: "critique",
      phase: "Starting cross-critique phase...",
    });
  }

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

  if (streamQueryId) {
    sendStreamMessage(queryId, {
      type: "synthesis",
      phase: "Synthesizing consensus...",
    });
  }

  console.log("[Council] Phase 3: Synthesis...");
  const synthesis = synthesize(question, drafts, critiques);
  console.log(`[Council] Synthesis ready. Confidence: ${(synthesis.confidence * 100).toFixed(0)}%`);
  
  if (streamQueryId) {
    sendStreamMessage(queryId, {
      type: "synthesis",
      data: synthesis,
      phase: "Synthesis complete",
    });
  }

  const processingTime = Date.now() - startTime;

  const response: AskResponse = {
    synthesis,
    drafts,
    critiques,
    processing_time_ms: processingTime,
    timestamp: new Date().toISOString(),
    query_id: queryId,
  };

  if (streamQueryId) {
    sendStreamMessage(queryId, {
      type: "complete",
      data: response,
    });
  }

  return response;
}
