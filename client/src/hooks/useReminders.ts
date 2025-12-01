import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { type InsertReminder } from '@shared/schema';
import { toast } from 'sonner';

export function useReminders() {
  const queryClient = useQueryClient();

  const remindersQuery = useQuery({
    queryKey: ['reminders'],
    queryFn: api.reminders.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.reminders.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder created!');
    },
    onError: () => {
      toast.error('Failed to create reminder');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: api.reminders.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: () => {
      toast.error('Failed to update reminder');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.reminders.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted');
    },
    onError: () => {
      toast.error('Failed to delete reminder');
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: api.reminders.deleteAll,
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
    toggleReminder: (id: string) => toggleMutation.mutate(id),
    deleteReminder: (id: string) => deleteMutation.mutate(id),
    deleteAllReminders: () => deleteAllMutation.mutate(),
  };
}
