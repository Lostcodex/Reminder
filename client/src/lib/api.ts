import { type Reminder, type InsertReminder } from '@shared/schema';
import { useUserStore } from './userContext';
import { getApiBaseUrl } from './platform';

const getApiBase = () => getApiBaseUrl();

function getHeaders() {
  const token = useUserStore.getState().token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  reminders: {
    getAll: async (): Promise<Reminder[]> => {
      const res = await fetch(`${getApiBase()}/reminders`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch reminders');
      return res.json();
    },

    create: async (reminder: InsertReminder): Promise<Reminder> => {
      const res = await fetch(`${getApiBase()}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(reminder),
      });
      if (!res.ok) throw new Error('Failed to create reminder');
      return res.json();
    },

    update: async (id: string, reminder: Partial<InsertReminder>): Promise<Reminder> => {
      const res = await fetch(`${getApiBase()}/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(reminder),
      });
      if (!res.ok) throw new Error('Failed to update reminder');
      return res.json();
    },

    toggle: async (id: string): Promise<Reminder> => {
      const res = await fetch(`${getApiBase()}/reminders/${id}/toggle`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to toggle reminder');
      return res.json();
    },

    delete: async (id: string): Promise<void> => {
      const res = await fetch(`${getApiBase()}/reminders/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete reminder');
    },

    deleteAll: async (): Promise<void> => {
      const res = await fetch(`${getApiBase()}/reminders`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete all reminders');
    },
  },
};
