import { LocalNotifications, LocalNotificationSchema, ScheduleOptions } from '@capacitor/local-notifications';
import { isNativeApp } from './platform';

export interface ReminderNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  time: string;
}

let isInitialized = false;
let isInitializing = false;

function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 2147483647 || 1;
}

export async function initializeNativeNotifications(): Promise<boolean> {
  if (!isNativeApp()) {
    return false;
  }

  if (isInitialized) {
    console.log('Native notifications already initialized');
    return true;
  }

  if (isInitializing) {
    console.log('Native notifications initialization already in progress');
    return false;
  }

  isInitializing = true;

  try {
    const existingLocalPerm = await LocalNotifications.checkPermissions();
    let localGranted = existingLocalPerm.display === 'granted';
    
    if (!localGranted) {
      const localPermission = await LocalNotifications.requestPermissions();
      localGranted = localPermission.display === 'granted';
      if (!localGranted) {
        console.log('Local notification permission denied');
        isInitializing = false;
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setupNotificationListeners();

    isInitialized = true;
    isInitializing = false;
    console.log('Native notifications initialized successfully (Local only)');
    return true;
  } catch (error) {
    console.error('Failed to initialize native notifications:', error);
    isInitializing = false;
    return false;
  }
}

function setupNotificationListeners(): void {
  try {
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Local notification received:', notification);
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      console.log('Local notification action performed:', action);
    });
  } catch (error) {
    console.error('Failed to setup notification listeners:', error);
  }
}

export async function scheduleReminderNotification(reminder: ReminderNotification): Promise<void> {
  if (!isNativeApp()) {
    return;
  }

  try {
    const [year, month, day] = reminder.date.split('-').map(Number);
    const [hours, minutes] = reminder.time.split(':').map(Number);
    
    const scheduleDate = new Date(year, month - 1, day, hours, minutes, 0);
    
    if (scheduleDate <= new Date()) {
      console.log('Reminder time has already passed, skipping schedule');
      return;
    }

    const notificationId = hashStringToNumber(reminder.id);
    
    try {
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
    } catch (e) {
    }

    const notification: LocalNotificationSchema = {
      id: notificationId,
      title: reminder.title,
      body: reminder.body,
      schedule: {
        at: scheduleDate,
        allowWhileIdle: true,
        repeats: false,
      },
      sound: 'alarm.wav',
      smallIcon: 'ic_stat_icon',
      iconColor: '#8B7FFF',
      channelId: 'reminders',
      autoCancel: true,
      extra: {
        reminderId: reminder.id,
      },
    };

    const scheduleOptions: ScheduleOptions = {
      notifications: [notification],
    };

    await LocalNotifications.schedule(scheduleOptions);
    console.log(`Scheduled notification for ${reminder.title} (ID: ${notificationId}) at ${scheduleDate.toISOString()}`);
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
}

export async function cancelReminderNotification(reminderId: string): Promise<void> {
  if (!isNativeApp()) {
    return;
  }

  try {
    const notificationId = hashStringToNumber(reminderId);
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
    console.log(`Cancelled notification for reminder ${reminderId}`);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (!isNativeApp()) {
    return;
  }

  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
    console.log('Cancelled all notifications');
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
}

export async function showLocalNotification(reminder: ReminderNotification): Promise<void> {
  if (!isNativeApp()) {
    return;
  }

  try {
    const notificationId = hashStringToNumber(reminder.id);
    const notification: LocalNotificationSchema = {
      id: notificationId,
      title: reminder.title,
      body: reminder.body,
      sound: 'alarm.wav',
      smallIcon: 'ic_stat_icon',
      iconColor: '#8B7FFF',
      channelId: 'reminders',
      autoCancel: true,
    };

    await LocalNotifications.schedule({
      notifications: [notification],
    });
    console.log(`Showed immediate notification for ${reminder.title}`);
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

export async function createNotificationChannel(): Promise<void> {
  if (!isNativeApp()) {
    return;
  }

  try {
    await LocalNotifications.createChannel({
      id: 'reminders',
      name: 'Reminders',
      description: 'Reminder notifications for DailyFlow',
      importance: 5,
      visibility: 1,
      vibration: true,
      sound: 'alarm.wav',
      lights: true,
      lightColor: '#8B7FFF',
    });
    console.log('Notification channel created');
  } catch (error) {
    console.error('Failed to create notification channel:', error);
  }
}

export async function checkPermissions(): Promise<boolean> {
  if (!isNativeApp()) {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  try {
    const permission = await LocalNotifications.checkPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('Failed to check permissions:', error);
    return false;
  }
}
