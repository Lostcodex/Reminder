import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { addHours, format } from 'date-fns';

export type Category = 'Study' | 'Water' | 'Health' | 'Custom';
export type Repeat = 'None' | 'Daily' | 'Weekly';

export interface Reminder {
  id: string;
  title: string;
  category: Category;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:mm
  repeat: Repeat;
  notes?: string;
  completed: boolean;
  createdAt: number;
}

interface Settings {
  notifications: boolean;
  vibration: boolean;
  theme: 'light' | 'dark';
}

interface AppState {
  reminders: Reminder[];
  settings: Settings;
  
  addReminder: (reminder: Omit<Reminder, 'id' | 'completed' | 'createdAt'>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  quickAddWater: () => void;
  deleteEverything: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      reminders: [],
      settings: {
        notifications: true,
        vibration: true,
        theme: 'light',
      },

      addReminder: (reminder) => set((state) => ({
        reminders: [
          ...state.reminders,
          {
            ...reminder,
            id: uuidv4(),
            completed: false,
            createdAt: Date.now(),
          },
        ],
      })),

      toggleReminder: (id) => set((state) => ({
        reminders: state.reminders.map((r) =>
          r.id === id ? { ...r, completed: !r.completed } : r
        ),
      })),

      deleteReminder: (id) => set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== id),
      })),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),

      quickAddWater: () => set((state) => {
        const now = new Date();
        const nextWater = addHours(now, 1); // Reminder in 1 hour
        return {
          reminders: [
            ...state.reminders,
            {
              id: uuidv4(),
              title: 'Drink Water',
              category: 'Water',
              date: format(now, 'yyyy-MM-dd'),
              time: format(nextWater, 'HH:mm'),
              repeat: 'None',
              notes: 'Stay hydrated!',
              completed: false,
              createdAt: Date.now(),
            },
          ],
        };
      }),
      
      deleteEverything: () => set({ reminders: [] }),
    }),
    {
      name: 'daily-flow-storage',
    }
  )
);
