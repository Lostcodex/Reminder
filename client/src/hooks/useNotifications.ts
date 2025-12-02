import { useEffect, useCallback } from 'react';
import { useReminders } from './useReminders';
import { useStore } from '@/lib/store';
import { useUserStore } from '@/lib/userContext';
import { isNativeApp, getBaseUrl } from '@/lib/platform';
import {
  initializeNativeNotifications,
  scheduleReminderNotification,
  cancelReminderNotification,
  createNotificationChannel,
  checkPermissions,
} from '@/lib/capacitorNotifications';
import type { Reminder } from '@shared/schema';

export function useNotifications() {
  const { reminders } = useReminders();
  const notificationsEnabled = useStore((state: any) => state.settings.notifications);

  const initNativeNotifications = useCallback(async () => {
    if (isNativeApp()) {
      await createNotificationChannel();
      const success = await initializeNativeNotifications();
      if (success) {
        console.log('Native notifications initialized');
      }
    }
  }, []);

  useEffect(() => {
    if (!notificationsEnabled) return;

    if (isNativeApp()) {
      initNativeNotifications();
    } else {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            subscribeToPushNotifications();
          }
        });
      } else if (Notification.permission === 'granted') {
        subscribeToPushNotifications();
      }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').catch((err) => {
          console.log('Service Worker registration failed:', err);
        });
      }
    }
  }, [notificationsEnabled, initNativeNotifications]);

  useEffect(() => {
    if (!notificationsEnabled || reminders.length === 0) return;

    if (isNativeApp()) {
      reminders.forEach((reminder: Reminder) => {
        if (!reminder.completed) {
          scheduleReminderNotification({
            id: reminder.id,
            title: reminder.title,
            body: reminder.notes || 'Time for your reminder!',
            date: reminder.date,
            time: reminder.time,
          });
        }
      });
    } else {
      const checkReminders = setInterval(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const currentDate = now.toISOString().split('T')[0];

        reminders.forEach((reminder: Reminder) => {
          if (
            reminder.date === currentDate &&
            reminder.time === currentTime &&
            !reminder.completed &&
            Notification.permission === 'granted'
          ) {
            playAlarmSound();

            new Notification(reminder.title, {
              body: reminder.notes || 'Time for your reminder!',
              icon: '/favicon.png',
              badge: '/favicon.png',
              tag: reminder.id,
              requireInteraction: true,
            } as NotificationOptions & { vibrate?: number[] });
          }
        });
      }, 30000);

      return () => clearInterval(checkReminders);
    }
  }, [reminders, notificationsEnabled]);

  const cancelNotification = useCallback(async (reminderId: string) => {
    if (isNativeApp()) {
      await cancelReminderNotification(reminderId);
    }
  }, []);

  return { cancelNotification, checkPermissions };
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

    const baseUrl = getBaseUrl();
    const keyResponse = await fetch(`${baseUrl}/api/push/vapid-public-key`);
    const { publicKey } = await keyResponse.json();

    const convertedVapidKey = urlBase64ToUint8Array(publicKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    const authKey = subscription.getKey('auth');
    const p256dhKey = subscription.getKey('p256dh');
    
    const authArray = authKey ? Array.from(new Uint8Array(authKey)) : [];
    const p256dhArray = p256dhKey ? Array.from(new Uint8Array(p256dhKey)) : [];
    
    const token = useUserStore.getState().token;
    
    if (!token) {
      console.error('No authentication token available for push subscription');
      return;
    }

    const response = await fetch(`${baseUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        auth: btoa(String.fromCharCode(...authArray)),
        p256dh: btoa(String.fromCharCode(...p256dhArray)),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Push subscription failed:', error);
      return;
    }

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
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.3, now);

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
