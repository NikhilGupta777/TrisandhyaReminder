import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedAdmin } from "./seedAdmin";
import { logger } from "./middleware/logger";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add logging middleware
app.use(logger.middleware());

// Initialize app asynchronously
async function initializeApp() {
  const server = await registerRoutes(app);

  await seedAdmin();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Error handling request - logged via middleware

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Only start the server if we're running locally (not in AWS Amplify)
  // AWS Amplify will handle the server lifecycle
  if (!process.env.AWS_EXECUTION_ENV && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || "5000", 10);
    const isWindows = process.platform === "win32";

    const listenOptions = {
      port,
      host: isWindows ? "127.0.0.1" : "0.0.0.0",
      ...(isWindows ? {} : { reusePort: true }),
    } as const;

    server.listen(listenOptions, () => {
      log(`serving on port ${port}`);
    });
  } else {
    // In AWS Amplify, just log that we're ready
    console.log("✅ Express app initialized for AWS Amplify");
  }

  return app;
}

// Initialize the app immediately
const appPromise = initializeApp();

// Export the app for AWS Amplify
// AWS Amplify will import this and handle the requests
export default app;

// Also export as a named export for compatibility
export { app };

// Handle the initialization for local development
appPromise.catch((error) => {
  console.error("Failed to initialize app:", error);
  process.exit(1);
});
