import serverless from 'serverless-http';
import express, { type Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { registerRoutes } from '../server/routes';

async function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Enhanced rate limiting for production
  // Note: Rate limiting won't persist across serverless instances
  // For production, consider using an external store like Redis
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Reduced to 5 requests per minute per IP for better protection
    message: {
      error: "Rate limit exceeded. Maximum 5 requests per minute allowed.",
      code: "RATE_LIMIT_EXCEEDED"
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests for some endpoints
    skipSuccessfulRequests: false,
    // Skip failed requests
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

  // Register API routes (without creating a server)
  await registerRoutes(app);

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