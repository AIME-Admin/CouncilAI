import { randomUUID } from "crypto";
import * as gpt5 from "./agents/gpt5";
import * as claude from "./agents/claude";
import * as gemini from "./agents/gemini";
import * as perplexity from "./agents/perplexity";
import { synthesize } from "./supervisor";
import { type DraftResponse, type Critique, type AskResponse } from "@shared/schema";

export async function processQuestion(question: string): Promise<AskResponse> {
  const startTime = Date.now();
  const queryId = randomUUID();

  console.log(`[Council] Starting query ${queryId.slice(0, 8)}...`);
  console.log(`[Council] Question: "${question}"`);

  console.log("[Council] Phase 1: Collecting drafts from all models...");
  const draftPromises = [
    gpt5.getDraft(question),
    claude.getDraft(question),
    gemini.getDraft(question),
    perplexity.getDraft(question),
  ];

  const drafts = await Promise.all(draftPromises);
  console.log(`[Council] Drafts collected from ${drafts.length} models.`);

  console.log("[Council] Phase 2: Cross-critique...");
  const critiquePromises: Promise<Critique>[] = [];
  
  for (const draft of drafts) {
    for (const otherDraft of drafts) {
      if (draft.agent !== otherDraft.agent) {
        if (draft.agent === "gpt5") {
          critiquePromises.push(gpt5.getCritique(question, otherDraft.agent, otherDraft));
        } else if (draft.agent === "claude") {
          critiquePromises.push(claude.getCritique(question, otherDraft.agent, otherDraft));
        } else if (draft.agent === "gemini") {
          critiquePromises.push(gemini.getCritique(question, otherDraft.agent, otherDraft));
        } else if (draft.agent === "perplexity") {
          critiquePromises.push(perplexity.getCritique(question, otherDraft.agent, otherDraft));
        }
      }
    }
  }

  const critiques = await Promise.all(critiquePromises);
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
