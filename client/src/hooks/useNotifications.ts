import { useEffect } from 'react';
import { useReminders } from './useReminders';
import { useStore } from '@/lib/store';
import { useUserStore } from '@/lib/userStore';

export function useNotifications() {
  const { reminders } = useReminders();
  const notificationsEnabled = useStore((state) => state.settings.notifications);
  const userId = useUserStore((state) => state.id);

  useEffect(() => {
    if (!notificationsEnabled || !userId) return;

    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          subscribeToPushNotifications();
        }
      });
    } else if (Notification.permission === 'granted') {
      subscribeToPushNotifications();
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
    }
  }, [notificationsEnabled, userId]);

  // Check for due reminders periodically (fallback for browser open)
  useEffect(() => {
    if (!notificationsEnabled || reminders.length === 0) return;

    const checkReminders = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDate = now.toISOString().split('T')[0];

      reminders.forEach((reminder) => {
        if (
          reminder.date === currentDate &&
          reminder.time === currentTime &&
          !reminder.completed &&
          Notification.permission === 'granted'
        ) {
          // Play alarm sound
          playAlarmSound();

          // Show notification
          new Notification(reminder.title, {
            body: reminder.notes || 'Time for your reminder!',
            icon: '/favicon.png',
            badge: '/favicon.png',
            tag: reminder.id,
            requireInteraction: true,
          } as NotificationOptions & { vibrate?: number[] });
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkReminders);
  }, [reminders, notificationsEnabled]);
}

async function subscribeToPushNotifications() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();
    
    if (existingSubscription) {
      console.log('Already subscribed to push notifications');
      return;
    }

    // Get VAPID public key from server
    const keyResponse = await fetch('/api/push/vapid-public-key');
    const { publicKey } = await keyResponse.json();

    // Convert public key to Uint8Array
    const convertedVapidKey = urlBase64ToUint8Array(publicKey);

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': localStorage.getItem('sessionId') || '',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
      }),
    });

    console.log('Successfully subscribed to push notifications');
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function playAlarmSound() {
  // Create a simple beep alarm using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.3, now);

    // Create alarm pattern: 3 beeps
    for (let i = 0; i < 3; i++) {
      osc.frequency.setValueAtTime(800, now + i * 0.5);
      gain.gain.setValueAtTime(0.3, now + i * 0.5);
      gain.gain.setValueAtTime(0, now + i * 0.5 + 0.3);
    }

    osc.start(now);
    osc.stop(now + 1.5);
  } catch (e) {
    console.log('Audio playback not available');
  }
}
