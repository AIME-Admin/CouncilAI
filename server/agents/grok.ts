import OpenAI from "openai";
import { type DraftResponse, type Critique } from "@shared/schema";

// xAI Grok - accessed via OpenAI-compatible API
const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function getDraft(question: string): Promise<DraftResponse> {
  console.log("[Grok] Generating draft...");

  try {
    const response = await grok.chat.completions.create({
      model: "grok-3",
      messages: [
        {
          role: "system",
          content: `You are a fact-checking AI. Provide a structured answer with specific claims supported by credible sources.
Format your response as JSON with:
{
  "claims": [{"text": "claim statement", "support": ["source URL 1", "source URL 2"]}],
  "confidence": 0.0-1.0
}
Be precise and cite real sources where possible.`,
        },
        {
          role: "user",
          content: question,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      agent: "grok",
      claims: result.claims || [],
      confidence: Math.min(1, Math.max(0, result.confidence || 0.7)),
    };
  } catch (error) {
    console.error("[Grok] Error:", error);
    throw error;
  }
}

export async function getCritique(
  question: string,
  targetAgent: string,
  targetDraft: DraftResponse
): Promise<Critique> {
  console.log(`[Grok] Critiquing ${targetAgent}'s draft...`);

  try {
    const response = await grok.chat.completions.create({
      model: "grok-3",
      messages: [
        {
          role: "system",
          content: `You are reviewing another AI's answer. Identify any factual errors, logical inconsistencies, or unsupported claims.
Respond with JSON: {"issues": ["issue 1", "issue 2", ...]}`,
        },
        {
          role: "user",
          content: `Original question: ${question}\n\nAnswer to review:\n${JSON.stringify(targetDraft.claims, null, 2)}\n\nWhat issues do you find?`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      reviewer: "grok",
      target: targetAgent as any,
      issues: result.issues || [],
    };
  } catch (error) {
    console.error("[Grok] Critique error:", error);
    return {
      reviewer: "grok",
      target: targetAgent as any,
      issues: [],
    };
  }
}
