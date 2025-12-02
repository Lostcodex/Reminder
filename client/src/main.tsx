import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { isNativeApp } from './lib/platform';
import { createNotificationChannel, initializeNativeNotifications } from './lib/capacitorNotifications';

async function initializeApp() {
  if (isNativeApp()) {
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      const { SplashScreen } = await import('@capacitor/splash-screen');
      
      StatusBar.setStyle({ style: 'DARK' as any }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#8B7FFF' }).catch(() => {});
      
      createNotificationChannel().catch(() => {});
      initializeNativeNotifications().catch(() => {});
      
      SplashScreen.hide().catch(() => {});
    } catch (e) {
      console.log('[App] Capacitor initialization warning:', e);
    }
  } else {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js', { scope: '/' })
          .then((registration) => {
            console.log('[App] Service Worker registered successfully:', registration);
            
            setInterval(() => {
              registration.update();
            }, 60000);
          })
          .catch((err) => console.log('[App] Service Worker registration failed:', err));
      });
    }

    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          console.log('[App] Notification permission requested:', permission);
        });
      } else if (Notification.permission === 'granted') {
        console.log('[App] Notifications already permitted');
      }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[App] Service Worker controller changed - app updated');
      });
    }
  }
}

initializeApp();
createRoot(document.getElementById("root")!).render(<App />);
