import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url"; // <-- 1. ADD THIS IMPORT

// 2. ADD THESE TWO LINES TO CREATE __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // For Replit HTTPS environment, use wss:// protocol
  const hmrConfig = process.env.REPL_ID
    ? {
        protocol: "wss" as const,
        host: process.env.REPLIT_DOMAINS?.split(",")[0] || undefined,
        clientPort: 443,
        server,
      }
    : { server };

  const serverOptions = {
    middlewareMode: true,
    hmr: hmrConfig,
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  // Serve service worker files from public directory during development
  app.get("/alarm-sw.js", async (req, res) => {
    // 3. FIX: Use __dirname
    const swPath = path.resolve(__dirname, "..", "public", "alarm-sw.js");
    res.type("application/javascript");
    const content = await fs.promises.readFile(swPath, "utf-8");
    res.send(content);
  });

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // 4. FIX: Use __dirname
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In AWS Amplify, static files are served directly from the CDN
  // The compute function only handles dynamic routes
  // Static files are in .amplify-hosting/static/ and served via the manifest routing

  // 5. FIX: Use __dirname.
  // Note: At runtime, __dirname will be .amplify-hosting/compute/default
  // So, path.resolve(__dirname, "public") correctly points to
  // .amplify-hosting/compute/default/public
  const distPath = path.resolve(__dirname, "public");

  if (fs.existsSync(distPath)) {
    console.log(`📁 Serving static files from: ${distPath}`);
    app.use(express.static(distPath));

    // Fall through to index.html for client-side routing
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    // This 'else' block should not run, but it's a good fallback.
    console.log(`📦 Could not find static path: ${distPath}`);
    console.log("📦 AWS Amplify mode: Static files served via CDN");
    // In AWS Amplify, static files are served by CloudFront
    // This compute function only handles API routes and SPA fallback
    // Return a simple response for any unmatched routes
    app.use("*", (_req, res) => {
      res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <title>Loading...</title>
  <meta charset="UTF-8">
</head>
<body>
  <div id="root">
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
      <div>Loading application...</div>
    </div>
  </div>
  <script>
    // Reload to let Amplify's CDN serve the actual frontend
    if (!window.location.search.includes('retry')) {
      window.location.href = window.location.pathname + '?retry=1';
    }
  </script>
</body>
</html>
      `);
    });
  }
}
