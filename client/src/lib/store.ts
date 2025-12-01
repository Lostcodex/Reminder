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
    (set, get) => ({
      settings: {
        notifications: true,
        vibration: true,
        theme: 'light',
      },

      updateSettings: (newSettings) => {
        set((state) => {
          const updatedSettings = { ...state.settings, ...newSettings };
          
          // Apply dark mode to document
          if (newSettings.theme !== undefined) {
            if (newSettings.theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          
          return { settings: updatedSettings };
        });
      },
    }),
    {
      name: 'daily-flow-settings',
      onRehydrateStorage: () => (state) => {
        // Apply theme on initial load
        if (state?.settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
