import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for PWA and background notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('[App] Service Worker registered successfully:', registration);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000);
      })
      .catch((err) => console.log('[App] Service Worker registration failed:', err));
  });
}

// Request notification permission immediately
if ('Notification' in window) {
  if (Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      console.log('[App] Notification permission requested:', permission);
    });
  } else if (Notification.permission === 'granted') {
    console.log('[App] Notifications already permitted');
  }
}

// Handle service worker updates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[App] Service Worker controller changed - app updated');
  });
}

createRoot(document.getElementById("root")!).render(<App />);
