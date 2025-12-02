import { LocalNotifications, LocalNotificationSchema, ScheduleOptions } from '@capacitor/local-notifications';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { isNativeApp, getApiBaseUrl } from './platform';
import { useUserStore } from './userContext';

export interface ReminderNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  time: string;
}

let notificationIdCounter = 1;
const reminderIdMap = new Map<string, number>();

function getNumericId(reminderId: string): number {
  if (!reminderIdMap.has(reminderId)) {
    reminderIdMap.set(reminderId, notificationIdCounter++);
  }
  return reminderIdMap.get(reminderId)!;
}

export async function initializeNativeNotifications(): Promise<boolean> {
  if (!isNativeApp()) {
    return false;
  }

  try {
    const localPermission = await LocalNotifications.requestPermissions();
    if (localPermission.display !== 'granted') {
      console.log('Local notification permission denied');
      return false;
    }

    const pushPermission = await PushNotifications.requestPermissions();
    if (pushPermission.receive !== 'granted') {
      console.log('Push notification permission denied');
    }

    await registerPushNotifications();
    setupNotificationListeners();

    console.log('Native notifications initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize native notifications:', error);
    return false;
  }
}

async function registerPushNotifications(): Promise<void> {
  try {
    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration token:', token.value);
      
      const userToken = useUserStore.getState().token;
      if (userToken) {
        try {
          await fetch(`${getApiBaseUrl()}/push/register-device`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              token: token.value,
              platform: 'android',
            }),
          });
          console.log('Device registered for push notifications');
        } catch (error) {
          console.error('Failed to register device:', error);
        }
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });
  } catch (error) {
    console.error('Failed to register push notifications:', error);
  }
}

function setupNotificationListeners(): void {
  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    console.log('Local notification received:', notification);
  });

  LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    console.log('Local notification action performed:', action);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    console.log('Push notification received:', notification);
    
    showLocalNotification({
      id: notification.id || 'push',
      title: notification.title || 'Reminder',
      body: notification.body || 'You have a reminder!',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    });
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
    console.log('Push notification action performed:', action);
  });
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

    const notification: LocalNotificationSchema = {
      id: getNumericId(reminder.id),
      title: reminder.title,
      body: reminder.body,
      schedule: {
        at: scheduleDate,
        allowWhileIdle: true,
      },
      sound: 'alarm.wav',
      smallIcon: 'ic_stat_icon',
      iconColor: '#8B7FFF',
      channelId: 'reminders',
    };

    const scheduleOptions: ScheduleOptions = {
      notifications: [notification],
    };

    await LocalNotifications.schedule(scheduleOptions);
    console.log(`Scheduled notification for ${reminder.title} at ${scheduleDate.toISOString()}`);
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
}

export async function cancelReminderNotification(reminderId: string): Promise<void> {
  if (!isNativeApp()) {
    return;
  }

  try {
    const numericId = reminderIdMap.get(reminderId);
    if (numericId) {
      await LocalNotifications.cancel({ notifications: [{ id: numericId }] });
      reminderIdMap.delete(reminderId);
      console.log(`Cancelled notification for reminder ${reminderId}`);
    }
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
    reminderIdMap.clear();
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
    const notification: LocalNotificationSchema = {
      id: getNumericId(reminder.id),
      title: reminder.title,
      body: reminder.body,
      sound: 'alarm.wav',
      smallIcon: 'ic_stat_icon',
      iconColor: '#8B7FFF',
      channelId: 'reminders',
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
