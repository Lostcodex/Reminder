import { Layout } from '@/components/layout/Layout';
import { useReminders } from '@/hooks/useReminders';
import { useStore } from '@/lib/store';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

export default function Stats() {
  const { reminders, isLoading } = useReminders();
  const theme = useStore((state) => state.settings.theme);
  
  const completedCount = reminders.filter(r => r.completed).length;
  const totalCount = reminders.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayReminders = reminders.filter(r => r.date === dateStr);
      if (dayReminders.length === 0) break;
      
      const allCompleted = dayReminders.every(r => r.completed);
      if (allCompleted) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Calculate weekly activity scores
  const getWeeklyData = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayIndex = date.getDay();
      const dayName = dayNames[dayIndex];

      const dayReminders = reminders.filter(r => r.date === dateStr);
      let score = 0;
      
      if (dayReminders.length > 0) {
        const completed = dayReminders.filter(r => r.completed).length;
        score = Math.round((completed / dayReminders.length) * 100);
      }

      weekData.push({ name: dayName, score, date: dateStr });
    }

    return weekData;
  };

  const data = getWeeklyData();

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
        <h1 className="text-3xl font-display font-extrabold text-foreground mb-8">Your Progress</h1>

        <div className="bg-primary text-primary-foreground rounded-[32px] p-8 shadow-xl shadow-primary/20 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-12 -mb-12 blur-xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary-foreground/80 font-bold uppercase text-xs tracking-wider mb-2">
              <Award size={16} />
              Current Streak
            </div>
            <div className="text-5xl font-black mb-1">{streak} {streak === 1 ? 'Day' : 'Days'}</div>
            <p className="text-primary-foreground/80 font-medium">
              {streak === 0 ? 'Start your streak today!' : streak > 0 ? "You're on fire! Keep it up." : 'Keep building your streak!'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card p-5 rounded-3xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-3">
              <CheckCircle2 size={20} />
            </div>
            <div className="text-2xl font-bold text-foreground">{completedCount}</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Completed</div>
          </div>
          
          <div className="bg-card p-5 rounded-3xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mb-3">
              <TrendingUp size={20} />
            </div>
            <div className="text-2xl font-bold text-foreground">{completionRate}%</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Success Rate</div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-[32px] border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={18} className="text-muted-foreground" />
            <h3 className="font-bold text-foreground">Weekly Activity</h3>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'currentColor', className: 'text-muted-foreground' }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', radius: 8 }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar 
                  dataKey="score" 
                  radius={[6, 6, 6, 6]} 
                  barSize={12}
                  label={{ 
                    position: 'top', 
                    fontSize: 12, 
                    fontWeight: 'bold',
                    fill: theme === 'dark' ? '#ffffff' : '#000000',
                    offset: 4
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? 'hsl(250 85% 65%)' : 'hsl(var(--muted))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
