import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { generateIcebreakers } from "./openai";

const generateIcebreakersSchema = z.object({
  profileText: z.string().min(10, "Profile text must be at least 10 characters").max(5000, "Profile text too long"),
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate icebreakers endpoint
  app.post("/api/generate-icebreakers", async (req, res) => {
    try {
      // Validate request body
      const { profileText } = generateIcebreakersSchema.parse(req.body);

      // Generate icebreakers using OpenAI
      const result = await generateIcebreakers(profileText);

      res.json(result);
    } catch (error) {
      console.error("Generate icebreakers error:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: error.errors[0]?.message || "Invalid profile text",
          code: "VALIDATION_ERROR"
        });
      }

      if (error instanceof Error) {
        // Sanitize OpenAI and other API errors
        const sanitizedMessage = sanitizeErrorMessage(error.message);
        const errorCode = getErrorCode(error.message);
        
        return res.status(500).json({
          error: sanitizedMessage,
          code: errorCode
        });
      }

      res.status(500).json({
        error: "An unexpected error occurred",
        code: "UNKNOWN_ERROR"
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
