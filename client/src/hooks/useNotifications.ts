import { useEffect } from 'react';
import { useReminders } from './useReminders';
import { useStore } from '@/lib/store';

export function useNotifications() {
  const { reminders } = useReminders();
  const notificationsEnabled = useStore((state) => state.settings.notifications);

  useEffect(() => {
    if (!notificationsEnabled) return;

    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
    }
  }, [notificationsEnabled]);

  // Check for due reminders periodically
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
            vibrate: [300, 100, 300, 100, 300] as VibratePattern,
          });
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkReminders);
  }, [reminders, notificationsEnabled]);
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
