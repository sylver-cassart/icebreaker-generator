import serverless from 'serverless-http';
import express, { type Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import OpenAI from "openai";
import { randomUUID } from "crypto";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Model fallback strategy - use faster models for serverless
const MODELS = ["gpt-3.5-turbo", "gpt-4o-mini"] as const;
type Model = typeof MODELS[number];

// Types
interface IcebreakerResult {
  icebreakers: Array<{
    line1: string;
    line2: string;
  }>;
  notes: string;
}

interface AnalyticsEvent {
  id: string;
  timestamp: Date;
  event: string;
  success?: boolean;
  style?: string;
  profileLength?: number;
  generationTime?: number;
  error?: string;
  errorType?: string;
}

// In-memory storage for analytics (resets on function cold starts)
let analyticsEvents: AnalyticsEvent[] = [];

async function recordAnalyticsEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
  const event: AnalyticsEvent = {
    id: randomUUID(),
    timestamp: new Date(),
    ...eventData
  };
  analyticsEvents.push(event);
  
  // Keep only the last 100 events to prevent memory issues in serverless
  if (analyticsEvents.length > 100) {
    analyticsEvents = analyticsEvents.slice(-100);
  }
}

// Validation schema
const generateIcebreakersSchema = z.object({
  profileText: z.string()
    .min(10, "Profile text must be at least 10 characters")
    .max(2000, "Profile text too long - maximum 2000 characters allowed")
    .refine(text => {
      // Basic spam detection - reject if too many repeated characters
      const repeatedPattern = /(.)\1{10,}/;
      return !repeatedPattern.test(text);
    }, "Invalid input detected")
    .refine(text => {
      // Reject if mostly non-alphabetic characters
      const alphaCount = (text.match(/[a-zA-Z]/g) || []).length;
      return alphaCount > text.length * 0.3;
    }, "Input must contain meaningful text"),
  style: z.enum(["professional", "casual", "creative"]).default("professional"),
});

// Helper functions
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

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
    max_tokens: 600,
    timeout: 20000, // 20 second timeout
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

type IcebreakerStyle = "professional" | "casual" | "creative";

// Timeout wrapper for promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
}

