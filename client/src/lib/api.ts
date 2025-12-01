import { type Reminder, type InsertReminder } from '@shared/schema';

const API_BASE = '/api';

export const api = {
  reminders: {
    getAll: async (): Promise<Reminder[]> => {
      const res = await fetch(`${API_BASE}/reminders`);
      if (!res.ok) throw new Error('Failed to fetch reminders');
      return res.json();
    },

    create: async (reminder: InsertReminder): Promise<Reminder> => {
      const res = await fetch(`${API_BASE}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminder),
      });
      if (!res.ok) throw new Error('Failed to create reminder');
      return res.json();
    },

    toggle: async (id: string): Promise<Reminder> => {
      const res = await fetch(`${API_BASE}/reminders/${id}/toggle`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to toggle reminder');
      return res.json();
    },

    delete: async (id: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/reminders/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete reminder');
    },

    deleteAll: async (): Promise<void> => {
      const res = await fetch(`${API_BASE}/reminders`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete all reminders');
    },
  },
};
