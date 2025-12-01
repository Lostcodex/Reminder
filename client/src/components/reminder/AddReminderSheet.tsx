import { Drawer } from 'vaul';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReminders } from '@/hooks/useReminders';
import { Droplets, BookOpen, Heart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(['Study', 'Water', 'Health', 'Custom']),
  date: z.string(),
  time: z.string(),
  repeat: z.enum(['None', 'Daily', 'Weekly']),
  notes: z.string().optional(),
  completed: z.boolean().default(false),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface AddReminderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddReminderSheet({ open, onOpenChange }: AddReminderSheetProps) {
  const { createReminder } = useReminders();
  
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: '',
      category: 'Study',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      repeat: 'None',
      notes: '',
      completed: false,
    },
  });

  const onSubmit = (data: ReminderFormValues) => {
    createReminder(data);
    onOpenChange(false);
    form.reset();
  };

  const categories = [
    { id: 'Study' as const, icon: BookOpen, label: 'Study', color: 'bg-cat-study text-cat-study-fg' },
    { id: 'Water' as const, icon: Droplets, label: 'Water', color: 'bg-cat-water text-cat-water-fg' },
    { id: 'Health' as const, icon: Heart, label: 'Health', color: 'bg-cat-health text-cat-health-fg' },
    { id: 'Custom' as const, icon: Sparkles, label: 'Custom', color: 'bg-cat-custom text-cat-custom-fg' },
  ];

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[32px] mt-24 h-fit fixed bottom-0 left-0 right-0 z-50 outline-none max-w-md mx-auto">
          <div className="p-4 bg-background rounded-t-[32px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
            
            <div className="max-w-md mx-auto">
              <Drawer.Title className="text-2xl font-display font-bold mb-6 text-center">New Reminder</Drawer.Title>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-2">
                  <Input 
                    {...form.register('title')}
                    placeholder="What needs to be done?" 
                    data-testid="input-title"
                    className="text-lg font-medium bg-muted/30 border-transparent focus:bg-white h-12 rounded-xl"
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-500 text-sm ml-1">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      data-testid={`category-${cat.id.toLowerCase()}`}
                      onClick={() => form.setValue('category', cat.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200",
                        form.watch('category') === cat.id 
                          ? cn(cat.color, "border-current scale-105 shadow-sm") 
                          : "bg-card border-transparent text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <cat.icon size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">{cat.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Date</label>
                    <Input 
                      type="date" 
                      {...form.register('date')}
                      data-testid="input-date"
                      className="bg-muted/30 border-transparent focus:bg-white rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Time</label>
                    <Input 
                      type="time" 
                      {...form.register('time')}
                      data-testid="input-time"
                      className="bg-muted/30 border-transparent focus:bg-white rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Repeat</label>
                    <select 
                      {...form.register('repeat')}
                      data-testid="select-repeat"
                      className="w-full h-11 rounded-xl px-3 bg-muted/30 border-transparent focus:bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="None">Once</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Notes (Optional)</label>
                    <Input 
                      {...form.register('notes')}
                      placeholder="Add details..." 
                      data-testid="input-notes"
                      className="bg-muted/30 border-transparent focus:bg-white rounded-xl h-11"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  data-testid="button-submit-reminder"
                  className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 mt-4"
                >
                  Set Reminder
                </Button>
                <div className="h-8" />
              </form>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
