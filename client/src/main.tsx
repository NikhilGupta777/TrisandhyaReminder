import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/alarm-sw.js')
      .then(reg => {
        console.log('Alarm Service Worker registered successfully');
      })
      .catch(err => {
        console.error('Alarm Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
