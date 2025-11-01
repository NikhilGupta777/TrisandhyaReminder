import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url"; // <-- 1. ADD THIS IMPORT

// 2. ADD THESE TWO LINES TO CREATE __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer()
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner()
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      // 3. FIX ALL ALIASES to use __dirname
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  // 4. FIX ROOT to use __dirname
  root: path.resolve(__dirname, "client"),
  build: {
    // 5. FIX OUTDIR to use __dirname
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    hmr: process.env.REPL_ID
      ? {
          protocol: "wss",
          clientPort: 443,
        }
      : true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
