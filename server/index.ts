import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { connectToDatabase } from "./database";

const app = express();
app.use(express.json({ limit: '10mb' })); // Increase payload limit for AI-generated stories
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Simple log function for production
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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
  // Initialize database connection
  try {
    await connectToDatabase();
    log("Database connected successfully");
    
    // Initialize storage after database connection
    const { mongoStorage } = await import("./mongodb-storage");
    mongoStorage.initialize();
    log("Storage initialized successfully");
    
    // Initialize subscription plans
    const { initializeSubscriptionPlans } = await import("./init-subscription-plans");
    await initializeSubscriptionPlans();
    log("Subscription plans initialized");
  } catch (error) {
    log("MongoDB connection failed, continuing with memory storage: " + error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    const viteModule = "./vite.js";
    try {
      const { setupVite } = await import(viteModule);
      await setupVite(app, server);
    } catch (error) {
      log("Vite module not available in production, using static serving");
    }
  }
  
  if (app.get("env") !== "development") {
    // Production static file serving (avoiding vite module dependency)
    const fs = await import("fs");
    const path = await import("path");
    
    const distPath = path.resolve(import.meta.dirname, "public");

    if (!fs.existsSync(distPath)) {
      throw new Error(
        `Could not find the build directory: ${distPath}, make sure to build the client first`,
      );
    }

    app.use(express.static(distPath));

    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  // ALWAYS serve the app on port 5001
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5001;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
