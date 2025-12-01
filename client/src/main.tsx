import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for background notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .catch((err) => console.log('Service Worker registration failed:', err));
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

createRoot(document.getElementById("root")!).render(<App />);
