import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { generateIcebreakers } from "./openai";
import { storage } from "./storage";

const generateIcebreakersSchema = z.object({
  profileText: z.string().min(10, "Profile text must be at least 10 characters").max(5000, "Profile text too long"),
  style: z.enum(["professional", "casual", "creative"]).default("professional"),
});

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate icebreakers endpoint
  app.post("/api/generate-icebreakers", async (req, res) => {
    const startTime = Date.now();
    let analyticsData: any = {
      event: 'icebreaker_generated' as const,
      success: false
    };

    try {
      // Validate request body
      const { profileText, style } = generateIcebreakersSchema.parse(req.body);
      
      analyticsData.style = style;
      analyticsData.profileLength = profileText.length;

      // Generate icebreakers using OpenAI
      const result = await generateIcebreakers(profileText, style);
      
      const generationTime = Date.now() - startTime;
      analyticsData.success = true;
      analyticsData.generationTime = generationTime;

      // Record successful generation
      await storage.recordAnalyticsEvent(analyticsData);

      res.json(result);
    } catch (error) {
      console.error("Generate icebreakers error:", error);
      
      const generationTime = Date.now() - startTime;
      analyticsData.event = 'generation_failed';
      analyticsData.generationTime = generationTime;

      if (error instanceof z.ZodError) {
        analyticsData.errorType = 'validation_error';
        await storage.recordAnalyticsEvent(analyticsData);
        
        return res.status(400).json({
          error: error.errors[0]?.message || "Invalid profile text",
          code: "VALIDATION_ERROR"
        });
      }

      if (error instanceof Error) {
        analyticsData.errorType = getErrorType(error);
        await storage.recordAnalyticsEvent(analyticsData);
        
        // Sanitize OpenAI and other API errors
        const sanitizedMessage = sanitizeErrorMessage(error.message);
        const errorCode = getErrorCode(error.message);
        
        return res.status(500).json({
          error: sanitizedMessage,
          code: errorCode
        });
      }

      analyticsData.errorType = 'unknown_error';
      await storage.recordAnalyticsEvent(analyticsData);

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
      const stats = await storage.getAnalyticsStats(limit);
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
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
