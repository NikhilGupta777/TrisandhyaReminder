import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// --- START OF REQUIRED FIX ---
// 1. Import the Amplify libraries
import { Amplify } from 'aws-amplify';
// 2. Import the auto-generated configuration file from your backend folder
// @ts-ignore - File generated at build time
import outputs from '../../amplify_outputs.json';

// 3. Configure Amplify *before* your app renders
Amplify.configure(outputs);
// --- END OF REQUIRED FIX ---


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/alarm-sw.js', {
      scope: '/',
      updateViaCache: 'none'
    })
      .then(reg => {
        // Service Worker registration successful
        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                if (confirm('A new version is available. Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch(err => {
        // Service Worker registration failed - handle silently in production
        console.error('Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
