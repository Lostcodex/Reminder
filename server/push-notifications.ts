import webpush from 'web-push';
import { storage } from './storage';
import type { Reminder } from '@shared/schema';

// Set VAPID details
webpush.setVapidDetails(
  'mailto:reminder@dailyflow.app',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function startPushNotificationService() {
  // Check reminders every minute
  setInterval(async () => {
    await checkAndSendNotifications();
  }, 60000); // Check every 60 seconds

  // Initial check
  await checkAndSendNotifications();
}

async function checkAndSendNotifications() {
  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDate = now.toISOString().split('T')[0];

    // Get all reminders that are due
    const allReminders = await (storage as any).getAllRemindersForToday?.(currentDate);
    if (!allReminders) return;

    const dueReminders = allReminders.filter((reminder: Reminder) => 
      reminder.date === currentDate &&
      reminder.time === currentTime &&
      !reminder.completed
    );

    // Send push notifications for due reminders
    for (const reminder of dueReminders) {
      const subscriptions = await storage.getPushSubscriptionsByUserId(reminder.userId);
      
      for (const subscription of subscriptions) {
        try {
          const payload = JSON.stringify({
            title: reminder.title,
            body: reminder.notes || 'Time for your reminder!',
            tag: reminder.id,
          });

          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                auth: subscription.auth,
                p256dh: subscription.p256dh,
              },
            },
            payload
          );
          
          console.log(`Push sent for reminder: ${reminder.title}`);
        } catch (error: any) {
          if (error.statusCode === 410) {
            // Subscription is expired or invalid, delete it
            await storage.deletePushSubscription(subscription.endpoint);
            console.log(`Deleted expired subscription: ${subscription.endpoint}`);
          } else {
            console.error('Error sending push:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in push notification service:', error);
  }
}
