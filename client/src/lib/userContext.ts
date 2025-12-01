import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userId: string | null;
  name: string;
  sessionId: string;
  initializeSession: () => void;
  setUserName: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      name: 'Friend',
      sessionId: '',

      initializeSession: () => {
        set((state) => {
          if (!state.sessionId) {
            const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            return { sessionId: newSessionId };
          }
          return state;
        });
      },

      setUserName: (name) => {
        set({ name });
      },
    }),
    {
      name: 'daily-flow-user',
    }
  )
);
