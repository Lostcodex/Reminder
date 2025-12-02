import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { isNativeApp } from './lib/platform';
import { createNotificationChannel } from './lib/capacitorNotifications';

async function initializeCapacitor() {
  if (!isNativeApp()) return;
  
  try {
    const [statusBarModule, splashScreenModule] = await Promise.all([
      import('@capacitor/status-bar').catch(() => null),
      import('@capacitor/splash-screen').catch(() => null),
    ]);
    
    if (statusBarModule) {
      await statusBarModule.StatusBar.setStyle({ style: 'DARK' as any }).catch(() => {});
      await statusBarModule.StatusBar.setBackgroundColor({ color: '#8B7FFF' }).catch(() => {});
    }
    
    if (splashScreenModule) {
      await splashScreenModule.SplashScreen.hide().catch(() => {});
    }
    
    await createNotificationChannel();
    
    console.log('[App] Capacitor initialized successfully');
  } catch (e) {
    console.log('[App] Capacitor initialization warning:', e);
  }
}

if (isNativeApp()) {
  initializeCapacitor();
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
