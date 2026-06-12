import { type DraftResponse, type Critique } from "@shared/schema";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

export async function getDraft(question: string): Promise<DraftResponse> {
  console.log("[Perplexity] Generating draft...");

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-reasoning-pro",
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
        temperature: 0.2,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Perplexity] API error response:", errorText);
      throw new Error(`Perplexity API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { claims: [], confidence: 0.5 };

    const citations = data.citations || [];
    if (result.claims && result.claims.length > 0 && citations.length > 0) {
      result.claims.forEach((claim: any) => {
        if (!claim.support || claim.support.length === 0) {
          claim.support = citations.slice(0, Math.min(2, citations.length));
        }
      });
    }

    return {
      agent: "perplexity",
      claims: result.claims || [],
      confidence: Math.min(1, Math.max(0, result.confidence || 0.7)),
    };
  } catch (error) {
    console.error("[Perplexity] Error:", error);
    throw error;
  }
}

export async function getCritique(
  question: string,
  targetAgent: string,
  targetDraft: DraftResponse
): Promise<Critique> {
  console.log(`[Perplexity] Critiquing ${targetAgent}'s draft...`);

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-reasoning-pro",
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
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Perplexity] API error response:", errorText);
      throw new Error(`Perplexity API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { issues: [] };

    return {
      reviewer: "perplexity",
      target: targetAgent as any,
      issues: result.issues || [],
    };
  } catch (error) {
    console.error("[Perplexity] Critique error:", error);
    return {
      reviewer: "perplexity",
      target: targetAgent as any,
      issues: [],
    };
  }
}
