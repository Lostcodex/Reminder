import { Layout } from '@/components/layout/Layout';
import { ReminderCard } from '@/components/reminder/ReminderCard';
import { useReminders } from '@/hooks/useReminders';
import { format, addHours } from 'date-fns';
import { Droplets, Sun, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Home() {
  const { reminders, isLoading, createReminder, toggleReminder } = useReminders();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const todaysReminders = reminders.filter(r => 
    r.date === todayStr || r.repeat === 'Daily'
  ).sort((a, b) => a.time.localeCompare(b.time));

  const completedCount = todaysReminders.filter(r => r.completed).length;
  const progress = todaysReminders.length > 0 
    ? Math.round((completedCount / todaysReminders.length) * 100) 
    : 0;

  const handleQuickAddWater = () => {
    const now = new Date();
    const nextWater = addHours(now, 1);
    createReminder({
      title: 'Drink Water',
      category: 'Water',
      date: format(now, 'yyyy-MM-dd'),
      time: format(nextWater, 'HH:mm'),
      repeat: 'None',
      notes: 'Stay hydrated!',
      completed: false,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 pt-12 pb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-foreground">
              Hello, Friend! <span className="inline-block">👋</span>
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              You have {todaysReminders.length - completedCount} tasks remaining today.
            </p>
          </div>
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-border/50">
            <div className="text-center px-2">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider">{format(today, 'MMM')}</div>
              <div className="text-xl font-black text-foreground">{format(today, 'd')}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <button 
            onClick={handleQuickAddWater}
            data-testid="button-quick-water"
            className="flex items-center gap-3 p-4 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-2xl transition-colors border border-cyan-100 shadow-sm group"
          >
            <div className="bg-white p-2 rounded-xl shadow-sm text-cyan-500 group-hover:scale-110 transition-transform relative">
              <Droplets size={20} />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">Hydrate</div>
              <div className="text-[10px] opacity-70 font-bold uppercase">+ Quick Add</div>
            </div>
          </button>

          <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 shadow-sm">
            <div className="bg-white p-2 rounded-xl shadow-sm text-amber-500">
              <Sun size={20} />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">Daily Goal</div>
              <div className="text-[10px] opacity-70 font-bold uppercase">{progress}% Done</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <CalendarDays size={18} className="text-primary" />
          <h2 className="text-lg font-bold">Today's Timeline</h2>
          <div className="h-px bg-border flex-1 ml-2" />
        </div>

        <div className="relative pl-4 space-y-6 min-h-[300px]">
          <div className="absolute left-[21px] top-2 bottom-0 w-0.5 bg-gradient-to-b from-border via-border to-transparent" />

          <AnimatePresence mode="popLayout">
            {todaysReminders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center pr-4"
              >
                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Sun size={40} className="text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">No reminders for today.</p>
                <p className="text-sm text-muted-foreground/70">Enjoy your free time!</p>
              </motion.div>
            ) : (
              todaysReminders.map((reminder) => (
                <div key={reminder.id} className="relative pl-8">
                  <div className={cn(
                    "absolute left-0 top-6 w-3 h-3 rounded-full border-2 z-10 bg-background transition-colors",
                    reminder.completed ? "border-green-500 bg-green-500" : "border-primary"
                  )} />
                  
                  <ReminderCard reminder={reminder} onToggle={toggleReminder} />
                </div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
