import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedAdmin } from "./seedAdmin";
import { logger } from "./middleware/logger";

// CRITICAL FIX: Force production mode in AWS Amplify environment
// AWS Amplify doesn't automatically set NODE_ENV=production, which causes
// the server to try loading Vite dev server (which doesn't exist in production)
if (process.env.AWS_EXECUTION_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AMPLIFY_BRANCH) {
  process.env.NODE_ENV = "production";
  console.log("🔧 Detected AWS environment - forcing NODE_ENV=production");
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add logging middleware
app.use(logger.middleware());

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Async initialization function
async function initialize() {
  if (isInitialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    console.log("🚀 Starting server initialization...");

    try {
      // Create HTTP server (needed for WebSocket in registerRoutes)
      const server = createServer(app);

      // Register routes and setup WebSocket
      await registerRoutes(app, server);
      console.log("✅ Routes and WebSocket registered");

      // Seed admin users
      await seedAdmin();
      console.log("✅ Admin seeding complete");

      // Error handler middleware (must be last)
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error("❌ Request error:", { status, message, stack: err.stack });
        res.status(status).json({ message });
      });

      // Setup Vite in development or serve static files in production
      if (app.get("env") === "development") {
        await setupVite(app, server);
        console.log("✅ Vite dev server configured");
      } else {
        serveStatic(app);
        console.log("✅ Static file serving configured");
      }

      // AWS Amplify Hosting requires compute functions to listen on port 3000
      // We use PORT env var which AWS Amplify sets to 3000, with fallback to 3000
      // Local development can override with PORT=5000
      const port = parseInt(process.env.PORT || "3000", 10);
      const isWindows = process.platform === "win32";

      const listenOptions = {
        port,
        host: isWindows ? "127.0.0.1" : "0.0.0.0",
        ...(isWindows ? {} : { reusePort: true }),
      } as const;

      // --------------------- THIS IS THE FIX ---------------------
      // Only call .listen() when running locally, NOT in AWS environment
      if (!process.env.AWS_EXECUTION_ENV && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
        // Start the server for local development
        server.listen(listenOptions, () => {
          log(`serving on port ${port}`);
          console.log("🌐 Server listening locally");
        });
      } else {
        // Log that we are in Amplify and NOT starting a server
        console.log("✅ Express app initialized for AWS Amplify");
      }
      // ------------------- END OF THE FIX -------------------

      isInitialized = true;
      console.log("🎉 Server initialization complete!");
    } catch (error) {
      console.error("❌ Server initialization failed:", error);
      throw error;
    }
  })();

  return initializationPromise;
}

// Middleware to ensure initialization completes before processing requests
app.use(async (req, res, next) => {
  try {
    await initialize();
    next();
  } catch (error) {
    console.error("Failed to initialize app:", error);
    res.status(500).json({
      message: "Server initialization failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Start initialization immediately (for AWS Amplify cold starts)
initialize().catch((error) => {
  console.error("❌ Fatal initialization error:", error);
  process.exit(1);
});

// Export the app for any tools that might need it
export default app;
export { app };
