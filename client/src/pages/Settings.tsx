import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/lib/store';
import { Switch } from '@/components/ui/switch';
import { Bell, Volume2, Moon, Trash2, ChevronRight, Shield, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { settings, updateSettings, deleteEverything } = useStore();

  const SettingItem = ({ icon: Icon, label, right }: { icon: any, label: string, right: React.ReactNode }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-border/50 first:rounded-t-2xl last:rounded-b-2xl not-last:border-b-0 hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Icon size={16} />
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      {right}
    </div>
  );

  return (
    <Layout>
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-display font-extrabold text-foreground mb-8">Settings</h1>

        <div className="space-y-8">
          {/* Preferences Section */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 ml-1">Preferences</h2>
            <div className="shadow-sm rounded-2xl overflow-hidden">
              <SettingItem 
                icon={Bell} 
                label="Notifications" 
                right={
                  <Switch 
                    checked={settings.notifications} 
                    onCheckedChange={(checked) => updateSettings({ notifications: checked })} 
                  />
                } 
              />
              <div className="h-px bg-border/50 mx-4" />
              <SettingItem 
                icon={Volume2} 
                label="Sound & Vibration" 
                right={
                  <Switch 
                    checked={settings.vibration} 
                    onCheckedChange={(checked) => updateSettings({ vibration: checked })} 
                  />
                } 
              />
              <div className="h-px bg-border/50 mx-4" />
              <SettingItem 
                icon={Moon} 
                label="Dark Mode" 
                right={
                  <Switch 
                    checked={settings.theme === 'dark'} 
                    onCheckedChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })} 
                  />
                } 
              />
            </div>
          </section>

          {/* Support Section */}
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 ml-1">Support</h2>
            <div className="shadow-sm rounded-2xl overflow-hidden">
              <SettingItem 
                icon={Shield} 
                label="Privacy Policy" 
                right={<ChevronRight size={18} className="text-muted-foreground" />} 
              />
              <div className="h-px bg-border/50 mx-4" />
              <SettingItem 
                icon={HelpCircle} 
                label="Help & FAQ" 
                right={<ChevronRight size={18} className="text-muted-foreground" />} 
              />
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete all reminders? This cannot be undone.')) {
                  deleteEverything();
                }
              }}
              className="w-full p-4 rounded-2xl bg-red-50 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
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
