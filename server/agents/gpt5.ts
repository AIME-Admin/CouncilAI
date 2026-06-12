import OpenAI from "openai";
import { type DraftResponse, type Critique } from "@shared/schema";

// gpt-5.5 is OpenAI's latest flagship model (May 2026)
const MODEL = "gpt-5.5";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getDraft(question: string): Promise<DraftResponse> {
  console.log("[GPT-5.5] Generating draft...");

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
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
        { role: "user", content: question },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      agent: "gpt5",
      claims: result.claims || [],
      confidence: Math.min(1, Math.max(0, result.confidence || 0.7)),
    };
  } catch (error) {
    console.error("[GPT-5.5] Error:", error);
    throw error;
  }
}

export async function getCritique(
  question: string,
  targetAgent: string,
  targetDraft: DraftResponse
): Promise<Critique> {
  console.log(`[GPT-5.5] Critiquing ${targetAgent}'s draft...`);

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
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
      max_completion_tokens: 1024,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      reviewer: "gpt5",
      target: targetAgent as any,
      issues: result.issues || [],
    };
  } catch (error) {
    console.error("[GPT-5.5] Critique error:", error);
    return { reviewer: "gpt5", target: targetAgent as any, issues: [] };
  }
}
