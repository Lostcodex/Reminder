import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  notifications: boolean;
  vibration: boolean;
  theme: 'light' | 'dark';
}

interface SettingsState {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        notifications: true,
        vibration: true,
        theme: 'light',
      },

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
    }),
    {
      name: 'daily-flow-settings',
    }
  )
);
