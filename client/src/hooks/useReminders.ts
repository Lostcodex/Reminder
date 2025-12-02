import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { type InsertReminder } from '@shared/schema';
import { toast } from 'sonner';
import { cancelReminderNotification, cancelAllNotifications, scheduleReminderNotification } from '@/lib/capacitorNotifications';
import { isNativeApp } from '@/lib/platform';

export function useReminders() {
  const queryClient = useQueryClient();

  const remindersQuery = useQuery({
    queryKey: ['reminders'],
    queryFn: api.reminders.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.reminders.create,
    onSuccess: (newReminder: any) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder created!');
      
      if (isNativeApp() && !newReminder.completed) {
        scheduleReminderNotification({
          id: newReminder.id,
          title: newReminder.title,
          body: newReminder.notes || 'Time for your reminder!',
          date: newReminder.date,
          time: newReminder.time,
        });
      }
    },
    onError: () => {
      toast.error('Failed to create reminder');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: api.reminders.toggle,
    onSuccess: (updatedReminder: any) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      
      if (isNativeApp()) {
        if (updatedReminder.completed) {
          cancelReminderNotification(updatedReminder.id);
        } else {
          scheduleReminderNotification({
            id: updatedReminder.id,
            title: updatedReminder.title,
            body: updatedReminder.notes || 'Time for your reminder!',
            date: updatedReminder.date,
            time: updatedReminder.time,
          });
        }
      }
    },
    onError: () => {
      toast.error('Failed to update reminder');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isNativeApp()) {
        await cancelReminderNotification(id);
      }
      return api.reminders.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted');
    },
    onError: () => {
      toast.error('Failed to delete reminder');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertReminder> }) => {
      const result = await api.reminders.update(id, data);
      return result;
    },
    onSuccess: (updatedReminder: any) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder updated!');
      
      if (isNativeApp() && !updatedReminder.completed) {
        cancelReminderNotification(updatedReminder.id);
        scheduleReminderNotification({
          id: updatedReminder.id,
          title: updatedReminder.title,
          body: updatedReminder.notes || 'Time for your reminder!',
          date: updatedReminder.date,
          time: updatedReminder.time,
        });
      }
    },
    onError: () => {
      toast.error('Failed to update reminder');
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      if (isNativeApp()) {
        await cancelAllNotifications();
      }
      return api.reminders.deleteAll();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('All reminders deleted');
    },
    onError: () => {
      toast.error('Failed to delete reminders');
    },
  });

  return {
    reminders: remindersQuery.data ?? [],
    isLoading: remindersQuery.isLoading,
    createReminder: (data: InsertReminder) => createMutation.mutate(data),
    updateReminder: (id: string, data: Partial<InsertReminder>) => updateMutation.mutate({ id, data }),
    toggleReminder: (id: string) => toggleMutation.mutate(id),
    deleteReminder: (id: string) => deleteMutation.mutate(id),
    deleteAllReminders: () => deleteAllMutation.mutate(),
  };
}
