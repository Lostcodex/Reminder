import { motion } from 'framer-motion';
import { Check, Droplets, BookOpen, Heart, Sparkles, Clock, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Reminder } from '@shared/schema';
import { format, parse } from 'date-fns';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
}

export function ReminderCard({ reminder, onToggle }: ReminderCardProps) {
  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case 'Study': return 'bg-cat-study text-cat-study-fg border-cat-study-fg/20';
      case 'Water': return 'bg-cat-water text-cat-water-fg border-cat-water-fg/20';
      case 'Health': return 'bg-cat-health text-cat-health-fg border-cat-health-fg/20';
      default: return 'bg-cat-custom text-cat-custom-fg border-cat-custom-fg/20';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Study': return <BookOpen size={18} />;
      case 'Water': return <Droplets size={18} />;
      case 'Health': return <Heart size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  const isOverdue = !reminder.completed && new Date(reminder.date + 'T' + reminder.time) < new Date();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative flex items-center gap-4 p-4 mb-3 rounded-2xl bg-card border border-border/50 shadow-sm transition-all duration-300 hover:shadow-md",
        reminder.completed && "opacity-60 grayscale-[0.5]"
      )}
      data-testid={`reminder-${reminder.id}`}
    >
      <button
        onClick={() => onToggle(reminder.id)}
        data-testid={`toggle-${reminder.id}`}
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300",
          reminder.completed 
            ? "bg-green-500 border-green-500 text-white scale-95" 
            : "bg-card border-muted-foreground/20 text-transparent hover:border-primary/50"
        )}
      >
        <Check size={20} strokeWidth={3} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit",
            getCategoryStyles(reminder.category)
          )}>
            {getCategoryIcon(reminder.category)}
            {reminder.category}
          </span>
          {reminder.repeat !== 'None' && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-md">
              <RotateCw size={10} />
              {reminder.repeat}
            </span>
          )}
        </div>
        
        <h3 className={cn(
          "text-lg font-bold leading-tight truncate transition-all",
          reminder.completed ? "line-through text-muted-foreground" : "text-foreground"
        )}>
          {reminder.title}
        </h3>
        
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground font-medium">
          <div className={cn("flex items-center gap-1", isOverdue && "text-red-500 font-bold")}>
            <Clock size={14} />
            {format(parse(reminder.time, 'HH:mm', new Date()), 'h:mm a')}
          </div>
          {reminder.notes && (
            <span className="truncate max-w-[150px] opacity-70">— {reminder.notes}</span>
          )}
        </div>
      </div>

      <div className={cn(
        "absolute left-0 top-4 bottom-4 w-1 rounded-r-full",
        reminder.category === 'Study' && "bg-indigo-400",
        reminder.category === 'Water' && "bg-cyan-400",
        reminder.category === 'Health' && "bg-emerald-400",
        reminder.category === 'Custom' && "bg-orange-400",
      )} />
    </motion.div>
  );
}
