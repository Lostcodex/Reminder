import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { isNativeApp } from './lib/platform';
import { createNotificationChannel, initializeNativeNotifications } from './lib/capacitorNotifications';

if (isNativeApp()) {
  try {
    import('@capacitor/status-bar').then(async (m) => {
      await m.StatusBar.setStyle({ style: 'DARK' as any }).catch(() => {});
      await m.StatusBar.setBackgroundColor({ color: '#8B7FFF' }).catch(() => {});
    });
    
    import('@capacitor/splash-screen').then(async (m) => {
      await m.SplashScreen.hide().catch(() => {});
    });
    
    createNotificationChannel().catch(() => {});
    initializeNativeNotifications().catch(() => {});
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

createRoot(document.getElementById("root")!).render(<App />);
