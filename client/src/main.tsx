import { createRoot } from "react-dom/client";
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import App from "./App";
import "./index.css";
import { isNativeApp } from './lib/platform';
import { createNotificationChannel, initializeNativeNotifications } from './lib/capacitorNotifications';

async function initializeApp() {
  if (isNativeApp()) {
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#8B7FFF' });
    } catch (e) {
      console.log('StatusBar not available');
    }

    try {
      await createNotificationChannel();
      await initializeNativeNotifications();
      console.log('[App] Native notifications initialized');
    } catch (e) {
      console.log('[App] Failed to initialize native notifications:', e);
    }

    try {
      await SplashScreen.hide();
    } catch (e) {
      console.log('SplashScreen not available');
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

initializeApp().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
