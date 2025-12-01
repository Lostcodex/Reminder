import { type Reminder, type InsertReminder } from '@shared/schema';
import { useUserStore } from './userContext';

const API_BASE = '/api';

function getHeaders() {
  const sessionId = useUserStore.getState().sessionId;
  return { 'x-session-id': sessionId };
}

export const api = {
  reminders: {
    getAll: async (): Promise<Reminder[]> => {
      const res = await fetch(`${API_BASE}/reminders`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch reminders');
      return res.json();
    },

    create: async (reminder: InsertReminder): Promise<Reminder> => {
      const res = await fetch(`${API_BASE}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getHeaders() },
        body: JSON.stringify(reminder),
      });
      if (!res.ok) throw new Error('Failed to create reminder');
      return res.json();
    },

    toggle: async (id: string): Promise<Reminder> => {
      const res = await fetch(`${API_BASE}/reminders/${id}/toggle`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to toggle reminder');
      return res.json();
    },

    delete: async (id: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/reminders/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete reminder');
    },

    deleteAll: async (): Promise<void> => {
      const res = await fetch(`${API_BASE}/reminders`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete all reminders');
    },
  },
};