async function generateIcebreakers(profileText: string, style: IcebreakerStyle = "professional"): Promise<IcebreakerResult> {
  // Early validation of API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Invalid or missing OpenAI API key");
  }
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

  console.log('=== STARTING OPENAI GENERATION ===');
  console.log('Available models:', MODELS);
  console.log('Profile text length:', profileText.length);
  console.log('Style:', style);
  console.log('API Key configured:', !!process.env.OPENAI_API_KEY);
  console.log('===================================');
  
  let lastError: Error | null = null;

  // Try each model in order until one succeeds
  for (const model of MODELS) {
    try {
      console.log(`Attempting to generate icebreakers with model: ${model}`);
      // Add timeout wrapper to prevent hanging
      const result = await withTimeout(
        tryGenerateWithModel(model, systemPrompt, profileText),
        20000 // 20 second timeout
      );
      console.log(`Successfully generated icebreakers using model: ${model}`);
      return result;
    } catch (error) {
      console.error(`=== MODEL ${model} ERROR ===`);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('========================');
      
      lastError = error instanceof Error ? error : new Error("Unknown error");
      
      // If it's an API key or quota error, don't try other models
      if (error instanceof Error) {
        if (error.message.includes("API key") || error.message.includes("quota")) {
          console.log('API key or quota error detected, not trying other models');
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

// Helper functions to sanitize error messages
function sanitizeErrorMessage(message: string): string {
  // Common OpenAI error messages that are safe to return
  if (message.includes("Invalid or missing OpenAI API key")) {
    return "API configuration error - please check server settings";
  }
  if (message.includes("OpenAI API quota exceeded")) {
    return "Service quota exceeded - please try again later";
  }
  if (message.includes("Rate limit exceeded")) {
    return "Rate limit exceeded - please try again in a moment";
  }
  if (message.includes("Failed to generate icebreakers")) {
    return "Failed to generate icebreakers - please try again";
  }
  if (message.includes("Invalid response structure")) {
    return "Invalid response received - please try again";
  }
  
  // For any other error, return a generic message
  return "Service temporarily unavailable - please try again";
}

function getErrorCode(message: string): string {
  if (message.includes("API key")) {
    return "API_KEY_ERROR";
  }
  if (message.includes("quota")) {
    return "QUOTA_EXCEEDED";
  }
  if (message.includes("rate limit")) {
    return "RATE_LIMITED";
  }
  if (message.includes("Failed to generate")) {
    return "GENERATION_FAILED";
  }
  if (message.includes("Invalid response")) {
    return "INVALID_RESPONSE";
  }
  
  return "SERVICE_ERROR";
}

function getErrorType(error: unknown): string {
  if (error instanceof Error) {
    const code = getErrorCode(error.message);
    return code.toLowerCase().replace(/_/g, '-');
  }
  return "unknown-error";
}

async function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Enhanced rate limiting for production
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Reduced to 5 requests per minute per IP for better protection
    message: {
      error: "Rate limit exceeded. Maximum 5 requests per minute allowed.",
      code: "RATE_LIMIT_EXCEEDED"
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: true,
  });

  app.use("/api", limiter);

  // Logging middleware for API requests
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        console.log(logLine);
      }
    });

    next();
  });

  // Generate icebreakers endpoint
  app.post("/api/generate-icebreakers", async (req, res) => {
    const startTime = Date.now();
    let analyticsData: any = {
      event: 'icebreaker_generated' as const,
      success: false
    };

    try {
      // Additional security checks
      const userAgent = req.get('User-Agent') || '';
      const contentLength = parseInt(req.get('Content-Length') || '0');
      
      // Block common bot patterns
      const botPatterns = [
        /bot|crawler|spider|scraper/i,
        /curl|wget|postman/i,
        /python|go-http|java|node-fetch/i
      ];
      
      if (botPatterns.some(pattern => pattern.test(userAgent))) {
        return res.status(403).json({
          error: "Automated requests not allowed",
          code: "BOT_DETECTED"
        });
      }

      // Check request size
      if (contentLength > 10000) { // 10KB limit
        return res.status(413).json({
          error: "Request too large",
          code: "PAYLOAD_TOO_LARGE"
        });
      }

      // Validate request body
      const { profileText, style } = generateIcebreakersSchema.parse(req.body);
      
      analyticsData.style = style;
      analyticsData.profileLength = profileText.length;

      console.log("=== STARTING GENERATION ===");
      console.log("Profile text length:", profileText.length);
      console.log("Selected style:", style);
      console.log("OpenAI API Key present:", !!process.env.OPENAI_API_KEY);
      console.log("============================");
      
      // Generate icebreakers using OpenAI
      const result = await generateIcebreakers(profileText, style);
      
      console.log("=== GENERATION SUCCESS ===");
      console.log("Generated icebreakers count:", result.icebreakers?.length || 0);
      console.log("==========================");
      
      const generationTime = Date.now() - startTime;
      analyticsData.success = true;
      analyticsData.generationTime = generationTime;

      // Record successful generation
      await recordAnalyticsEvent(analyticsData);

      res.json(result);
    } catch (error) {
      console.error("=== GENERATION ERROR ===");
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
      console.error("========================");
      
      const generationTime = Date.now() - startTime;
      analyticsData.event = 'generation_failed';
      analyticsData.generationTime = generationTime;

      if (error instanceof z.ZodError) {
        analyticsData.errorType = 'validation_error';
        await recordAnalyticsEvent(analyticsData);
        
        return res.status(400).json({
          error: error.errors[0]?.message || "Invalid profile text",
          code: "VALIDATION_ERROR"
        });
      }

      if (error instanceof Error) {
        analyticsData.errorType = getErrorType(error);
        await recordAnalyticsEvent(analyticsData);
        
        // Sanitize OpenAI and other API errors
        const sanitizedMessage = sanitizeErrorMessage(error.message);
        const errorCode = getErrorCode(error.message);
        
        return res.status(500).json({
          error: sanitizedMessage,
          code: errorCode
        });
      }

      analyticsData.errorType = 'unknown_error';
      await recordAnalyticsEvent(analyticsData);

      res.status(500).json({
        error: "An unexpected error occurred",
        code: "UNKNOWN_ERROR"
      });
    }
  });

  // Analytics endpoint
  app.get("/api/analytics", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      // Simple analytics stats from in-memory storage
      const recentEvents = analyticsEvents.slice(-limit);
      const totalEvents = analyticsEvents.length;
      const successfulGenerations = analyticsEvents.filter(e => e.success).length;
      const successRate = totalEvents > 0 ? (successfulGenerations / totalEvents) * 100 : 0;
      
      const stats = {
        totalEvents,
        successfulGenerations,
        successRate: Math.round(successRate * 100) / 100,
        recentEvents: recentEvents.map(e => ({
          timestamp: e.timestamp,
          event: e.event,
          success: e.success,
          style: e.style,
          generationTime: e.generationTime,
          errorType: e.errorType
        }))
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ 
        error: "Failed to fetch analytics", 
        code: "ANALYTICS_ERROR" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      openaiConfigured: !!process.env.OPENAI_API_KEY
    });
  });

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    
    // Enhanced logging for debugging
    console.error("=== ERROR HANDLER ===");
    console.error("Status:", status);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Error code:", err.code);
    console.error("=====================");
    
    // Sanitize error messages to avoid leaking sensitive information
    let error: string;
    let code: string;
    
    if (status >= 400 && status < 500) {
      // Client errors - safe to return more details
      error = err.message || "Bad Request";
      code = err.code || "CLIENT_ERROR";
    } else {
      // Server errors - return generic message
      error = "Internal Server Error";
      code = "INTERNAL_SERVER_ERROR";
      console.error("Server error:", err);
    }

    res.status(status).json({ error, code });
  });

  return app;
}

// Cache the handler for performance
let handler: any;

export default async (req: any, res: any) => {
  if (!handler) {
    const app = await createApp();
    handler = serverless(app);
  }
  return handler(req, res);
};