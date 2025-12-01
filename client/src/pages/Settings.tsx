import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/lib/store';
import { useReminders } from '@/hooks/useReminders';
import { Switch } from '@/components/ui/switch';
import { Bell, Volume2, Moon, Trash2, ChevronRight, Shield, HelpCircle, LucideIcon } from 'lucide-react';

function SettingItem({ icon: Icon, label, right }: { icon: LucideIcon, label: string, right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Icon size={16} />
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      {right}
    </div>
  );
}

export default function Settings() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const { deleteAllReminders } = useReminders();

  return (
    <Layout>
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-display font-extrabold text-foreground mb-8">Settings</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 ml-1">Preferences</h2>
            <div className="shadow-sm rounded-2xl overflow-hidden border border-border/50 divide-y divide-border/50">
              <SettingItem 
                icon={Bell} 
                label="Notifications" 
                right={
                  <Switch 
                    checked={settings.notifications} 
                    onCheckedChange={(checked) => updateSettings({ notifications: checked })} 
                    data-testid="switch-notifications"
                  />
                } 
              />
              <SettingItem 
                icon={Volume2} 
                label="Sound & Vibration" 
                right={
                  <Switch 
                    checked={settings.vibration} 
                    onCheckedChange={(checked) => updateSettings({ vibration: checked })} 
                    data-testid="switch-vibration"
                  />
                } 
              />
              <SettingItem 
                icon={Moon} 
                label="Dark Mode" 
                right={
                  <Switch 
                    checked={settings.theme === 'dark'} 
                    onCheckedChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })} 
                    data-testid="switch-darkmode"
                  />
                } 
              />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 ml-1">Support</h2>
            <div className="shadow-sm rounded-2xl overflow-hidden border border-border/50 divide-y divide-border/50">
              <SettingItem 
                icon={Shield} 
                label="Privacy Policy" 
                right={<ChevronRight size={18} className="text-muted-foreground" />} 
              />
              <SettingItem 
                icon={HelpCircle} 
                label="Help & FAQ" 
                right={<ChevronRight size={18} className="text-muted-foreground" />} 
              />
            </div>
          </section>

          <section>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete all reminders? This cannot be undone.')) {
                  deleteAllReminders();
                }
              }}
              data-testid="button-delete-all"
              className="w-full p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={18} />
              Delete All Data
            </button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Version 1.0.0 • Built with ❤️
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
