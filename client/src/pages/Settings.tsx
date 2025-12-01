import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { settings, updateSettings } = useStore();

  const handleTestNotification = async () => {
    // Check if notifications are enabled
    if (!settings.notifications) {
      toast.error('Please enable notifications first');
      return;
    }

    // Request permission if needed
    if (Notification.permission === 'denied') {
      toast.error('Notification permission denied. Please enable in browser settings.');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return;
      }
    }

    // Play alarm sound
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

    // Show test notification
    new Notification('Test Notification', {
      body: 'This is how your reminders will alert you! 🔔',
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: 'test-notification',
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
    });

    toast.success('Test notification sent! Check your screen.');
  };

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
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSettings({ notifications: checked })}
                data-testid="switch-notifications"
              />
            </div>
            {settings.notifications && (
              <Button
                onClick={handleTestNotification}
                variant="outline"
                className="w-full h-10 rounded-xl border-primary/30 hover:bg-primary/10"
                data-testid="button-test-notification"
              >
                Test Notification
              </Button>
            )}
          </div>

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
              When a reminder is due, you'll hear 3 beeps and see a notification on your screen. Notifications work even if the app is closed or in the background!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
