import { Link, useLocation } from 'wouter';
import { Home, BarChart2, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode, useEffect } from 'react';
import { AddReminderSheet } from '@/components/reminder/AddReminderSheet';
import { useState } from 'react';
import { useStore } from '@/lib/store';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const theme = useStore((state) => state.settings.theme);

  // Ensure theme is applied on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BarChart2, label: 'Stats', path: '/stats' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Settings, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex justify-center transition-colors duration-300">
      <div className="w-full max-w-md bg-background min-h-screen flex flex-col relative shadow-2xl shadow-black/5 overflow-hidden">
        
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {children}
        </main>

        <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50">
          <div className="bg-card/90 backdrop-blur-lg border border-border/20 shadow-lg shadow-black/5 rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto max-w-xs w-full justify-between">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <button 
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                      isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary/70"
                    )}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </button>
                </Link>
              );
            })}
            
            <button 
              onClick={() => setIsAddOpen(true)}
              data-testid="button-add-reminder"
              className="absolute -top-14 left-1/2 -translate-x-1/2 bg-primary text-white p-4 rounded-full shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Plus size={28} strokeWidth={3} />
            </button>
          </div>
        </div>

        <AddReminderSheet open={isAddOpen} onOpenChange={setIsAddOpen} />
      </div>
    </div>
  );
}
