import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Model fallback strategy
const MODELS = ["gpt-5", "gpt-4o"] as const;
type Model = typeof MODELS[number];

export interface IcebreakerResult {
  icebreakers: Array<{
    line1: string;
    line2: string;
  }>;
  notes: string;
}

// Helper function to count words in a string
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Validate icebreaker response meets constraints
function validateIcebreakerResponse(result: any): boolean {
  if (!result.icebreakers || !Array.isArray(result.icebreakers) || result.icebreakers.length !== 3) {
    return false;
  }

  for (const icebreaker of result.icebreakers) {
    if (!icebreaker.line1 || !icebreaker.line2) {
      return false;
    }
    
    // Check word count constraints (≤18 words per line)
    if (countWords(icebreaker.line1) > 18 || countWords(icebreaker.line2) > 18) {
      return false;
    }
  }

  return true;
}

// Try to generate icebreakers with a specific model
async function tryGenerateWithModel(model: Model, systemPrompt: string, profileText: string): Promise<IcebreakerResult> {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `INPUT_PROFILE:\n${profileText}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 800,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  
  if (!validateIcebreakerResponse(result)) {
    throw new Error("Invalid response structure from OpenAI");
  }

  return {
    icebreakers: result.icebreakers,
    notes: result.notes || "Generated personalized icebreakers based on profile analysis",
  };
}

export type IcebreakerStyle = "professional" | "casual" | "creative";

export async function generateIcebreakers(profileText: string, style: IcebreakerStyle = "professional"): Promise<IcebreakerResult> {
  // Define style-specific tone instructions
  const styleInstructions = {
    professional: "Maintain a formal, business-focused tone. Use industry terminology appropriately. Be respectful and polite. Focus on business value and professional achievements.",
    casual: "Use a friendly, conversational tone. Be warm and approachable. Use contractions and informal language where appropriate. Focus on shared interests and human connections.", 
    creative: "Be engaging and memorable. Use creative analogies or unexpected angles. Show personality while remaining professional. Stand out from typical outreach messages."
  };

  const systemPrompt = `You are an assistant that writes concise, personal, 2-line outreach icebreakers for cold emails or LinkedIn DMs.

Goal

Given copied text from a person's LinkedIn profile (headline, about, experience, featured posts, skills), produce 3 alternative icebreakers tailored to them. Each icebreaker is 2 short lines:

Line 1 = personalised hook (specific detail you noticed)

Line 2 = value bridge (why I'm reaching out + relevant payoff)

Personalisation signals (use at least 2)

Recent role/company, product, industry focus

Metrics/achievements (growth %, ARR, awards)

Content themes from posts/newsletters

Tech stack or tools

Geography / market segment

Mutual interests or niche expertise

Style Instructions for ${style.toUpperCase()} tone:
${styleInstructions[style]}

General Tone Guidelines

Australian spelling. No emojis. No fluff.

No generic compliments ("great profile"). Be specific.

No hard sell. No scheduling links. No "quick call?" asks.

Avoid spammy words: "synergy, groundbreaking, disrupt, unparalleled".

Output rules

Return JSON only with this shape:
{
"icebreakers": [
{"line1": "…", "line2": "…"},
{"line1": "…", "line2": "…"},
{"line1": "…", "line2": "…"}
],
"notes": "1 sentence on the angle you chose"
}

Each line ≤ 18 words. No quotes. No bullets. No names unless necessary for clarity.

If profile text is too thin, infer from what's there and stay general but still useful.

Context you can use about me (the sender)

I'm a brand, web & product designer who also sets up AI automations (Zapier/n8n) to save teams time and money. I help founders, marketers and SMEs turn manual processes into simple tools (reporting, onboarding, lead follow-ups, content ops).`;

  let lastError: Error | null = null;

  // Try each model in order until one succeeds
  for (const model of MODELS) {
    try {
      console.log(`Attempting to generate icebreakers with model: ${model}`);
      const result = await tryGenerateWithModel(model, systemPrompt, profileText);
      console.log(`Successfully generated icebreakers using model: ${model}`);
      return result;
    } catch (error) {
      console.error(`Model ${model} failed:`, error);
      lastError = error instanceof Error ? error : new Error("Unknown error");
      
      // If it's an API key or quota error, don't try other models
      if (error instanceof Error) {
        if (error.message.includes("API key") || error.message.includes("quota")) {
          break;
        }
      }
      
      // Continue to next model for other errors
      continue;
    }
  }

  // All models failed, throw the last error with improved messaging
  console.error("All models failed, throwing last error:", lastError);
  
  if (lastError instanceof Error) {
    if (lastError.message.includes("API key")) {
      throw new Error("Invalid or missing OpenAI API key");
    }
    if (lastError.message.includes("quota")) {
      throw new Error("OpenAI API quota exceeded");
    }
    if (lastError.message.includes("rate limit")) {
      throw new Error("Rate limit exceeded - please try again in a moment");
    }
    if (lastError.message.includes("Invalid response structure")) {
      throw new Error("Invalid response structure from OpenAI");
    }
  }
  
  throw new Error("Failed to generate icebreakers - please try again");
}