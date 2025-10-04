import { GoogleGenAI } from "@google/genai";
import { type DraftResponse, type Critique } from "@shared/schema";

// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getDraft(question: string): Promise<DraftResponse> {
  console.log("[Gemini] Generating draft...");
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: `You are a fact-checking AI. Provide a structured answer with specific claims supported by credible sources. 
Respond with JSON in this format:
{
  "claims": [{"text": "claim statement", "support": ["source URL 1", "source URL 2"]}],
  "confidence": 0.0-1.0
}
Be precise and cite real sources where possible.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            claims: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  support: { type: "array", items: { type: "string" } }
                },
                required: ["text", "support"]
              }
            },
            confidence: { type: "number" }
          },
          required: ["claims", "confidence"]
        }
      },
      contents: question,
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      agent: "gemini",
      claims: result.claims || [],
      confidence: Math.min(1, Math.max(0, result.confidence || 0.7)),
    };
  } catch (error) {
    console.error("[Gemini] Error:", error);
    throw error;
  }
}

export async function getCritique(
  question: string,
  targetAgent: string,
  targetDraft: DraftResponse
): Promise<Critique> {
  console.log(`[Gemini] Critiquing ${targetAgent}'s draft...`);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are reviewing another AI's answer. Identify any factual errors, logical inconsistencies, or unsupported claims.
Respond with JSON: {"issues": ["issue 1", "issue 2", ...]}`,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            issues: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["issues"]
        }
      },
      contents: `Original question: ${question}\n\nAnswer to review:\n${JSON.stringify(targetDraft.claims, null, 2)}\n\nWhat issues do you find?`,
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      reviewer: "gemini",
      target: targetAgent as any,
      issues: result.issues || [],
    };
  } catch (error) {
    console.error("[Gemini] Critique error:", error);
    return {
      reviewer: "gemini",
      target: targetAgent as any,
      issues: [],
    };
  }
}
