import Anthropic from '@anthropic-ai/sdk';
import { type DraftResponse, type Critique } from "@shared/schema";

// The newest Anthropic model is "claude-sonnet-4-20250514"
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function getDraft(question: string): Promise<DraftResponse> {
  console.log("[Claude] Generating draft...");
  
  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 2048,
      system: `You are a fact-checking AI. Provide a structured answer with specific claims supported by credible sources. 
Respond with JSON in this format:
{
  "claims": [{"text": "claim statement", "support": ["source URL 1", "source URL 2"]}],
  "confidence": 0.0-1.0
}
Be precise and cite real sources where possible.`,
      messages: [
        {
          role: 'user',
          content: question
        }
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        const result = JSON.parse(content.text);
        
        return {
          agent: "claude",
          claims: result.claims || [],
          confidence: Math.min(1, Math.max(0, result.confidence || 0.7)),
        };
      } catch (parseError) {
        // Claude refused or didn't provide JSON - return a low-confidence placeholder
        console.log("[Claude] Response was not JSON, likely refused:", content.text.slice(0, 100));
        return {
          agent: "claude",
          claims: [{
            text: `Claude declined to answer: ${content.text.slice(0, 200)}`,
            support: []
          }],
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
      model: DEFAULT_MODEL_STR,
      max_tokens: 1024,
      system: `You are reviewing another AI's answer. Identify any factual errors, logical inconsistencies, or unsupported claims.
Respond with JSON: {"issues": ["issue 1", "issue 2", ...]}`,
      messages: [
        {
          role: 'user',
          content: `Original question: ${question}\n\nAnswer to review:\n${JSON.stringify(targetDraft.claims, null, 2)}\n\nWhat issues do you find?`
        }
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const result = JSON.parse(content.text);
      
      return {
        reviewer: "claude",
        target: targetAgent as any,
        issues: result.issues || [],
      };
    }
    
    throw new Error("Unexpected response format");
  } catch (error) {
    console.error("[Claude] Critique error:", error);
    return {
      reviewer: "claude",
      target: targetAgent as any,
      issues: [],
    };
  }
}
