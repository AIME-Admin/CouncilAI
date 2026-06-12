import Anthropic from '@anthropic-ai/sdk';
import { type DraftResponse, type Critique } from "@shared/schema";

// claude-fable-5 is Anthropic's most capable widely released model (June 2026)
const DRAFT_MODEL = "claude-fable-5";
// claude-sonnet-4-6 is the best speed/intelligence balance, used for critiques
const CRITIQUE_MODEL = "claude-sonnet-4-6";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function getDraft(question: string): Promise<DraftResponse> {
  console.log("[Claude] Generating draft...");

  try {
    const response = await anthropic.messages.create({
      model: DRAFT_MODEL,
      max_tokens: 2048,
      system: `You are a fact-checking AI. Provide a structured answer with specific claims supported by credible sources.
Respond with JSON in this format:
{
  "claims": [{"text": "claim statement", "support": ["source URL 1", "source URL 2"]}],
  "confidence": 0.0-1.0
}
Be precise and cite real sources where possible.`,
      messages: [{ role: "user", content: question }],
    });

    const content = response.content[0];
    if (content.type === "text") {
      try {
        let textContent = content.text.trim();
        const jsonMatch = textContent.match(/```json\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) textContent = jsonMatch[1];

        const result = JSON.parse(textContent);
        return {
          agent: "claude",
          claims: result.claims || [],
          confidence: Math.min(1, Math.max(0, result.confidence || 0.7)),
        };
      } catch {
        console.log("[Claude] Response was not JSON, likely refused:", content.text.slice(0, 100));
        return {
          agent: "claude",
          claims: [{ text: `Claude declined to answer: ${content.text.slice(0, 200)}`, support: [] }],
          confidence: 0.1,
        };
      }
    }

    throw new Error("Unexpected response format");
  } catch (error) {
    console.error("[Claude] Error:", error);
    throw error;
  }
}

export async function getCritique(
  question: string,
  targetAgent: string,
  targetDraft: DraftResponse
): Promise<Critique> {
  console.log(`[Claude] Critiquing ${targetAgent}'s draft...`);

  try {
    const response = await anthropic.messages.create({
      model: CRITIQUE_MODEL,
      max_tokens: 1024,
      system: `You are reviewing another AI's answer. Identify any factual errors, logical inconsistencies, or unsupported claims.
Respond with JSON: {"issues": ["issue 1", "issue 2", ...]}`,
      messages: [
        {
          role: "user",
          content: `Original question: ${question}\n\nAnswer to review:\n${JSON.stringify(targetDraft.claims, null, 2)}\n\nWhat issues do you find?`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === "text") {
      let textContent = content.text.trim();
      const jsonMatch = textContent.match(/```json\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) textContent = jsonMatch[1];

      const result = JSON.parse(textContent);
      return {
        reviewer: "claude",
        target: targetAgent as any,
        issues: result.issues || [],
      };
    }

    throw new Error("Unexpected response format");
  } catch (error) {
    console.error("[Claude] Critique error:", error);
    return { reviewer: "claude", target: targetAgent as any, issues: [] };
  }
}
