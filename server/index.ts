import express, { type Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per window per IP
  message: {
    error: "Rate limit exceeded",
    code: "RATE_LIMIT_EXCEEDED"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    
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
    
    // Don't re-throw the error to avoid crashing the process
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // Only set up Vite and server in development
    if (server) {
      await setupVite(app, server);
      
      // ALWAYS serve the app on the port specified in the environment variable PORT
      // Other ports are firewalled. Default to 5000 if not specified.
      // this serves both the API and the client.
      // It is the only port that is not firewalled.
      const port = parseInt(process.env.PORT || '5000', 10);
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
      });
    }
  } else {
    serveStatic(app);
  }
})();
