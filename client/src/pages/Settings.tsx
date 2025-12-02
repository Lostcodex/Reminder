import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Moon, Sun, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { isNativeApp } from '@/lib/platform';
import { initializeNativeNotifications, checkPermissions, showLocalNotification } from '@/lib/capacitorNotifications';

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const [showNotificationGuide, setShowNotificationGuide] = useState(false);
  const [nativePermissionGranted, setNativePermissionGranted] = useState(false);

  useEffect(() => {
    if (isNativeApp()) {
      checkPermissions().then(setNativePermissionGranted);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (isNativeApp()) {
      const success = await initializeNativeNotifications();
      if (success) {
        setNativePermissionGranted(true);
        updateSettings({ notifications: true });
        toast.success('Notifications enabled!');
        setTimeout(handleTestNotification, 500);
      } else {
        toast.error('Failed to enable notifications');
      }
      return;
    }

    if (Notification.permission === 'granted') {
      handleTestNotification();
      return;
    }

    if (Notification.permission === 'denied') {
      setShowNotificationGuide(true);
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      updateSettings({ notifications: true });
      toast.success('Notifications enabled!');
      setTimeout(handleTestNotification, 500);
    } else if (permission === 'denied') {
      setShowNotificationGuide(true);
    }
  };

  const handleTestNotification = async () => {
    if (isNativeApp()) {
      await showLocalNotification({
        id: 'test-' + Date.now(),
        title: 'Test Notification',
        body: 'This is how your reminders will alert you!',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
      });
      toast.success('Test notification sent!');
      return;
    }

    if (Notification.permission !== 'granted') {
      toast.error('Notification permission not granted');
      return;
    }

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

    if (typeof window !== 'undefined' && 'Notification' in window) {
      new Notification('Test Notification', {
        body: 'This is how your reminders will alert you!',
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: 'test-notification',
        requireInteraction: true,
      } as NotificationOptions & { vibrate?: number[] });
    }

    toast.success('Test notification sent!');
  };

  const getNotificationStatus = () => {
    if (isNativeApp()) {
      return nativePermissionGranted ? 'granted' : 'default';
    }
    return typeof Notification !== 'undefined' ? Notification.permission : 'default';
  };

  const notificationStatus = getNotificationStatus();

  return (
    <Layout>
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-display font-extrabold text-foreground mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-3 rounded-xl">
                  <Bell size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Push Notifications</h3>
                  <p className="text-xs text-muted-foreground mt-1">Get alerts when reminders are due</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleEnableNotifications}
                className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90"
                data-testid="button-enable-notifications"
              >
                {notificationStatus === 'granted' ? 'Test Notification' : 'Enable Notifications'}
              </Button>
              {notificationStatus === 'granted' && (
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSettings({ notifications: checked })}
                  data-testid="switch-notifications"
                  className="self-center"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Status: <span className="font-bold">{notificationStatus === 'granted' ? '✓ Enabled' : notificationStatus === 'denied' ? '✗ Blocked' : 'Not set'}</span>
            </p>
          </div>

          {/* Permission Denied Guide - Only for web */}
          {!isNativeApp() && showNotificationGuide && notificationStatus === 'denied' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <Info size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-600 mb-2">Notifications are blocked</h3>
                  <p className="text-sm text-red-600/80 mb-3">Follow these steps to enable notifications:</p>
                  
                  <ol className="text-sm text-red-600/80 space-y-2 ml-4 list-decimal">
                    <li>Look at the address bar at the top of your browser</li>
                    <li>Click the <span className="font-bold">lock icon</span> or <span className="font-bold">info icon</span></li>
                    <li>Find "Notifications" in the dropdown menu</li>
                    <li>Click and select <span className="font-bold">"Allow"</span></li>
                    <li>Refresh the page and try again</li>
                  </ol>
                </div>
              </div>
              <Button
                onClick={() => setShowNotificationGuide(false)}
                variant="outline"
                className="w-full h-10 rounded-xl border-red-500/30 text-red-600 hover:bg-red-500/10"
              >
                Close Guide
              </Button>
            </div>
          )}

          {/* Theme */}
          <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/20 p-3 rounded-xl">
                  {settings.theme === 'dark' ? (
                    <Moon size={20} className="text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Sun size={20} className="text-amber-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Dark Mode</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {settings.theme === 'dark' ? 'Currently on' : 'Currently off'}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={(checked) =>
                  updateSettings({ theme: checked ? 'dark' : 'light' })
                }
                data-testid="switch-theme"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-muted/50 p-4 rounded-2xl">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">How Notifications Work</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When a reminder is due, you'll see a notification on your screen.
              {isNativeApp() && (
                <span className="block mt-2 text-primary font-medium">
                  Tip: For reliable notifications when the app is closed, go to Settings → Apps → DailyFlow → Battery and select "Unrestricted" to prevent Android from blocking alarms.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
